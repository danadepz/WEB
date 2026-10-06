import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flame, Gamepad2, Search, Shield, Trophy, Users } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { gameLabel, gameShort } from '../modules/games';
import EmptyState from './ui/EmptyState';
import MiniLeaderboard from './MiniLeaderboard';

function TeamCardArtwork({ team }) {
  const [imageFailed, setImageFailed] = useState(false);
  const accent = team.color || (team.game === 'valorant' ? '#fb7185' : '#fbbf24');

  return (
    <div
      className="relative flex w-[36%] min-w-0 shrink-0 flex-col justify-between overflow-hidden border-r border-white/10 bg-[#101317]"
      style={{ background: `radial-gradient(ellipse at 75% 30%, ${accent}55, transparent 55%), linear-gradient(145deg, #172431, #090a0c 85%)` }}
    >
      {team.logo && !imageFailed && (
        <img
          src={team.logo}
          alt={`${team.name} team artwork`}
          className="absolute inset-0 h-full w-full bg-transparent object-contain p-3 transition duration-500 group-hover:scale-[1.04]"
          onError={() => setImageFailed(true)}
        />
      )}
      {(!team.logo || imageFailed) && (
        <span className="absolute inset-0 grid place-items-center text-5xl font-black uppercase text-white/20">
          {team.tag?.slice(0, 3) || 'TM'}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-[#090a0c]" />
      <span className="relative z-[1] m-2 inline-flex w-fit items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-md">
        <Shield className="h-3 w-3" /> #{team.tag}
      </span>
      <p className="relative z-[1] px-2 pb-3 text-center text-[8px] font-bold uppercase tracking-wider text-white/70">
        {gameShort(team.game)} · Group {team.group || 'A'}
      </p>
    </div>
  );
}

export default function TeamCompetitionPage() {
  const { allTeams, getScheduleForGame, getMatchResultsForGame } = useTournament();
  const [query, setQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [cardTabs, setCardTabs] = useState({});

  const teams = useMemo(() => allTeams.map((team) => {
    const schedule = getScheduleForGame(team.game || 'mlbb');
    const results = getMatchResultsForGame(team.game || 'mlbb');
    const matches = [];
    let wins = 0;
    let losses = 0;
    let points = 0;

    schedule.forEach((round, roundIndex) => round.forEach((match) => {
      const teamAId = match.teamAId ?? match.teamA?.id;
      const teamBId = match.teamBId ?? match.teamB?.id;
      const isTeamA = teamAId === team.id;
      if (!isTeamA && teamBId !== team.id) return;

      const result = results[match.id];
      if (!result) return;
      const won = result.winnerTeamId === team.id;
      if (won) wins += 1;
      else losses += 1;
      points += Number(isTeamA ? result.pointsA : result.pointsB) || 0;
      matches.push({
        id: match.id,
        round: roundIndex + 1,
        opponent: isTeamA ? match.teamB : match.teamA,
        won,
      });
    }));

    return { ...team, wins, losses, points, matches };
  }), [allTeams, getScheduleForGame, getMatchResultsForGame]);

  const filteredTeams = teams.filter((team) => {
    const term = query.trim().toLowerCase();
    const matchesGame = selectedGame === 'all' || (team.game || 'mlbb') === selectedGame;
    const matchesQuery = !term
      || team.name.toLowerCase().includes(term)
      || (team.tag || '').toLowerCase().includes(term);
    return matchesGame && matchesQuery;
  });

  return (
    <div className="min-h-full bg-[#02040d] text-slate-100">
      <header className="relative overflow-hidden border-b border-[rgba(77,205,255,0.22)] bg-[#050814]">
        <div className="absolute inset-0 wm-grid-overlay opacity-25"></div>
        <div className="absolute inset-0 wm-glow-radial"></div>
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--wm-cyan)]">Active Rosters — UC Banilad Intramurals</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">ACTIVE <span className="wm-hero-title">ROSTERS</span></h1>
          <p className="mt-3 max-w-xl font-body-wm text-sm leading-relaxed text-[color:var(--wm-body)]">Valorant and MLBB squads repping their departments. Filter by game, search the arena, open a team for full roster and results.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a team"
              aria-label="Find a team"
              className="w-full rounded-md border border-[#303640] bg-[#101317] py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter teams by game">
            {[
              { id: 'all', label: 'All games', Icon: Users },
              { id: 'mlbb', label: gameShort('mlbb'), Icon: Gamepad2 },
              { id: 'valorant', label: gameShort('valorant'), Icon: Flame },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedGame(id)}
                aria-pressed={selectedGame === id}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2.5 text-[10px] font-bold transition ${
                  selectedGame === id
                    ? 'border-[#36506a] bg-[#1a2732] text-sky-200'
                    : 'border-[#303640] bg-[#101317] text-slate-500 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#72a9d6] sm:text-right">{filteredTeams.length} teams</p>
        </div>

        {filteredTeams.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredTeams.map((team) => {
              const activeTab = cardTabs[team.id] || 'record';
              const activePlayers = (team.players || []).filter((player) => player.active !== false);

              return (
                <article
                  key={team.id}
                  className="group flex h-[330px] w-full overflow-hidden rounded-xl border border-[#252a31] bg-[#101317]/90 transition duration-300 hover:-translate-y-1 hover:border-[#5d9bd0] hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                  style={{ '--team-accent': team.color || '#5d9bd0' }}
                >
                  <TeamCardArtwork team={team} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <header className="border-b border-white/10 px-3.5 pb-2 pt-3">
                      <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">Team</p>
                      <h2 className="mt-0.5 truncate text-sm font-black leading-tight text-white">{team.name}</h2>
                    </header>
                    <section className="h-[132px] shrink-0 overflow-hidden border-b border-white/10 px-3.5 py-2.5" aria-label={`${team.name} player roster`}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">Roster</p>
                        <span className="text-[9px] font-semibold text-slate-500">{activePlayers.length} players</span>
                      </div>
                      {activePlayers.length ? (
                        <ul className="max-h-20 space-y-1 overflow-y-auto pr-1">
                          {activePlayers.map((player) => (
                            <li key={player.id}>
                              <Link
                                to={`/players/${player.id}`}
                                className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 transition hover:bg-white/[0.05]"
                              >
                                {player.photo ? (
                                  <img src={player.photo} alt="" className="h-7 w-7 shrink-0 rounded-full border border-[#39414c] object-cover" />
                                ) : (
                                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#39414c] bg-[#171b21] text-[9px] font-bold text-slate-300">
                                    {player.name?.slice(0, 2).toUpperCase() || 'PL'}
                                  </span>
                                )}
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[10px] font-semibold text-slate-200">{player.name}</span>
                                  <span className="mt-0.5 block truncate text-[8px] text-slate-500">
                                    {player.role === 'Sub' ? player.customRole || 'Sub' : player.role || 'Role not set'}
                                  </span>
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="rounded-md border border-dashed border-[#303640] px-2 py-2 text-center text-[9px] text-slate-500">
                          Roster details will be announced soon.
                        </p>
                      )}
                    </section>
                    <div className="flex border-b border-white/10 bg-black/20 p-1">
                      {['record', 'results'].map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setCardTabs((current) => ({ ...current, [team.id]: tab }))}
                            aria-pressed={isActive}
                            className={`flex-1 rounded-full px-2 py-1.5 text-[8px] font-extrabold uppercase tracking-widest transition-all ${
                              isActive
                                ? 'bg-[var(--team-accent)] text-white shadow-lg'
                                : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-200'
                            }`}
                          >
                            {tab}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex min-h-[110px] flex-1 flex-col justify-center px-3.5 py-2.5">
                      {activeTab === 'record' && (
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">Tournament record</p>
                          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                            {[
                              ['W-L', `${team.wins}-${team.losses}`],
                              ['Played', team.wins + team.losses],
                              ['Points', team.points],
                            ].map(([label, value]) => (
                              <span key={label} className="rounded-md bg-white/[0.035] py-1.5">
                                <span className="block font-mono text-sm font-black text-white">{value}</span>
                                <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeTab === 'results' && (
                        <div className="space-y-2">
                          <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">Latest results</p>
                          {team.matches.length ? team.matches.slice(-2).reverse().map((match) => (
                            <div key={match.id} className="flex min-w-0 items-center gap-2 text-[9px]">
                              <span className={`shrink-0 rounded px-1.5 py-0.5 font-bold uppercase ${match.won ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>
                                {match.won ? 'W' : 'L'}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-slate-300">vs {match.opponent?.name || 'Unknown team'}</span>
                              <span className="shrink-0 text-slate-500">Round {match.round}</span>
                            </div>
                          )) : (
                            <p className="text-[10px] text-slate-500">No match results yet.</p>
                          )}
                        </div>
                      )}
                      <Link
                        to={`/team/${team.id}`}
                        className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[8px] font-bold uppercase tracking-wider text-slate-400 transition hover:text-white"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Trophy className="h-3 w-3 text-[#8eb9dc]" /> {gameLabel(team.game)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          Team profile <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            heading="NO TEAMS REGISTERED YET"
            description="Registered teams will appear here once tournament registration is complete."
            actionTo="/standings"
            actionLabel="OPEN MATCH CENTER"
          />
        )}
          </div>
          <MiniLeaderboard />
        </div>
      </div>
    </div>
  );
}
