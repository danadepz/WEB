import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { saveTournament, loadTournament, clearTournament } from '../modules/storageService';
import { isFirebaseConfigured } from '../modules/firebase';
import {
  describeCloudError,
  fetchIsOrganizer,
  saveCloudTournament,
  stableStringify,
  subscribeToCloudTournament,
} from '../modules/cloudTournamentService';
import { useFirebaseAuth } from './FirebaseAuthContext';
import { generateGroupStage } from '../modules/roundRobinGenerator';
import { scheduleTimeSlots } from '../modules/timeScheduler';
import { computeStandings } from '../modules/standingsEngine';
import { resolveSchedule } from '../modules/teamHelpers';
import { DEFAULT_GAME, emptyGameMap, isValidGame } from '../modules/games';
import { SAMPLE_TOURNAMENT, SAMPLE_TEAMS, SAMPLE_SCORING_CONFIG } from '../modules/sampleData';

const TournamentContext = createContext();

const migrateSchedule = (schedule) =>
  (schedule || []).map((round) =>
    (round || []).map((match) => {
      if (match.teamAId && match.teamBId) return match;
      return {
        id: match.id,
        teamAId: match.teamA?.id ?? match.teamAId,
        teamBId: match.teamB?.id ?? match.teamBId,
        group: match.group,
      };
    })
  );

const assignDefaultGroups = (teams) => {
  const counters = emptyGameMap(() => 0);
  return teams.map((team) => {
    if (team.group) return team;
    const game = isValidGame(team.game) ? team.game : DEFAULT_GAME;
    const index = counters[game];
    counters[game] += 1;
    return { ...team, group: index < 6 ? 'A' : 'B' };
  });
};

const hasScheduleData = (schedulesByGame) =>
  schedulesByGame &&
  typeof schedulesByGame === 'object' &&
  (Object.keys(schedulesByGame).length > 0 ||
    (Array.isArray(schedulesByGame.mlbb) && schedulesByGame.mlbb.length > 0) ||
    (Array.isArray(schedulesByGame.valorant) && schedulesByGame.valorant.length > 0));

const migrateLoadedState = (loaded) => {
  const fallbackGame = isValidGame(loaded.tournament?.game)
    ? loaded.tournament.game
    : DEFAULT_GAME;

  let teams = (Array.isArray(loaded.teams) ? loaded.teams : []).map((team) => ({
    ...team,
    game: isValidGame(team.game) ? team.game : fallbackGame,
  }));
  teams = assignDefaultGroups(teams);

  let schedulesByGame = loaded.schedulesByGame;
  let matchResultsByGame = loaded.matchResultsByGame;
  const legacySchedule = Array.isArray(loaded.schedule) ? loaded.schedule : [];
  const needsLegacySchedule =
    !hasScheduleData(schedulesByGame) && legacySchedule.length > 0;

  if (needsLegacySchedule || !schedulesByGame || typeof schedulesByGame !== 'object') {
    schedulesByGame = emptyGameMap(() => []);
    if (legacySchedule.length > 0) {
      schedulesByGame[fallbackGame] = migrateSchedule(legacySchedule);
    }
  } else {
    schedulesByGame = {
      ...emptyGameMap(() => []),
      mlbb: migrateSchedule(schedulesByGame.mlbb),
      valorant: migrateSchedule(schedulesByGame.valorant),
    };
    if (
      !schedulesByGame.mlbb.length &&
      !schedulesByGame.valorant.length &&
      legacySchedule.length > 0
    ) {
      schedulesByGame[fallbackGame] = migrateSchedule(legacySchedule);
    }
  }

  const legacyResults =
    loaded.matchResults && typeof loaded.matchResults === 'object'
      ? loaded.matchResults
      : {};
  const needsLegacyResults =
    (!matchResultsByGame || typeof matchResultsByGame !== 'object') &&
    Object.keys(legacyResults).length > 0;

  if (needsLegacyResults || !matchResultsByGame || typeof matchResultsByGame !== 'object') {
    matchResultsByGame = emptyGameMap(() => ({}));
    matchResultsByGame[fallbackGame] = legacyResults;
  } else {
    matchResultsByGame = {
      ...emptyGameMap(() => ({})),
      mlbb:
        matchResultsByGame.mlbb && typeof matchResultsByGame.mlbb === 'object'
          ? matchResultsByGame.mlbb
          : {},
      valorant:
        matchResultsByGame.valorant && typeof matchResultsByGame.valorant === 'object'
          ? matchResultsByGame.valorant
          : {},
    };
    if (
      !Object.keys(matchResultsByGame.mlbb).length &&
      !Object.keys(matchResultsByGame.valorant).length &&
      Object.keys(legacyResults).length > 0
    ) {
      matchResultsByGame[fallbackGame] = legacyResults;
    }
  }

  return { teams, schedulesByGame, matchResultsByGame, fallbackGame };
};

