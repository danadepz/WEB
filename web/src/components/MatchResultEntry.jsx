import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Target,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { calculateMatchPoints, timeToSeconds, secondsToTime } from '../modules/scoringEngine';
import { useToast } from './ui/Toast';

const DURATION_PRESETS = [
  { label: '8:45 (Blitz)', seconds: 525 },
  { label: '12:30 (Standard)', seconds: 750 },
  { label: '16:15 (Extended)', seconds: 975 },
  { label: '22:00 (Epic)', seconds: 1320 },
];

const initialPlayerRows = (team, previousRows) => {
  if (Array.isArray(previousRows) && previousRows.length) {
    return previousRows.map((row) => ({ kills: 0, deaths: 0, assists: 0, ...row }));
  }
  return (team?.players || [])
    .filter((player) => player.active !== false)
    .map((player) => ({ playerId: player.id, playerName: player.name, kills: 0, deaths: 0, assists: 0 }));
};

function PlayerKdaEditor({ team, rows, onChange, onAddPlayers }) {
  const roster = team?.players || [];

  return (
    <section className="rounded-xl border border-[#252a31] bg-[#101317] p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="truncate text-xs font-bold text-slate-200">{team?.tag || 'Team'} player stats</h4>
        <span className="text-[9px] uppercase text-slate-500">K / D / A</span>
      </div>
      {rows.length ? (
        <div className="space-y-2">
          {rows.map((row, index) => {
            const player = roster.find((member) => member.id === row.playerId);
            const playerName = player?.name || row.playerName || `Unassigned legacy row ${index + 1}`;
            return (
              <div key={row.playerId || `legacy-${index}`} className="grid grid-cols-[minmax(0,1fr)_repeat(3,52px)] items-center gap-2">
                <div className="min-w-0">
                  <span className="block truncate text-[10px] font-medium text-slate-300">{playerName}</span>
                  {!row.playerId && <span className="text-[8px] text-slate-600">Legacy stats not linked to a roster member</span>}
                </div>
                {['kills', 'deaths', 'assists'].map((stat) => (
                  <input
                    key={stat}
                    type="number"
                    min="0"
                    aria-label={`${playerName} ${stat}`}
                    value={row[stat] ?? 0}
                    onChange={(event) => onChange(index, stat, Number.parseInt(event.target.value, 10) || 0)}
                    className="w-full rounded-md border border-[#303640] bg-[#090b0e] px-1.5 py-2 text-center font-mono text-[10px] text-white outline-none focus:border-sky-500"
                  />
                ))}
                {roster.some((player) => player.active !== false && !rows.some((row) => row.playerId === player.id)) && (
                  <button type="button" onClick={onAddPlayers} className="pt-1 text-[10px] font-semibold text-sky-300 hover:text-white">
                    Add current roster members
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-[#303640] px-3 py-3">
          <span className="text-[10px] text-slate-500">No active roster members</span>
          <Link to="/manage-teams" className="shrink-0 text-[10px] font-semibold text-sky-300 hover:text-sky-200">
            Manage roster
          </Link>
        </div>
      )}
    </section>
  );
}

export default function MatchResultEntry({ match, existingResult, onClose }) {
  const { activeGame, scoringConfig, lossPoints, updateMatchResult } = useTournament();
  const toast = useToast();
  const isValorant = activeGame === 'valorant';

  const [winner, setWinner] = useState(existingResult?.winnerTeamId || match.teamA?.id);
  const [killsA, setKillsA] = useState(existingResult?.killsA ?? '');
  const [killsB, setKillsB] = useState(existingResult?.killsB ?? '');
  const [objectivesA, setObjectivesA] = useState(existingResult?.objectivesA ?? '');
  const [objectivesB, setObjectivesB] = useState(existingResult?.objectivesB ?? '');
  const [notes, setNotes] = useState(existingResult?.notes || '');
    const [duration, setDuration] = useState(
    Number.isFinite(existingResult?.durationSeconds)
      ? secondsToTime(existingResult.durationSeconds)
      : ''
  );
  const [forfeit, setForfeit] = useState(Boolean(existingResult?.forfeit));
  const [error, setError] = useState('');
  const durationSeconds = timeToSeconds(duration);

  // Valorant KDA inputs - arrays for player stats
  const [playerAKDA, setPlayerAKDA] = useState(() => initialPlayerRows(match.teamA, existingResult?.playerAKDA));
  const [playerBKDA, setPlayerBKDA] = useState(() => initialPlayerRows(match.teamB, existingResult?.playerBKDA));

  const addRosterPlayers = (team, setRows) => {
    setRows((previous) => {
      const existingIds = new Set(previous.map((row) => row.playerId).filter(Boolean));
      const additions = (team?.players || [])
        .filter((player) => player.active !== false && !existingIds.has(player.id))
        .map((player) => ({ playerId: player.id, playerName: player.name, kills: 0, deaths: 0, assists: 0 }));
      return [...previous, ...additions];
    });
  };

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Live points preview calculation
  const pointsPreview = useMemo(() => {
    if (!winner || (!isValorant && !Number.isFinite(durationSeconds))) return null;
    const loserId = winner === match.teamA?.id ? match.teamB?.id : match.teamA?.id;
    const { winnerPoints, loserPoints } = calculateMatchPoints(
      winner,
      loserId,
      durationSeconds,
      scoringConfig,
      lossPoints,
      activeGame
    );

    const winnerTeam = winner === match.teamA?.id ? match.teamA : match.teamB;
    const loserTeam = winner === match.teamA?.id ? match.teamB : match.teamA;

    return {
      winnerPoints,
      loserPoints,
      winnerName: winnerTeam?.name || 'Winner',
      loserName: loserTeam?.name || 'Runner-up',
    };
  }, [winner, match, durationSeconds, scoringConfig, lossPoints, activeGame, isValorant]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!winner) {
      setError('Please select the winning department.');
      return;
    }

        if (!forfeit && !isValorant && !(Number.isFinite(durationSeconds) && durationSeconds > 0)) {
      setError('Enter a valid match duration in MM:SS format.');
      return;
    }

    const winnerIsA = winner === match.teamA?.id;
    let scoreA = killsA !== '' ? parseInt(killsA, 10) : undefined;
    let scoreB = killsB !== '' ? parseInt(killsB, 10) : undefined;

    if (isValorant) {
      if (forfeit) {
        // A forfeited map is recorded as 13-0.
        scoreA = winnerIsA ? 13 : 0;
        scoreB = winnerIsA ? 0 : 13;
      } else if (scoreA === undefined || scoreB === undefined) {
        setError('Enter the rounds won by both teams.');
        return;
      } else {
        const winnerScore = winnerIsA ? scoreA : scoreB;
        const loserScore = winnerIsA ? scoreB : scoreA;
        if (winnerScore <= loserScore) {
          setError('The selected winner must have more rounds than the other team.');
          return;
        }
      }
    }

    const loserId = winner === match.teamA?.id ? match.teamB?.id : match.teamA?.id;
    const { winnerPoints, loserPoints: pointsForLoser } = calculateMatchPoints(
      winner,
      loserId,
      durationSeconds,
      scoringConfig,
      lossPoints,
      activeGame
    );

    const result = {
      winnerTeamId: winner,
        forfeit: forfeit,
      durationSeconds: !forfeit && Number.isFinite(durationSeconds) ? durationSeconds : undefined,
      killsA: scoreA,
      killsB: scoreB,
      objectivesA: objectivesA !== '' ? parseInt(objectivesA, 10) : undefined,
      objectivesB: objectivesB !== '' ? parseInt(objectivesB, 10) : undefined,
      notes: notes.trim(),
      pointsA: winner === match.teamA?.id ? winnerPoints : pointsForLoser,
      pointsB: winner === match.teamB?.id ? winnerPoints : pointsForLoser,
      roundsA: isValorant ? scoreA : undefined,
      roundsB: isValorant ? scoreB : undefined,
      playerAKDA,
      playerBKDA,
    };

    updateMatchResult(match.id, result);
    toast.success('Match result saved and standings updated!');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-result-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto animate-slideInFromBottom">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 id="match-result-title" className="text-xl font-black text-white tracking-tight">
                {existingResult ? 'Edit Match Result' : 'Report Official Score'}
              </h3>
              <p className="text-xs text-slate-400">
                Round {match.roundNumber} {match.group ? `· Group ${match.group}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 pt-4">
          {/* Winner Selection Interactive Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Match Winner
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Team A Card */}
              <button
                type="button"
                onClick={() => setWinner(match.teamA?.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  winner === match.teamA?.id
                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(30,99,255,0.3)] ring-2 ring-blue-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {winner === match.teamA?.id && (
                  <span className="absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-2.5 mb-1.5">
                  {match.teamA?.logo ? (
                    <img
                      src={match.teamA.logo}
                      alt=""
                      className="w-7 h-7 rounded-xl object-cover border border-slate-700"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-xl bg-slate-800 text-[11px] font-black text-blue-400 grid place-items-center">
                      {match.teamA?.tag?.slice(0, 3) || 'A'}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400">Team A</span>
                </div>
                <span className="font-black text-sm text-white block truncate">
                  {match.teamA?.name}
                </span>
                <span className="text-xs text-blue-400 font-semibold">#{match.teamA?.tag}</span>
              </button>

              {/* Team B Card */}
              <button
                type="button"
                onClick={() => setWinner(match.teamB?.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  winner === match.teamB?.id
                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(30,99,255,0.3)] ring-2 ring-blue-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {winner === match.teamB?.id && (
                  <span className="absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-2.5 mb-1.5">
                  {match.teamB?.logo ? (
                    <img
                      src={match.teamB.logo}
                      alt=""
                      className="w-7 h-7 rounded-xl object-cover border border-slate-700"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-xl bg-slate-800 text-[11px] font-black text-blue-400 grid place-items-center">
                      {match.teamB?.tag?.slice(0, 3) || 'B'}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400">Team B</span>
                </div>
                <span className="font-black text-sm text-white block truncate">
                  {match.teamB?.name}
                </span>
                <span className="text-xs text-blue-400 font-semibold">#{match.teamB?.tag}</span>
              </button>
            </div>
          </div>


          {/* Live Points Preview Banner */}
          {pointsPreview && (
            <div className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-950/30 shadow-md space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-blue-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isValorant ? 'Valorant Match Points' : 'Live Points Calculation'}</span>
                {!isValorant && (
                  <span className="ml-auto font-mono text-slate-400">
                    {secondsToTime(durationSeconds)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200">
                <strong className="text-emerald-400">+{pointsPreview.winnerPoints} pts</strong> to{' '}
                {pointsPreview.winnerName} (Winner) ·{' '}
                <strong className="text-slate-400">+{pointsPreview.loserPoints} pts</strong> to{' '}
                {pointsPreview.loserName}
              </p>
            </div>
          )}

          {/* Kills / Rounds Won & Objectives */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {match.teamA?.tag || 'A'} {isValorant ? 'Rounds Won' : 'Total Kills'}
              </label>
              <input
                type="number"
                min="0"
                value={forfeit && isValorant ? (winner === match.teamA?.id ? '13' : '0') : killsA}
                disabled={forfeit && isValorant}
                onChange={(e) => setKillsA(e.target.value)}
                placeholder={isValorant ? 'e.g. 13' : 'e.g. 24'}
                className="w-full px-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {match.teamB?.tag || 'B'} {isValorant ? 'Rounds Won' : 'Total Kills'}
              </label>
              <input
                type="number"
                min="0"
                value={forfeit && isValorant ? (winner === match.teamB?.id ? '13' : '0') : killsB}
                disabled={forfeit && isValorant}
                onChange={(e) => setKillsB(e.target.value)}
                placeholder={isValorant ? 'e.g. 9' : 'e.g. 15'}
                className="w-full px-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {!isValorant && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    {match.teamA?.tag || 'A'} Towers / Lord
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={objectivesA}
                    onChange={(e) => setObjectivesA(e.target.value)}
                    placeholder="Objectives"
                    className="w-full px-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    {match.teamB?.tag || 'B'} Towers / Lord
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={objectivesB}
                    onChange={(e) => setObjectivesB(e.target.value)}
                    placeholder="Objectives"
                    className="w-full px-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <input
              type="checkbox"
              checked={forfeit}
              onChange={(e) => {
                setForfeit(e.target.checked);
                setError('');
              }}
              className="mt-0.5 h-4 w-4 accent-blue-500"
            />
            <span>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Forfeit
              </span>
              <span className="mt-1 block text-[11px] text-slate-500">
                {isValorant
                  ? 'The selected winner receives the win and the map is recorded as 13-0.'
                  : 'The selected winner receives the win. A forfeit has no duration and is excluded from the average win duration tiebreaker.'}
              </span>
            </span>
          </label>

          <section className={`rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-3 ${forfeit ? 'pointer-events-none opacity-40' : ''}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label
                  htmlFor="match-duration"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Match duration
                </label>
                <p id="match-duration-help" className="mt-1 text-[11px] text-slate-500">
                  {isValorant
                    ? 'Recorded for match details; Valorant points come from wins.'
                    : 'Used to calculate the official points.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <input
                  id="match-duration"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{1,3}:[0-5][0-9]"
                  maxLength={6}
                  required={!isValorant && !forfeit}
                  disabled={forfeit}
                  aria-describedby="match-duration-help"
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setError('');
                  }}
                  placeholder="MM:SS"
                  className="w-28 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-center font-mono text-sm font-bold text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.seconds}
                  type="button"
                  onClick={() => {
                    setDuration(secondsToTime(preset.seconds));
                    setError('');
                  }}
                  aria-pressed={durationSeconds === preset.seconds}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                    durationSeconds === preset.seconds
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-200'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <PlayerKdaEditor
              team={match.teamA}
              rows={playerAKDA}
              onChange={(index, stat, value) => setPlayerAKDA((previous) => previous.map((row, rowIndex) => rowIndex === index ? { ...row, [stat]: value } : row))}
              onAddPlayers={() => addRosterPlayers(match.teamA, setPlayerAKDA)}
            />
            <PlayerKdaEditor
              team={match.teamB}
              rows={playerBKDA}
              onChange={(index, stat, value) => setPlayerBKDA((previous) => previous.map((row, rowIndex) => rowIndex === index ? { ...row, [stat]: value } : row))}
              onAddPlayers={() => addRosterPlayers(match.teamB, setPlayerBKDA)}
            />
          </div>

          {/* Match Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Official Match Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. CCS Lord contest turnaround, MVP: John"
              className="w-full px-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              Save Official Result
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}