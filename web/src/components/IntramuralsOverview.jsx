import { useMemo } from 'react';
import { CalendarDays, ChevronRight, Crown, Gamepad2, Medal, Swords, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { gameShort } from '../modules/games';
import { getNextUpcomingMatch } from '../modules/tournamentStatus';
import EmptyState from './ui/EmptyState';
import IntramuralsNav from './IntramuralsNav';

// INTRAMURALS → Overview. Real data only; polished empty states when absent.
export default function IntramuralsOverview() {
  const { allTeams, getScheduleForGame, getMatchResultsForGame, getStandingsForGame, scheduledTimeSlots, activeGame } =
    useTournament();

  const model = useMemo(() => {
    const schedules = { mlbb: getScheduleForGame('mlbb') || [], valorant: getScheduleForGame('valorant') || [] };
    const resultsMap = { mlbb: getMatchResultsForGame('mlbb') || {}, valorant: getMatchResultsForGame('valorant') || {} };
    const next = getNextUpcomingMatch({
      scheduleByGame: schedules,
      resultsByGame: resultsMap,
      timeSlotsByGame: { [activeGame]: scheduledTimeSlots || [] },
    });
    const enrich = (n) => {
      if (!n) return null;
      const tidA = n.match.teamAId ?? n.match.teamA?.id;
      const tidB = n.match.teamBId ?? n.match.teamB?.id;
      return {
        ...n,
        teamA: allTeams.find((t) => t.id === tidA) || n.match.teamA || null,
        teamB: allTeams.find((t) => t.id === tidB) || n.match.teamB || null,
      };
    };
    // Recent results: last completed matches across both games (max 3)
    const done = [];
    for (const game of ['mlbb', 'valorant']) {
      (schedules[game] || []).flat().forEach((m) => {
        const r = resultsMap[game][m.id];
        if (r?.winnerTeamId) {
          const tidA = m.teamAId ?? m.teamA?.id;
          const tidB = m.teamBId ?? m.teamB?.id;
          done.push({
            game,
            match: m,
            result: r,
            teamA: allTeams.find((t) => t.id === tidA) || m.teamA || null,
            teamB: allTeams.find((t) => t.id === tidB) || m.teamB || null,
          });
        }
      });
    }
    const leaders = {
      mlbb: (getStandingsForGame('mlbb') || []).slice(0, 3),
      valorant: (getStandingsForGame('valorant') || []).slice(0, 3),
    };
    return { next: enrich(next), recent: done.slice(-3).reverse(), leaders };
  }, [allTeams, getScheduleForGame, getMatchResultsForGame, getStandingsForGame, scheduledTimeSlots, activeGame]);

  return (
    <div className="bg-[#02040d] text-slate-100">
      {/* Intramurals hero — same site, tournament-area identity */}
      <section className="relative overflow-hidden border-b border-[rgba(148,163,184,0.14)]">
        <div className="hero-photo absolute inset-0" aria-hidden="true" />
        <div className="hero-atmosphere absolute inset-0" aria-hidden="true" />
        <div className="hero-grid-drift wm-grid-overlay absolute inset-0 opacity-[0.14]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
          <p className="esports-eyebrow">University of Cebu – Banilad</p>
          <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
            INTRAMURALS <span className="wm-hero-title">2026</span>
          </h1>
          <p className="mt-3 font-display text-xs tracking-[0.34em] text-[#9ec1ff]">MLBB • VALORANT</p>
          <p className="mt-4 font-display text-[11px] tracking-[0.4em] text-slate-300">COMPETE. CONQUER. REPRESENT.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/intramurals/schedule" className="esports-btn inline-flex items-center gap-2 bg-[#1e63ff] px-6 py-3 text-white hover:bg-[#1d4ed8]">
              VIEW SCHEDULE <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/intramurals/standings" className="esports-btn inline-flex items-center gap-2 border border-white/20 bg-white/[0.04] px-6 py-3 text-white hover:border-[#1e63ff]">
              VIEW STANDINGS
            </Link>
          </div>
          <div className="mx-auto mt-4 max-w-2xl">
            <IntramuralsNav centered />
          </div>
        </div>
      </section>

      {/* Overview grid */}
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Featured fixture */}
        <section className="esports-card relative overflow-hidden p-6">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#1e63ff]" aria-hidden="true" />
          <p className="esports-eyebrow">Upcoming</p>
          <h2 className="esports-h2 mt-2 text-base tracking-[0.1em]">FEATURED FIXTURE</h2>
          {model.next ? (
            <div className="mt-4">
              <p className="font-display text-[10px] tracking-[0.24em] text-[#7fb3ff]">
                {gameShort(model.next.game)} · {model.next.match.group ? `GROUP ${model.next.match.group}` : `ROUND ${model.next.roundNumber}`}
              </p>
              <p className="mt-2 truncate font-display text-lg font-black text-white">
                {model.next.teamA?.name || 'TBD'} <span className="mx-2 text-slate-500">VS</span> {model.next.teamB?.name || 'TBD'}
              </p>
              <Link to="/intramurals/schedule" className="esports-btn mt-4 inline-flex items-center gap-2 border border-[rgba(30,99,255,0.5)] bg-[rgba(30,99,255,0.1)] px-4 py-2 text-white hover:bg-[rgba(30,99,255,0.2)]">
                FULL SCHEDULE <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState icon={Swords} heading="NO FIXTURES PUBLISHED YET" description="Official match schedules will appear here once available." />
            </div>
          )}
        </section>

        {/* Current standings preview */}
        <section className="esports-card p-6">
          <p className="esports-eyebrow">Tables</p>
          <h2 className="esports-h2 mt-2 text-base tracking-[0.1em]">CURRENT STANDINGS</h2>
          {model.leaders.mlbb.length || model.leaders.valorant.length ? (
            <div className="mt-4 space-y-4">
              {[
                { game: 'mlbb', rows: model.leaders.mlbb },
                { game: 'valorant', rows: model.leaders.valorant },
              ].map(({ game, rows }) =>
                rows.length ? (
                  <div key={game}>
                    <p className="font-display text-[10px] tracking-[0.24em] text-[#7fb3ff]">{gameShort(game)}</p>
                    <ol className="mt-2 space-y-1.5">
                      {rows.map((row, i) => (
                        <li key={row.teamId} className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="w-5 shrink-0 font-mono font-black text-white">{i + 1}</span>
                            <span className="truncate font-semibold text-slate-200">{row.teamName}</span>
                          </span>
                          <span className="font-mono font-bold text-white">{row.points} <span className="text-[9px] text-slate-500">PTS</span></span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null
              )}
              <Link to="/intramurals/standings" className="esports-btn inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-slate-200 hover:border-[#1e63ff] hover:text-white">
                FULL STANDINGS <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState icon={Trophy} heading="NO STANDINGS YET" description="Tables will appear once fixtures and verified results are published." />
            </div>
          )}
        </section>

        {/* Format */}
        <section className="esports-card p-6">
          <p className="esports-eyebrow">Format</p>
          <h2 className="esports-h2 mt-2 text-base tracking-[0.1em]">TOURNAMENT FORMAT</h2>
          <ol className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li className="flex gap-3"><span className="font-display font-black text-white">01</span> Group stage seeds the playoffs.</li>
            <li className="flex gap-3"><span className="font-display font-black text-white">02</span> Playoffs decide the finalists.</li>
            <li className="flex gap-3"><span className="font-display font-black text-white">03</span> Grand finals crown one champion per title.</li>
          </ol>
          <Link to="/intramurals/bracket" className="esports-btn mt-4 inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-slate-200 hover:border-[#1e63ff] hover:text-white">
            VIEW BRACKET <ChevronRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Recent results */}
        <section className="esports-card p-6">
          <p className="esports-eyebrow">Results</p>
          <h2 className="esports-h2 mt-2 text-base tracking-[0.1em]">RECENT RESULTS</h2>
          {model.recent.length ? (
            <div className="mt-4 space-y-2">
              {model.recent.map(({ game, match, result, teamA, teamB }) => {
                const winnerId = result.winnerTeamId;
                const winnerName = winnerId === (teamA?.id) ? teamA?.name : winnerId === (teamB?.id) ? teamB?.name : 'Recorded';
                return (
                  <div key={`${game}-${match.id}`} className="flex items-center justify-between gap-3 rounded border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-sm">
                    <span className="min-w-0 truncate text-slate-300">
                      <span className="mr-2 font-display text-[9px] tracking-[0.2em] text-[#7fb3ff]">{gameShort(game)}</span>
                      <span className="font-semibold text-slate-200">{teamA?.name || 'TBD'}</span>
                      <span className="mx-1.5 text-slate-600">vs</span>
                      <span className="font-semibold text-slate-200">{teamB?.name || 'TBD'}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-500">Winner <strong className="text-slate-200">{winnerName}</strong></span>
                  </div>
                );
              })}
              <Link to="/intramurals/results" className="esports-btn inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-slate-200 hover:border-[#1e63ff] hover:text-white">
                ALL RESULTS <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState icon={Medal} heading="NO RESULTS YET" description="Verified scores will appear here once matches are played." />
            </div>
          )}
        </section>
      </div>

      {/* Quick facts */}
      <div className="border-t border-[rgba(148,163,184,0.14)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2"><Users className="h-3.5 w-3.5 text-[#7fb3ff]" /> {allTeams.length} teams registered</span>
          <span className="inline-flex items-center gap-2"><Gamepad2 className="h-3.5 w-3.5 text-[#7fb3ff]" /> MLBB • Valorant</span>
          <span className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-[#7fb3ff]" /> University of Cebu – Banilad</span>
        </div>
      </div>
    </div>
  );
}