export const TournamentProvider = ({ children }) => {
  const { user } = useFirebaseAuth();
  const [tournament, setTournament] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [schedulesByGame, setSchedulesByGame] = useState(() => emptyGameMap(() => []));
  const [matchResultsByGame, setMatchResultsByGame] = useState(() =>
    emptyGameMap(() => ({}))
  );
  const [activeGame, setActiveGameState] = useState(DEFAULT_GAME);
  const [scoringConfig, setScoringConfig] = useState([]);
  const [lossPoints, setLossPoints] = useState(0);
  const [tournamentStartTime, setTournamentStartTime] = useState(null);
  const [roundDurationMinutes, setRoundDurationMinutes] = useState(20);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(5);
  const [numberOfLobbies, setNumberOfLobbies] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [cloudReady, setCloudReady] = useState(!isFirebaseConfigured);
  const [cloudRecordExists, setCloudRecordExists] = useState(false);
  const [cloudStatus, setCloudStatus] = useState(
    isFirebaseConfigured ? 'loading' : 'local'
  );
  const [cloudError, setCloudError] = useState('');
  const [cloudWritesBlocked, setCloudWritesBlocked] = useState(false);
  const [syncNonce, setSyncNonce] = useState(0);
  const remoteDataRef = useRef(null);
  const writesBlockedRef = useRef(false);

  const setWritesBlocked = useCallback((blocked) => {
    writesBlockedRef.current = blocked;
    setCloudWritesBlocked(blocked);
  }, []);

  const setActiveGame = useCallback((gameId) => {
    if (isValidGame(gameId)) setActiveGameState(gameId);
  }, []);

  const teams = useMemo(
    () => allTeams.filter((team) => (team.game || DEFAULT_GAME) === activeGame),
    [allTeams, activeGame]
  );

  const schedule = useMemo(
    () => schedulesByGame[activeGame] || [],
    [schedulesByGame, activeGame]
  );

  const matchResults = useMemo(
    () => matchResultsByGame[activeGame] || {},
    [matchResultsByGame, activeGame]
  );

  const resolvedSchedule = useMemo(
    () => resolveSchedule(schedule, allTeams),
    [schedule, allTeams]
  );

  const standings = useMemo(
    () => computeStandings(teams, schedule, matchResults, activeGame),
    [teams, schedule, matchResults, activeGame]
  );

  const scheduledTimeSlots = useMemo(() => {
    if (!tournamentStartTime || schedule.length === 0) return [];
    return scheduleTimeSlots(
      tournamentStartTime,
      roundDurationMinutes,
      breakDurationMinutes,
      numberOfLobbies,
      schedule
    );
  }, [
    tournamentStartTime,
    schedule,
    roundDurationMinutes,
    breakDurationMinutes,
    numberOfLobbies,
  ]);

  const getTeamsForGame = useCallback(
    (gameId) => allTeams.filter((team) => (team.game || DEFAULT_GAME) === gameId),
    [allTeams]
  );

  const getScheduleForGame = useCallback(
    (gameId) => resolveSchedule(schedulesByGame[gameId] || [], allTeams),
    [schedulesByGame, allTeams]
  );

  const getMatchResultsForGame = useCallback(
    (gameId) => matchResultsByGame[gameId] || {},
    [matchResultsByGame]
  );

  const getStandingsForGame = useCallback(
    (gameId) => {
      const gameTeams = allTeams.filter((team) => (team.game || DEFAULT_GAME) === gameId);
      const gameSchedule = schedulesByGame[gameId] || [];
      const gameResults = matchResultsByGame[gameId] || {};
      return computeStandings(gameTeams, gameSchedule, gameResults, gameId);
    },
    [allTeams, schedulesByGame, matchResultsByGame]
  );

  const persistedState = useMemo(() => ({
    tournament,
    teams: allTeams,
    schedulesByGame,
    matchResultsByGame,
    activeGame,
    // legacy flat keys kept empty for older readers
    schedule: [],
    matchResults: {},
    scoringConfig,
    lossPoints,
    tournamentStartTime: tournamentStartTime
      ? tournamentStartTime.toISOString()
      : null,
    roundDurationMinutes,
    breakDurationMinutes,
    numberOfLobbies,
  }), [
    tournament,
    allTeams,
    schedulesByGame,
    matchResultsByGame,
    activeGame,
    scoringConfig,
    lossPoints,
    tournamentStartTime,
    roundDurationMinutes,
    breakDurationMinutes,
    numberOfLobbies,
  ]);

  const applyLoadedState = useCallback((loaded) => {
    const migrated = migrateLoadedState(loaded);
    setTournament(loaded.tournament || null);
    setAllTeams(migrated.teams);
    setSchedulesByGame(migrated.schedulesByGame);
    setMatchResultsByGame(migrated.matchResultsByGame);
    setActiveGameState(
      isValidGame(loaded.activeGame) ? loaded.activeGame : migrated.fallbackGame
    );
    setScoringConfig(Array.isArray(loaded.scoringConfig) ? loaded.scoringConfig : []);
    setLossPoints(Number.isFinite(loaded.lossPoints) ? loaded.lossPoints : 0);
    setTournamentStartTime(
      loaded.tournamentStartTime ? new Date(loaded.tournamentStartTime) : null
    );
    setRoundDurationMinutes(
      Number.isFinite(loaded.roundDurationMinutes) ? loaded.roundDurationMinutes : 20
    );
    setBreakDurationMinutes(
      Number.isFinite(loaded.breakDurationMinutes) ? loaded.breakDurationMinutes : 5
    );
    setNumberOfLobbies(
      Number.isFinite(loaded.numberOfLobbies) ? loaded.numberOfLobbies : 1
    );
  }, []);

  useEffect(() => {
    const loaded = loadTournament();
    if (loaded) applyLoadedState(loaded);
    setHydrated(true);
  }, [applyLoadedState]);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    return subscribeToCloudTournament(
      (remoteData) => {
        setCloudRecordExists(remoteData !== null);
        remoteDataRef.current = remoteData === null ? null : stableStringify(remoteData);
        if (remoteData !== null) {
          applyLoadedState(remoteData);
        }
        // Keep the sticky local-only note when cloud writes are blocked
        // instead of flipping back to "synced" on every snapshot.
        if (writesBlockedRef.current) {
          setCloudStatus('local');
        } else {
          setCloudStatus(remoteData !== null ? 'synced' : 'local');
          setCloudError('');
        }
        setCloudReady(true);
      },
      (error) => {
        console.error('Could not load tournament from Firestore', error);
        setCloudError(describeCloudError(error));
        setCloudStatus('error');
        setCloudReady(true);
      }
    );
  }, [applyLoadedState, syncNonce]);

  // Probe once per signed-in account: if it is not a registered organizer,
  // stop attempting cloud writes instead of failing on every change.
  useEffect(() => {
    if (!isFirebaseConfigured || !user) {
      setWritesBlocked(false);
      return undefined;
    }
    let cancelled = false;
    fetchIsOrganizer(user.uid)
      .then((isOrganizer) => {
        if (cancelled || isOrganizer !== false) return;
        setWritesBlocked(true);
        setCloudStatus('local');
        setCloudError(
          'This account is not registered as an organizer, so cloud sync is disabled. Tournament data is stored on this device only.'
        );
      })
      .catch(() => {
        // Connectivity problems surface through the normal sync path.
      });
    return () => {
      cancelled = true;
    };
  }, [user, setWritesBlocked]);

  useEffect(() => {
    if (!hydrated) return;
    if (persistedState.tournament) {
      saveTournament(persistedState);
    } else {
      clearTournament();
    }
  }, [hydrated, persistedState]);

  useEffect(() => {
    if (
      !isFirebaseConfigured ||
      !cloudReady ||
      !user ||
      cloudWritesBlocked ||
      (!persistedState.tournament && !cloudRecordExists)
    ) {
      return undefined;
    }

    const cloudData = JSON.parse(JSON.stringify(persistedState));
    const serializedState = stableStringify(cloudData);
    if (serializedState === remoteDataRef.current) {
      setCloudStatus('synced');
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      setCloudStatus('saving');
      try {
        await saveCloudTournament(cloudData, user.uid);
        remoteDataRef.current = serializedState;
        setCloudRecordExists(true);
        setCloudStatus('synced');
        setCloudError('');
      } catch (error) {
        console.error('Could not save tournament to Firestore', error);
        if (error?.code === 'permission-denied') {
          // Retrying cannot fix permissions — drop to local-only mode with one
          // clear message instead of erroring on every subsequent change.
          setWritesBlocked(true);
          setCloudStatus('local');
          setCloudError(
            'Firestore rejected this account for cloud saves (organizer access required). Everything is stored locally on this device.'
          );
        } else {
          setCloudError(describeCloudError(error));
          setCloudStatus('error');
        }
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [cloudReady, cloudRecordExists, persistedState, user, cloudWritesBlocked, setWritesBlocked]);

  // Manual recovery: re-subscribe and re-attempt any pending cloud save.
  const retryCloudSync = useCallback(() => {
    if (!isFirebaseConfigured) return;
    setWritesBlocked(false);
    setCloudError('');
    setCloudStatus('loading');
    setSyncNonce((nonce) => nonce + 1);
  }, [setWritesBlocked]);

  const updateTournament = (newTournament) => {
    setTournament(newTournament);
  };

  const addTeam = (team) => {
    const game = isValidGame(team.game) ? team.game : activeGame;
    setAllTeams((prev) => [...prev, { ...team, game }]);
  };

  const rebuildAffectedGames = (updatedTeams, gameIds) => {
    const games = [...new Set(gameIds.filter(Boolean))];
    setSchedulesByGame((prevSchedules) => {
      let next = prevSchedules;
      const clearedGames = [];
      games.forEach((gameId) => {
        const existing = next[gameId] || [];
        if (!existing.length) return;
        const remaining = updatedTeams.filter(
          (team) => (team.game || DEFAULT_GAME) === gameId
        );
        next = {
          ...next,
          [gameId]: remaining.length >= 2 ? generateGroupStage(remaining) : [],
        };
        clearedGames.push(gameId);
      });
      if (clearedGames.length) {
        setMatchResultsByGame((prevResults) => {
          let results = prevResults;
          clearedGames.forEach((gameId) => {
            results = { ...results, [gameId]: {} };
          });
          return results;
        });
      }
      return next;
    });
  };

  const updateTeam = (updatedTeam) => {
    setAllTeams((prev) => {
      const existing = prev.find((team) => team.id === updatedTeam.id);
      const nextGame = isValidGame(updatedTeam.game)
        ? updatedTeam.game
        : existing?.game || activeGame;
      const prevGame = existing?.game || activeGame;
      const updatedTeams = prev.map((team) =>
        team.id === updatedTeam.id
          ? { ...team, ...updatedTeam, game: nextGame }
          : team
      );

      if (prevGame !== nextGame) {
        rebuildAffectedGames(updatedTeams, [prevGame, nextGame]);
      }

      return updatedTeams;
    });
  };

  const deleteTeams = (teamIds) => {
    const teamIdSet = new Set(teamIds);
    setAllTeams((prev) => {
      const removedTeams = prev.filter((team) => teamIdSet.has(team.id));
      const updatedTeams = prev.filter((team) => !teamIdSet.has(team.id));
      rebuildAffectedGames(
        updatedTeams,
        removedTeams.map((team) => team.game || activeGame)
      );
      return updatedTeams;
    });
  };

  const deleteTeam = (teamId) => deleteTeams([teamId]);

  const clearActiveGameSchedule = () => {
    setSchedulesByGame((prev) => ({ ...prev, [activeGame]: [] }));
    setMatchResultsByGame((prev) => ({ ...prev, [activeGame]: {} }));
  };

  const generateSchedule = () => {
    if (teams.length < 2) {
      alert(`Need at least 2 ${activeGame.toUpperCase()} teams to generate a schedule.`);
      return;
    }
    setSchedulesByGame((prev) => ({
      ...prev,
      [activeGame]: generateGroupStage(teams),
    }));
    setMatchResultsByGame((prev) => ({
      ...prev,
      [activeGame]: {},
    }));
  };

  const regenerateSchedule = () => {
    generateSchedule();
  };

  const resetTournament = () => {
    setTournament(null);
    setAllTeams([]);
    setSchedulesByGame(emptyGameMap(() => []));
    setMatchResultsByGame(emptyGameMap(() => ({})));
    setActiveGameState(DEFAULT_GAME);
    setScoringConfig([]);
    setLossPoints(0);
    setTournamentStartTime(null);
    setRoundDurationMinutes(20);
    setBreakDurationMinutes(5);
    setNumberOfLobbies(1);
    clearTournament();
  };

  const seedSampleData = () => {
    const mlbbTeams = SAMPLE_TEAMS.filter((t) => t.game === 'mlbb');
    const valTeams = SAMPLE_TEAMS.filter((t) => t.game === 'valorant');
    const mlbbSchedule = generateGroupStage(mlbbTeams);
    const valSchedule = generateGroupStage(valTeams);

    // Initial match results for round 1
    const mlbbRound1 = mlbbSchedule[0] || [];
    const mlbbResults = {};
    if (mlbbRound1[0]) {
      mlbbResults[mlbbRound1[0].id] = {
        winnerTeamId: mlbbRound1[0].teamAId,
        durationSeconds: 580,
        killsA: 18,
        killsB: 6,
        objectivesA: 8,
        objectivesB: 1,
        pointsA: 5,
        pointsB: 0,
        notes: 'Dominant early push by CCS',
      };
    }
    if (mlbbRound1[1]) {
      mlbbResults[mlbbRound1[1].id] = {
        winnerTeamId: mlbbRound1[1].teamBId,
        durationSeconds: 840,
        killsA: 12,
        killsB: 19,
        objectivesA: 4,
        objectivesB: 7,
        pointsA: 0,
        pointsB: 4,
        notes: 'Late teamfight turnaround',
      };
    }

    const valRound1 = valSchedule[0] || [];
    const valResults = {};
    if (valRound1[0]) {
      valResults[valRound1[0].id] = {
        winnerTeamId: valRound1[0].teamAId,
        durationSeconds: 1920,
        roundsA: 13,
        roundsB: 7,
        killsA: 13,
        killsB: 7,
        pointsA: 3,
        pointsB: 0,
        notes: 'Ascent map control by CCS',
      };
    }

    setTournament(SAMPLE_TOURNAMENT);
    setAllTeams(SAMPLE_TEAMS);
    setSchedulesByGame({
      mlbb: mlbbSchedule,
      valorant: valSchedule,
    });
    setMatchResultsByGame({
      mlbb: mlbbResults,
      valorant: valResults,
    });
    setScoringConfig(SAMPLE_SCORING_CONFIG);
    setLossPoints(0);
    setTournamentStartTime(new Date('2026-10-15T09:00:00'));
    setRoundDurationMinutes(25);
    setBreakDurationMinutes(10);
    setNumberOfLobbies(2);
    setActiveGameState(DEFAULT_GAME);
  };

  const updateMatchResult = (matchId, result) => {
    setMatchResultsByGame((prev) => ({
      ...prev,
      [activeGame]: {
        ...(prev[activeGame] || {}),
        [matchId]: result,
      },
    }));
  };

  const deleteMatchResult = (matchId) => {
    setMatchResultsByGame((prev) => {
      const nextGame = { ...(prev[activeGame] || {}) };
      delete nextGame[matchId];
      return { ...prev, [activeGame]: nextGame };
    });
  };

  const updateScoringConfig = (newConfig, newLossPoints) => {
    setScoringConfig(newConfig);
    setLossPoints(newLossPoints);
  };

  const value = {
    tournament,
    updateTournament,
    activeGame,
    setActiveGame,
    allTeams,
    teams,
    addTeam,
    updateTeam,
    deleteTeam,
    deleteTeams,
    schedule: resolvedSchedule,
    rawSchedule: schedule,
    generateSchedule,
    regenerateSchedule,
    matchResults,
    updateMatchResult,
    deleteMatchResult,
    standings,
    scheduledTimeSlots,
    scoringConfig,
    lossPoints,
    setScoringConfig,
    setLossPoints,
    updateScoringConfig,
    tournamentStartTime,
    setTournamentStartTimeFunc: setTournamentStartTime,
    roundDurationMinutes,
    setRoundDuration: setRoundDurationMinutes,
    breakDurationMinutes,
    setBreakDuration: setBreakDurationMinutes,
    numberOfLobbies,
    setNumberOfLobbiesFunc: setNumberOfLobbies,
    resetTournament,
    seedSampleData,
    clearActiveGameSchedule,
    getTeamsForGame,
    getScheduleForGame,
    getMatchResultsForGame,
    getStandingsForGame,
    cloudStatus,
    cloudError,
    retryCloudSync,
  };

  return (
    <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
