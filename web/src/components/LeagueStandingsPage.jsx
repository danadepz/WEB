import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ChevronRight, Clock, Crown, Flame, Gamepad2, Moon, Sun, Trophy } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { gameLabel, gameShort } from '../modules/games';
import { secondsToTime } from '../modules/scoringEngine';
import EmptyState from './ui/EmptyState';
import PlayoffBracket from './ui/PlayoffBracket';
import './LeagueStandingsPage.css';

const PHASES = ['Group Stage', 'Play-ins', 'Playoffs'];
const VIEWS = ['OVERVIEW', 'MATCHES', 'STANDINGS', 'BRACKET'];
const THEME_STORAGE_KEY = 'standingsTheme';

function StandingsGroup({ group, game, standings }) {
  const highestPoints = Math.max(...standings.map((row) => row.points), 1);

  return (
    <section className="wm-panel wm-clip overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgba(77,205,255,0.18)] px-4 py-3">
        <div>
          <p className="font-display text-[9px] font-bold uppercase tracking-[0.3em] text-[color:var(--wm-cyan)]">League table — {game}</p>
          <h2 className="mt-1 font-display text-base font-extrabold text-white">Group {group}</h2>
        </div>
        <span className="rounded-md border border-[#303137] bg-[#121316] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {standings.length} teams
        </span>
      </div>

      {standings.length ? (
        <ol className="divide-y divide-[#1c1d21]">
          {standings.map((row, index) => {
            const rank = index + 1;
            const rankColor = rank === 1
              ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
              : rank === 2
                ? 'border-slate-400/20 bg-slate-400/10 text-slate-300'
                : rank === 3
                  ? 'border-sky-400/20 bg-sky-400/10 text-sky-300'
                  : 'border-[#303137] bg-[#17191d] text-slate-500';

            return (
              <li key={row.teamId} className="group px-4 py-3 transition-colors hover:bg-white/[0.025]">
                <div className="flex items-center gap-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border font-mono text-xs font-bold ${rankColor}`}>
                    {rank === 1 ? <Crown className="h-3.5 w-3.5" /> : String(rank).padStart(2, '0')}
                  </span>
                  <Link to={`/team/${row.teamId}`} className="flex min-w-0 flex-1 items-center gap-3">
                    {row.teamLogo ? (
                      <img src={row.teamLogo} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-[#33343a] bg-[#17191d] object-cover" />
                    ) : (
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#33343a] bg-[#17191d] text-[10px] font-bold text-slate-300">
                        {row.teamTag?.slice(0, 3) || 'TEAM'}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-100 transition-colors group-hover:text-sky-200">{row.teamName}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-slate-500">#{row.teamTag} <span className="px-1 text-slate-700">/</span> {row.wins}W - {row.losses}L</span>
                    </span>
                  </Link>
                  <span className="w-12 shrink-0 text-right">
                    <span className="block font-mono text-lg font-black leading-none text-white">{row.points}</span>
                    <span className="mt-1 block text-[8px] font-bold uppercase tracking-wider text-slate-500">PTS</span>
                  </span>
                </div>
                <div className="ml-11 mt-2.5 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#202126]">
                    <div
                      className={`h-full rounded-full ${rank === 1 ? 'bg-[#72a9d6]' : 'bg-[#456a8b]'}`}
                      style={{ width: `${Math.max((row.points / highestPoints) * 100, 3)}%` }}
                    />
                  </div>
                  <span className="min-w-16 text-right text-[9px] text-slate-500">
                    {game === 'valorant'
                      ? `RD ${row.roundDifferential > 0 ? '+' : ''}${row.roundDifferential}`
                      : row.averageWinTime ? `AVG ${secondsToTime(row.averageWinTime)}` : `${row.played} played`}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="px-4 py-6">
          <EmptyState
            icon={Trophy}
            heading="NO STANDINGS YET"
            description={`Standings will appear here once Group ${group} fixtures and verified results are published.`}
          />
        </div>
      )}
    </section>
  );
}

function FixtureTeam({ team, winner }) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${winner ? 'text-white' : 'text-slate-300'}`}>
      {team?.logo ? (
        <img src={team.logo} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-[#30343b] bg-[#17191d] object-cover" />
      ) : (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#30343b] bg-[#17191d] text-[9px] font-bold text-[#8eb9dc]">
          {team?.tag?.slice(0, 3) || 'TBD'}
        </span>
      )}
      <span className="min-w-0">
        <span className={`block truncate text-xs font-bold ${winner ? 'text-white' : ''}`}>
          {team?.name || 'TBD'}
        </span>
        <span className="mt-0.5 block truncate text-[9px] text-slate-600">
          {team?.tag ? `#${team.tag}` : 'Awaiting team'}
        </span>
      </span>
    </div>
  );
}

export default function LeagueStandingsPage({ initialView, initialPhase, resultsOnly = false, eyebrow, heading, hideViewTabs = false }) {
  const {
    tournament,
    activeGame,
    setActiveGame,
    getTeamsForGame,
    getStandingsForGame,
    getScheduleForGame,
    getMatchResultsForGame,
  } = useTournament();
  const [phase, setPhase] = useState(initialPhase || 'Group Stage');
  const [view, setView] = useState(initialView || 'OVERVIEW');
  const [groupFilter, setGroupFilter] = useState('A');
  // Sync when mounted via different /intramurals/* section routes
  useEffect(() => {
    if (initialView) setView(initialView);
  }, [initialView]);
  useEffect(() => {
    if (initialPhase) setPhase(initialPhase);
  }, [initialPhase]);
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
  );

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  const teams = useMemo(() => getTeamsForGame(activeGame), [getTeamsForGame, activeGame]);
  const standings = useMemo(() => getStandingsForGame(activeGame), [getStandingsForGame, activeGame]);
  const schedule = useMemo(() => getScheduleForGame(activeGame), [getScheduleForGame, activeGame]);
  const results = useMemo(() => getMatchResultsForGame(activeGame), [getMatchResultsForGame, activeGame]);
  const groupedStandings = useMemo(() => ({
    A: standings.filter((row) => (teams.find((team) => team.id === row.teamId)?.group || 'A') === 'A'),
    B: standings.filter((row) => teams.find((team) => team.id === row.teamId)?.group === 'B'),
  }), [standings, teams]);

  const currentRoundIndex = schedule.findIndex(
    (round) => round.some((match) => !results[match.id]?.winnerTeamId)
  );
  const roundIndex = currentRoundIndex >= 0 ? currentRoundIndex : schedule.length - 1;
  const currentMatches = schedule[roundIndex] || [];
  const baseMatchesForGroup = groupFilter === 'all'
    ? currentMatches
    : currentMatches.filter((match) => (match.group || 'A') === groupFilter);
  // RESULTS section: only completed matches with verified winners
  const currentMatchesForGroup = resultsOnly
    ? baseMatchesForGroup.filter((match) => results[match.id]?.winnerTeamId)
    : baseMatchesForGroup;
  const completedMatches = schedule.flat().filter((match) => results[match.id]?.winnerTeamId).length;
  const groupsToShow = groupFilter === 'all' ? ['A', 'B'] : [groupFilter];
  const seasonYear = tournament?.date?.slice(0, 4) || 'Current';
  const currentLeader = standings[0];
  const completionPercent = schedule.flat().length
    ? Math.round((completedMatches / schedule.flat().length) * 100)
    : 0;

  return (
    <div className="standings-page min-h-full bg-[#02040d] text-slate-100" data-theme={theme}>
      {/* Slim title bar — MATCH CENTER esports style */}
      <section className="relative overflow-hidden border-b border-[rgba(77,205,255,0.22)] bg-[#050814]">
        <div className="absolute inset-0 wm-grid-overlay opacity-25"></div>
        <div className="absolute inset-0 wm-glow-radial"></div>
        <div className="relative mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--wm-cyan)]">
              <span className="h-px w-7 bg-[color:var(--wm-cyan)]" /> {eyebrow || `${gameLabel(activeGame)} · Season ${seasonYear} · Intramurals`}
            </p>
            <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
              {heading || (
                <>
                  MATCH <span className="wm-hero-title">CENTER</span>
                </>
              )}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-[#292a2f] bg-[#111215] p-1" role="group" aria-label="Choose game">
              <button
                type="button"
                onClick={() => setActiveGame('mlbb')}
                aria-pressed={activeGame === 'mlbb'}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-bold transition-colors ${activeGame === 'mlbb' ? 'bg-[#17212b] text-[#a8c9e5] ring-1 ring-inset ring-[#385a77]' : 'text-slate-500 hover:text-slate-200'}`}
              >
                <Gamepad2 className="h-3.5 w-3.5" /> MLBB
              </button>
              <button
                type="button"
                onClick={() => setActiveGame('valorant')}
                aria-pressed={activeGame === 'valorant'}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-bold transition-colors ${activeGame === 'valorant' ? 'bg-[#14202a] text-sky-300 ring-1 ring-inset ring-[#285878]' : 'text-slate-500 hover:text-slate-200'}`}
              >
                <Flame className="h-3.5 w-3.5" /> VALO
              </button>
            </div>
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
              Group
              <select
                value={groupFilter}
                onChange={(event) => setGroupFilter(event.target.value)}
                className="min-w-28 rounded-md border border-[#2b2c31] bg-[#111215] px-3 py-1.5 text-xs font-semibold normal-case text-slate-200 outline-none focus:border-[#4b8fc8]"
              >
                <option value="all">All groups</option>
                <option value="A">Group A</option>
                <option value="B">Group B</option>
              </select>
            </label>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'light'}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#292a2f] bg-[#111215] px-3 text-[10px] font-bold uppercase tracking-wide text-slate-300 transition-colors hover:border-[#4b8fc8] hover:text-white"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
            </button>
          </div>
        </div>
      </section>

      {/* Match Center views — spec section 9 (hidden when embedded in the
          intramurals section, where the shared sub-nav owns switching) */}
      {!hideViewTabs && (
        <div className="border-b border-[rgba(148,163,184,0.14)] bg-[#050814]">
          <div className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8" role="tablist" aria-label="Match Center views">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => {
                  setView(v);
                  if (v === 'BRACKET') setPhase('Playoffs');
                  if (v === 'MATCHES' || v === 'STANDINGS') setPhase('Group Stage');
                }}
                className={`esports-btn whitespace-nowrap px-4 py-2 ${
                  view === v
                    ? 'bg-[#1e63ff] text-white'
                    : 'border border-white/10 text-slate-400 hover:border-[#1e63ff] hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Three-column magazine layout */}
      <div className="league-center-layout mx-auto max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* LEFT — tournament stage navigator */}
        <aside className="self-start lg:sticky lg:top-24">
          <p className="px-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">Tournament</p>
          <nav className="mt-2 space-y-1" aria-label="Tournament phase">
            {PHASES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPhase(item)}
                aria-pressed={phase === item}
                className={`block w-full rounded-r-lg border-l-2 px-4 py-3 text-left transition-colors ${
                  phase === item
                    ? 'border-[#5d9bd0] bg-gradient-to-r from-[#172431] to-transparent'
                    : 'border-transparent hover:bg-white/[0.03]'
                }`}
              >
                <span className={`block text-xs font-extrabold ${phase === item ? 'text-white' : 'text-slate-400'}`}>{item}</span>
                <span className={`mt-0.5 block text-[9px] font-semibold uppercase tracking-wider ${phase === item ? 'text-[#8eb9dc]' : 'text-slate-600'}`}>
                  {phase === item ? 'Now viewing' : 'View phase'}
                </span>
              </button>
            ))}
          </nav>

          <section className="mt-6 overflow-hidden rounded-xl border border-[#25262a] bg-[#101114]">
            <div className="flex items-center gap-2 border-b border-[#25262a] px-4 py-3 text-xs font-bold text-slate-200">
              <CalendarDays className="h-4 w-4 text-[#72a9d6]" />
              Season briefing
            </div>
            <div className="px-4 py-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#72a9d6]">Active season</span>
              <p className="mt-1 text-lg font-black text-white">{seasonYear}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                {tournament?.name || 'Tournament schedule not set'}
              </p>
              {tournament?.date && <p className="mt-3 border-t border-[#25262a] pt-3 text-[10px] text-slate-500">{tournament.date}</p>}
            </div>
          </section>
        </aside>

        {/* CENTER — fixtures & standings */}
        <main className="min-w-0">
          <div className="mb-4 flex items-center justify-between text-[10px] text-slate-500">
            <p className="font-bold uppercase tracking-widest">{gameLabel(activeGame)} · {phase}</p>
            <p>{completedMatches}/{schedule.flat().length} matches played</p>
          </div>

          {(view === 'BRACKET' || phase !== 'Group Stage') ? (
            <PlayoffBracket
              phase={phase}
              game={activeGame}
              standingsA={groupedStandings.A}
              standingsB={groupedStandings.B}
            />
          ) : (
            <div className="space-y-4">
              {(view === 'OVERVIEW' || view === 'STANDINGS') && groupsToShow.map((group) => (
                <StandingsGroup
                  key={group}
                  group={group}
                  game={activeGame}
                  standings={groupedStandings[group]}
                />
              ))}
              {(view === 'OVERVIEW' || view === 'MATCHES') && (
              <section className="overflow-hidden rounded-xl border border-[#25262a] bg-[#0d0e11]">
                <div className="flex items-center justify-between gap-3 border-b border-[#25262a] px-4 py-3.5">
                  <div>
                    <h2 className="text-xs font-bold text-slate-100">
                      {schedule.length ? `Round ${roundIndex + 1} fixtures` : 'Group stage fixtures'}
                    </h2>
                    <p className="mt-1 text-[10px] text-slate-500">{gameShort(activeGame)} group stage · {currentMatchesForGroup.length} matches</p>
                  </div>
                  <Link to="/admin" className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white">
                    Official results <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                {currentMatchesForGroup.length ? (
                  <div className="space-y-2 p-3 sm:p-4">
                    {currentMatchesForGroup.map((match, index) => {
                      const result = results[match.id];
                      const hasResult = Boolean(result?.winnerTeamId);
                      const winnerId = result?.winnerTeamId;
                      const winnerName = winnerId === match.teamA?.id
                        ? match.teamA?.name
                        : winnerId === match.teamB?.id
                          ? match.teamB?.name
                          : null;

                      return (
                        <article
                          key={match.id}
                          className={`rounded-lg border px-3 py-3 transition-colors sm:px-4 ${
                            hasResult
                              ? 'border-[#293a34] bg-[#101713]'
                              : 'border-[#25282e] bg-[#111317] hover:border-[#3b4652]'
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] font-bold text-slate-600">
                                MATCH {String(index + 1).padStart(2, '0')}
                              </span>
                              <span className="rounded border border-[#30343b] bg-[#17191d] px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                                GROUP {match.group || 'A'}
                              </span>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide ${hasResult ? 'text-emerald-300' : 'text-slate-500'}`}>
                              {hasResult ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {hasResult ? 'Final' : 'Upcoming'}
                            </span>
                          </div>
                          <div className="fixture-vs grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
                            <FixtureTeam team={match.teamA} winner={winnerId === match.teamA?.id} />
                            <span className="px-1 text-[9px] font-black text-slate-600">VS</span>
                            <div className="flex justify-end text-right">
                              <FixtureTeam team={match.teamB} winner={winnerId === match.teamB?.id} />
                            </div>
                          </div>
                          {hasResult && (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#25282e] pt-2.5 text-[10px]">
                              <span className="text-slate-500">
                                Winner <strong className="ml-1 text-slate-200">{winnerName || 'Not recorded'}</strong>
                              </span>
                              {result.pointsA != null && result.pointsB != null && (
                                <span className="font-mono font-bold text-slate-400">
                                  {result.pointsA} – {result.pointsB} <span className="font-sans text-[8px] text-slate-600">PTS</span>
                                </span>
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-6">
                    <EmptyState
                      icon={CalendarDays}
                      heading="SCHEDULE NOT AVAILABLE YET"
                      description="Official match schedules will appear here once the tournament schedule is published."
                    />
                  </div>
                )}
              </section>
              )}
            </div>
          )}
        </main>

        {/* RIGHT — power rankings + pulse */}
        <aside className="self-start space-y-4 lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-xl border border-[#25262a] bg-[#101114]">
            <div className="flex items-center gap-2 border-b border-[#25262a] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-200">
              <Trophy className="h-3.5 w-3.5 text-[#72a9d6]" />
              Global power rankings
            </div>
            <ol className="divide-y divide-[#1c1d21]">
              {standings.slice(0, 5).map((row, index) => (
                <li key={row.teamId} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-5 font-mono text-sm font-black text-white">{index + 1}</span>
                  {row.teamLogo ? (
                    <img src={row.teamLogo} alt="" className="h-8 w-8 rounded-md border border-[#33343a] bg-[#17191d] object-cover" />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-md border border-[#33343a] bg-[#17191d] text-[8px] font-bold text-[#8eb9dc]">
                      {row.teamTag?.slice(0, 3) || '---'}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-200">{row.teamName}</span>
                  <span className="font-mono text-sm font-black text-white">{row.points}</span>
                </li>
              ))}
              {!standings.length && (
                <li className="px-4 py-6 text-center text-[10px] text-slate-600">No standings yet.</li>
              )}
            </ol>
          </section>

          {currentLeader && (
            <section className="overflow-hidden rounded-xl border border-[#385a77] bg-gradient-to-b from-[#172431] to-[#101114]">
              <div className="flex items-center gap-2 border-b border-[#385a77]/60 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#a8c9e5]">
                <Trophy className="h-3.5 w-3.5" />
                On top
              </div>
              <div className="p-4 text-center">
                {currentLeader.teamLogo ? (
                  <img src={currentLeader.teamLogo} alt="" className="mx-auto h-16 w-16 rounded-xl border border-[#456a8b] bg-[#090a0c] object-cover" />
                ) : (
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl border border-[#456a8b] bg-[#090a0c] text-sm font-black text-[#a8c9e5]">
                    {currentLeader.teamTag?.slice(0, 3) || 'TEAM'}
                  </div>
                )}
                <p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">Current leader</p>
                <p className="mt-1 text-sm font-extrabold text-white">{currentLeader.teamName}</p>
                <p className="mt-1 text-[10px] text-slate-400">#{currentLeader.teamTag} · {currentLeader.wins} wins</p>
                <div className="mt-4 flex items-end justify-center gap-1.5">
                  <span className="font-mono text-3xl font-black leading-none text-white">{currentLeader.points}</span>
                  <span className="pb-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8eb9dc]">points</span>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-[#25262a] bg-[#101114] p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Tournament pulse</span>
              <span className="text-[#8eb9dc]">{completionPercent}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#25262a]">
              <div className="h-full rounded-full bg-[#5d9bd0] transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="mt-3 text-[10px] text-slate-500">
              <span className="font-bold text-slate-200">{completedMatches}</span> of {schedule.flat().length} matches completed
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
