import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Flame, Gamepad2, Search, ShieldCheck, Sparkles, Trash2, Users } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { gameShort } from '../modules/games';
import MatchResultEntry from './MatchResultEntry';
import ConfirmModal from './ui/ConfirmModal';
import { useToast } from './ui/Toast';

function TeamLine({ team }) {
  if (!team) return <span className="text-slate-600">TBD</span>;
  return (
    <span className="flex min-w-0 items-center gap-2">
      {team.logo ? (
        <img src={team.logo} alt="" className="h-7 w-7 shrink-0 rounded-full border border-[#343a43] object-cover" />
      ) : (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#343a43] bg-[#181d23] text-[9px] font-bold text-slate-300">{team.tag?.slice(0, 2) || 'TM'}</span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-semibold text-slate-100">{team.name}</span>
        <span className="block text-[9px] text-slate-500">#{team.tag}</span>
      </span>
    </span>
  );
}

function SyncStatusLine({ status, error, onRetry, className = '' }) {
  const label = {
    loading: 'Connecting to cloud',
    saving: 'Saving to cloud',
    synced: 'Cloud synced',
    error: 'Cloud sync issue',
    local: 'Local only',
  }[status];
  return (
    <p
      role={error ? 'alert' : 'status'}
      title={error || undefined}
      className={`${status === 'error' ? 'text-rose-300' : 'text-slate-500'} ${className}`}
    >
      {label}{error ? `: ${error}` : ''}
      {error && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-2 rounded border border-sky-700/60 px-1.5 py-0.5 align-middle font-bold text-sky-300 transition-colors hover:bg-sky-800/40"
        >
          Retry sync
        </button>
      )}
    </p>
  );
}

export default function ControlRoomPage() {
  const {
    tournament,
    teams,
    allTeams,
    schedule,
    matchResults,
    activeGame,
    setActiveGame,
    deleteMatchResult,
    seedSampleData,
    cloudStatus,
    cloudError,
    retryCloudSync,
  } = useTournament();
  const toast = useToast();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [clearTarget, setClearTarget] = useState(null);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const [query, setQuery] = useState('');
  const [roundFilter, setRoundFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  const matches = useMemo(() => schedule.flatMap((round, roundIndex) =>
    round.map((match) => ({ ...match, roundNumber: roundIndex + 1 }))
  ), [schedule]);
  const completed = matches.filter((match) => matchResults[match.id]).length;
  const visibleMatches = matches.filter((match) => {
    const result = matchResults[match.id];
    if (roundFilter !== 'all' && match.roundNumber !== Number(roundFilter)) return false;
    if (resultFilter === 'pending' && result) return false;
    if (resultFilter === 'completed' && !result) return false;
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return [match.teamA?.name, match.teamA?.tag, match.teamB?.name, match.teamB?.tag]
      .some((value) => value?.toLowerCase().includes(term));
  });

  const confirmDemo = () => {
    seedSampleData();
    setShowDemoConfirm(false);
    toast.success('Demo tournament loaded.');
  };

  const confirmClear = () => {
    if (!clearTarget) return;
    deleteMatchResult(clearTarget.id);
    setClearTarget(null);
    toast.success('Match score cleared.');
  };

  if (!tournament) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section className="rounded-lg border border-[#252a31] bg-[#101317] p-5 sm:p-7">
          <p className="text-[10px] font-bold uppercase text-sky-300">Admin</p>
          <h1 className="mt-1 text-xl font-extrabold text-slate-100">Control Room</h1>
          <SyncStatusLine
            status={cloudStatus}
            error={cloudError}
            onRetry={retryCloudSync}
            className="mt-2 text-xs"
          />
          <p className="mt-2 text-xs text-slate-500">Set up a tournament or load sample data to get started.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowDemoConfirm(true)} className="inline-flex items-center gap-2 rounded-md bg-sky-800 px-3 py-2 text-xs font-bold text-white hover:bg-sky-700">
              <Sparkles className="h-3.5 w-3.5" /> Load demo
            </button>
            <Link to="/setup" className="rounded-md border border-[#343a43] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white">Tournament setup</Link>
          </div>
          <ConfirmModal isOpen={showDemoConfirm} title="Load demo tournament?" message="This replaces the current tournament, team, schedule, and match-result data in this browser." confirmText="Load demo" onConfirm={confirmDemo} onCancel={() => setShowDemoConfirm(false)} />
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6 sm:py-7">
      {selectedMatch && (
        <MatchResultEntry
          match={selectedMatch}
          existingResult={matchResults[selectedMatch.id]}
          onClose={() => setSelectedMatch(null)}
        />
      )}
      <ConfirmModal
        isOpen={!!clearTarget}
        title="Clear this result?"
        message={`Remove the saved result for ${clearTarget?.teamA?.name || 'Team A'} vs ${clearTarget?.teamB?.name || 'Team B'}?`}
        confirmText="Clear result"
        isDestructive
        onConfirm={confirmClear}
        onCancel={() => setClearTarget(null)}
      />
      <ConfirmModal
        isOpen={showDemoConfirm}
        title="Load demo tournament?"
        message="This replaces the current tournament, team, schedule, and result data in this browser."
        confirmText="Load demo"
        onConfirm={confirmDemo}
        onCancel={() => setShowDemoConfirm(false)}
      />

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252a31] pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#36506a] bg-[#14202b] text-sky-300"><ShieldCheck className="h-4 w-4" /></span>
          <div>
            <p className="text-[9px] font-bold uppercase text-sky-300">Organizer</p>
            <h1 className="text-base font-extrabold text-slate-100">Control Room</h1>
            <SyncStatusLine
              status={cloudStatus}
              error={cloudError}
              onRetry={retryCloudSync}
              className="text-[9px]"
            />
          </div>
          <span className="hidden border-l border-[#303640] pl-3 text-xs text-slate-500 sm:block">{tournament.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/manage-teams" className="inline-flex items-center gap-1.5 rounded-md border border-[#303640] px-3 py-2 text-[10px] font-semibold text-slate-300 hover:border-sky-700 hover:text-white">
            <Users className="h-3.5 w-3.5" /> Teams & players
          </Link>
          <button type="button" onClick={() => setShowDemoConfirm(true)} className="grid h-8 w-8 place-items-center rounded-md border border-[#303640] text-slate-500 hover:text-slate-100" title="Load demo data" aria-label="Load demo data">
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-[#292e35] bg-[#101317] p-1" role="group" aria-label="Select game">
          <button type="button" onClick={() => { setSelectedMatch(null); setActiveGame('mlbb'); }} aria-pressed={activeGame === 'mlbb'} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[10px] font-bold ${activeGame === 'mlbb' ? 'bg-[#1a2732] text-sky-200' : 'text-slate-500 hover:text-white'}`}>
            <Gamepad2 className="h-3.5 w-3.5" /> MLBB
          </button>
          <button type="button" onClick={() => { setSelectedMatch(null); setActiveGame('valorant'); }} aria-pressed={activeGame === 'valorant'} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[10px] font-bold ${activeGame === 'valorant' ? 'bg-[#1a2732] text-sky-200' : 'text-slate-500 hover:text-white'}`}>
            <Flame className="h-3.5 w-3.5" /> VALORANT
          </button>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500">
          <span><strong className="text-slate-200">{teams.length}</strong> teams</span>
          <span><strong className="text-slate-200">{completed}/{matches.length}</strong> scored</span>
          <span><strong className="text-slate-200">{allTeams.reduce((total, team) => total + (team.players || []).filter((player) => player.active !== false).length, 0)}</strong> players</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#252a31] bg-[#101317]">
        <div className="flex flex-col gap-2 border-b border-[#252a31] p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search matches or teams" className="w-full rounded-md border border-[#2b3037] bg-[#090b0e] py-2 pl-9 pr-3 text-[11px] text-white outline-none focus:border-sky-600" />
          </div>
          <select value={roundFilter} onChange={(event) => setRoundFilter(event.target.value)} aria-label="Filter by round" className="rounded-md border border-[#2b3037] bg-[#090b0e] px-3 py-2 text-[10px] text-slate-300 outline-none focus:border-sky-600">
            <option value="all">All rounds</option>
            {schedule.map((_, index) => <option key={index} value={index + 1}>Round {index + 1}</option>)}
          </select>
          <div className="flex items-center gap-1">
            {['all', 'pending', 'completed'].map((filter) => (
              <button key={filter} type="button" onClick={() => setResultFilter(filter)} aria-pressed={resultFilter === filter} className={`rounded-md px-2.5 py-2 text-[9px] font-bold capitalize ${resultFilter === filter ? 'bg-[#263747] text-sky-200' : 'text-slate-500 hover:text-white'}`}>{filter}</button>
            ))}
          </div>
        </div>

        {matches.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead className="bg-[#14171b] text-[9px] font-bold uppercase text-slate-500">
                <tr><th className="px-3 py-2.5">Round</th><th className="px-3 py-2.5">Match</th><th className="px-3 py-2.5 text-center">Score</th><th className="px-3 py-2.5">Winner</th><th className="px-3 py-2.5 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {visibleMatches.map((match) => {
                  const result = matchResults[match.id];
                  const winner = result?.winnerTeamId === match.teamA?.id ? match.teamA : result ? match.teamB : null;
                  const scoreA = activeGame === 'valorant' ? result?.roundsA ?? result?.killsA : result?.killsA;
                  const scoreB = activeGame === 'valorant' ? result?.roundsB ?? result?.killsB : result?.killsB;
                  return (
                    <tr key={match.id} className="border-t border-[#23272d] hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-3 py-2.5 text-[10px] text-slate-500">R{match.roundNumber}{match.group ? ` · ${match.group}` : ''}</td>
                      <td className="min-w-[280px] px-3 py-2.5">
                        <div className="grid grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] items-center gap-2">
                          <TeamLine team={match.teamA} />
                          <span className="text-center text-[8px] font-bold text-slate-700">VS</span>
                          <TeamLine team={match.teamB} />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-center font-mono text-xs text-slate-300">{result ? `${scoreA ?? '—'} - ${scoreB ?? '—'}` : '—'}</td>
                      <td className="max-w-32 truncate px-3 py-2.5 text-[10px] text-slate-400">{winner?.tag || (result ? 'Saved' : 'Pending')}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <button type="button" onClick={() => setSelectedMatch(match)} className="rounded-md bg-[#1d3447] px-2.5 py-1.5 text-[9px] font-bold text-sky-100 hover:bg-[#294a64]">{result ? 'Edit' : 'Enter score'}</button>
                        {result && <button type="button" onClick={() => setClearTarget(match)} aria-label="Clear result" title="Clear result" className="ml-1.5 inline-grid h-7 w-7 place-items-center rounded-md text-slate-600 hover:bg-[#302124] hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>}
                      </td>
                    </tr>
                  );
                })}
                {!visibleMatches.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-xs text-slate-500">No matches match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-10 text-center">
            <CalendarDays className="mx-auto h-6 w-6 text-slate-600" />
            <p className="mt-2 text-xs text-slate-400">No {gameShort(activeGame)} schedule yet.</p>
            <Link to="/schedule" className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300">Build schedule <ArrowRight className="h-3 w-3" /></Link>
          </div>
        )}
      </section>
    </div>
  );
}
