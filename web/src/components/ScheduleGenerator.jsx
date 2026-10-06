import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  RotateCcw,
  Trash2,
  Trophy,
  Filter,
  CheckCircle2,
  Gamepad2,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { secondsToTime } from '../modules/scoringEngine';
import { gameLabel, gameShort } from '../modules/games';
import MatchResultEntry from './MatchResultEntry';
import ConfirmModal from './ui/ConfirmModal';
import { useToast } from './ui/Toast';

export default function ScheduleGenerator() {
  const {
    teams,
    schedule,
    generateSchedule,
    regenerateSchedule,
    resetTournament,
    clearActiveGameSchedule,
    matchResults,
    deleteMatchResult,
    scheduledTimeSlots,
    activeGame,
    setActiveGame,
  } = useTournament();

  const toast = useToast();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(true);
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');

  // Confirmation Modals State
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmClearGame, setConfirmClearGame] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  const canGenerate = teams.length >= 2;
  const hasSchedule = schedule.length > 0;

  const handleGenerate = () => {
    if (!canGenerate) {
      toast.error(`Please register at least 2 ${gameShort(activeGame)} departments before generating a schedule.`);
      return;
    }
    generateSchedule();
    toast.success(`Generated official round-robin schedule for ${gameShort(activeGame)}!`);
  };

  const handleRegenerateConfirm = () => {
    regenerateSchedule();
    toast.success(`Regenerated ${gameShort(activeGame)} schedule. Results reset.`);
    setConfirmRegenerate(false);
  };

  const handleClearGameConfirm = () => {
    clearActiveGameSchedule();
    toast.success(`Cleared ${gameShort(activeGame)} schedule and scores.`);
    setConfirmClearGame(false);
  };

  const handleResetAllConfirm = () => {
    resetTournament();
    toast.info('Tournament reset to clean state.');
    setConfirmResetAll(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Match Result Modal */}
      {selectedMatch && (
        <MatchResultEntry
          match={selectedMatch}
          existingResult={matchResults[selectedMatch.id]}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmRegenerate}
        title="Regenerate Schedule"
        message={`Regenerating the ${gameShort(activeGame)} schedule will erase all reported match results for this game. Do you wish to continue?`}
        confirmText="Regenerate"
        isDestructive={true}
        onConfirm={handleRegenerateConfirm}
        onCancel={() => setConfirmRegenerate(false)}
      />

      <ConfirmModal
        isOpen={confirmClearGame}
        title="Clear Game Schedule"
        message={`Clear the ${gameShort(activeGame)} schedule and all its match results? Registered departments will be kept.`}
        confirmText="Clear Schedule"
        isDestructive={true}
        onConfirm={handleClearGameConfirm}
        onCancel={() => setConfirmClearGame(false)}
      />

      <ConfirmModal
        isOpen={confirmResetAll}
        title="Reset Entire Tournament"
        message="This will permanently delete ALL departments, schedules, and scores across both MLBB and Valorant. This action cannot be undone."
        confirmText="Reset Entire Tournament"
        isDestructive={true}
        onConfirm={handleResetAllConfirm}
        onCancel={() => setConfirmResetAll(false)}
      />

      {/* Header Banner */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Schedule Generator & Waves
            </h1>
          </div>
          <p className="text-sm text-slate-300">
            Generate and manage round-robin matchups with automated time slot wave scheduling for {gameLabel(activeGame)}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {!hasSchedule && canGenerate && (
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg active:scale-95 transition-all"
            >
              Generate {gameShort(activeGame)} Schedule
            </button>
          )}

          {hasSchedule && (
            <>
              <button
                type="button"
                onClick={() => setConfirmRegenerate(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>Regenerate</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearGame(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Clear Game</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetAll(true)}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
              >
                Reset All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Game Switcher & View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
        {/* Game Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveGame('mlbb')}
            className={`flex-1 sm:flex-initial flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeGame === 'mlbb'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Mobile Legends: Bang Bang</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveGame('valorant')}
            className={`flex-1 sm:flex-initial flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeGame === 'valorant'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Valorant</span>
          </button>
        </div>

        {/* Toggle Time Slots */}
        {hasSchedule && (
          <button
            type="button"
            onClick={() => setShowTimeSlots(!showTimeSlots)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{showTimeSlots ? 'Hide Time Slots' : 'Show Time Slots'}</span>
          </button>
        )}
      </div>

      {/* Filter Row: Group & Status Filters */}
      {hasSchedule && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg">
          {/* Group Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pools:
            </span>
            <div className="flex gap-1">
              {['all', 'A', 'B'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroupFilter(g)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    groupFilter === g
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  {g === 'all' ? 'All Pools' : `Group ${g}`}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status:
            </span>
            <div className="flex gap-1">
              {['all', 'pending', 'completed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Rounds List */}
      {!teams.length ? (
        <div className="py-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Departments Registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Please register at least 2 {gameShort(activeGame)} departments before generating a schedule.
          </p>
        </div>
      ) : !hasSchedule ? (
        <div className="py-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-4">
          <Calendar className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
          <h3 className="text-xl font-black text-white">Schedule Ready to Build</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {teams.length} departments registered for {gameLabel(activeGame)}. Click below to generate the single round-robin group stage schedule.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-xl active:scale-95 transition-all"
            >
              Generate {gameShort(activeGame)} Group Stage Schedule
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {schedule.map((round, roundIndex) => {
            const timeSlot = scheduledTimeSlots[roundIndex];

            // Filter matches in round
            const filteredRoundMatches = round.filter((match) => {
              if (groupFilter !== 'all' && (match.group || 'A') !== groupFilter) return false;
              const hasRes = !!matchResults[match.id];
              if (statusFilter === 'pending' && hasRes) return false;
              if (statusFilter === 'completed' && !hasRes) return false;
              return true;
            });

            if (filteredRoundMatches.length === 0) return null;

            return (
              <div
                key={roundIndex}
                className="rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 shadow-xl backdrop-blur-md space-y-4"
              >
                {/* Round Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-black uppercase tracking-wider">
                      Round {roundIndex + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {filteredRoundMatches.length} Matches in this round
                    </span>
                  </div>

                  {showTimeSlots && timeSlot && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        {timeSlot.startTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        –{' '}
                        {timeSlot.endTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {timeSlot.waves > 1 && (
                        <span className="text-[10px] text-blue-400 font-bold">
                          ({timeSlot.waves} Waves)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Match Cards in Round */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRoundMatches.map((match) => {
                    const result = matchResults[match.id];
                    const winner =
                      result?.winnerTeamId === match.teamA?.id ? match.teamA : match.teamB;

                    return (
                      <div
                        key={match.id}
                        className="p-4 rounded-2xl border border-slate-800/90 bg-slate-950/60 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4 group"
                      >
                        {/* Match Header: Group and Status */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                            Group {match.group || 'A'}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              result
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {result ? 'Completed' : 'Pending'}
                          </span>
                        </div>

                        {/* Versus Display */}
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1">
                          {/* Team A */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            {match.teamA?.logo ? (
                              <img
                                src={match.teamA.logo}
                                alt=""
                                className="w-8 h-8 rounded-xl object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <span className="w-8 h-8 rounded-xl bg-slate-800 text-[10px] font-black text-blue-400 grid place-items-center shrink-0">
                                {match.teamA?.tag?.slice(0, 3) || 'A'}
                              </span>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-white block truncate">
                                {match.teamA?.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                #{match.teamA?.tag}
                              </span>
                            </div>
                          </div>

                          <span className="text-center font-black text-xs text-slate-500 px-2">
                            VS
                          </span>

                          {/* Team B */}
                          <div className="flex items-center justify-end gap-2.5 min-w-0 text-right">
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-white block truncate">
                                {match.teamB?.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                #{match.teamB?.tag}
                              </span>
                            </div>
                            {match.teamB?.logo ? (
                              <img
                                src={match.teamB.logo}
                                alt=""
                                className="w-8 h-8 rounded-xl object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <span className="w-8 h-8 rounded-xl bg-slate-800 text-[10px] font-black text-blue-400 grid place-items-center shrink-0">
                                {match.teamB?.tag?.slice(0, 3) || 'B'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Outcome / Result Footer */}
                        <div className="pt-2 border-t border-slate-800/80">
                          {result ? (
                            <div className="flex items-center justify-between text-xs">
                              <div className="text-slate-300">
                                Winner: <strong className="text-white">{winner?.name}</strong>
                                <span className="text-slate-500 ml-1">
                                  ({secondsToTime(result.durationSeconds)})
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedMatch(match)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm('Clear match result?')) {
                                      deleteMatchResult(match.id);
                                    }
                                  }}
                                  className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Clear result"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedMatch(match)}
                              className="w-full py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-bold transition-all shadow-sm"
                            >
                              Enter Official Score
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}