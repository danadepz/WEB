import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search, Shield, UserRound } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { gameLabel, gameShort } from '../modules/games';
import EmptyState from './ui/EmptyState';
import MiniLeaderboard from './MiniLeaderboard';

function PlayerPortrait({ player, className = 'h-12 w-12' }) {
  return player.photo ? (
    <img src={player.photo} alt="" className={`${className} shrink-0 rounded-full border border-[#39414c] object-cover`} />
  ) : (
    <span className={`${className} grid shrink-0 place-items-center rounded-full border border-[#39414c] bg-[#171b21] text-sm font-bold text-slate-300`}>
      {player.name?.slice(0, 2).toUpperCase() || 'PL'}
    </span>
  );
}

function PlayerCardArtwork({ player }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = player.photo || `/images/players/${encodeURIComponent(player.id)}.jpg`;
  const accent = player.team.color || '#5d9bd0';

  return (
    <div
      className="relative flex w-[38%] min-w-0 shrink-0 flex-col justify-between overflow-hidden border-r border-white/10 bg-[#101317]"
      style={{ background: `radial-gradient(ellipse at 75% 30%, ${accent}55, transparent 55%), linear-gradient(145deg, #172431, #090a0c 85%)` }}
    >
      {!imageFailed && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_35%] opacity-85 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
          onError={() => setImageFailed(true)}
        />
      )}
      {imageFailed && (
        <span className="absolute inset-0 grid place-items-center text-5xl font-black uppercase text-white/20">
          {player.name?.slice(0, 2) || 'PL'}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#090a0c]" />
      <span className="relative z-[1] m-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-md">
        <Shield className="h-3 w-3" /> {player.team.tag}
      </span>
      <span className="relative z-[1] px-4 pb-3">
        <span className="block truncate text-sm font-black leading-tight text-white drop-shadow-lg">{player.name}</span>
        <span className="mt-1 block truncate text-[8px] font-semibold uppercase tracking-[0.12em] text-white/70">{player.team.name}</span>
      </span>
    </div>
  );
}

export default function PlayerStatsPage() {
  const { playerId } = useParams();
  const { allTeams, getScheduleForGame, getMatchResultsForGame } = useTournament();
  const [query, setQuery] = useState('');
  const [cardTabs, setCardTabs] = useState({});

  const players = useMemo(() => allTeams.flatMap((team) => {
    const game = team.game || 'mlbb';
    const schedule = getScheduleForGame(game);
    const results = getMatchResultsForGame(game);

    return (team.players || []).map((player) => {
      const report = { matches: 0, wins: 0, losses: 0, kills: 0, deaths: 0, assists: 0, history: [] };

      schedule.forEach((round, roundIndex) => round.forEach((match) => {
        const teamAId = match.teamAId ?? match.teamA?.id;
        const teamBId = match.teamBId ?? match.teamB?.id;
        const isTeamA = teamAId === team.id;
        const isTeamB = teamBId === team.id;
        if ((!isTeamA && !isTeamB) || !results[match.id]) return;

        const result = results[match.id];
        const rows = isTeamA ? result.playerAKDA : result.playerBKDA;
        const playerRow = Array.isArray(rows) ? rows.find((row) => row.playerId === player.id) : null;
        if (!playerRow) return;

        const won = result.winnerTeamId === team.id;
        report.matches += 1;
        if (won) report.wins += 1;
        else report.losses += 1;
        report.kills += Number(playerRow.kills) || 0;
        report.deaths += Number(playerRow.deaths) || 0;
        report.assists += Number(playerRow.assists) || 0;
        report.history.push({
          id: match.id,
          round: roundIndex + 1,
          opponent: isTeamA ? match.teamB : match.teamA,
          won,
          kills: Number(playerRow.kills) || 0,
          deaths: Number(playerRow.deaths) || 0,
          assists: Number(playerRow.assists) || 0,
        });
      }));

      return { ...player, team, report };
    });
  }), [allTeams, getScheduleForGame, getMatchResultsForGame]);
  const selectedPlayer = players.find((player) => player.id === playerId);
  const playerReport = selectedPlayer?.report;

  const filteredPlayers = players.filter((player) => {
    const term = query.trim().toLowerCase();
    return !term || (player.name || '').toLowerCase().includes(term) || (player.team.name || '').toLowerCase().includes(term) || (player.team.tag || '').toLowerCase().includes(term);
  });
  const playersByGame = ['mlbb', 'valorant'].map((game) => ({
    game,
    players: filteredPlayers.filter((player) => (player.team.game || 'mlbb') === game),
  }));

  return (
    <div className="min-h-full bg-[#02040d] text-slate-100">
      <header className="relative overflow-hidden border-b border-[rgba(148,163,184,0.14)] bg-[#050814]">
        <div className="absolute inset-0 wm-grid-overlay opacity-15" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="esports-eyebrow">Rosters</p>
          <h1 className="esports-h2 mt-2 text-2xl sm:text-3xl">PLAYERS</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">IGN, team, game and role. Statistics appear only when official match data exists.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
        {selectedPlayer && playerReport ? (
          <div className="space-y-5">
            <Link to="/players" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> All players
            </Link>

            <section className="flex flex-wrap items-center gap-4 rounded-lg border border-[#252a31] bg-[#101317] p-4 sm:p-5">
              <PlayerPortrait player={selectedPlayer} className="h-16 w-16" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold text-slate-100">{selectedPlayer.name}</h2>
                <Link to={`/team/${selectedPlayer.team.id}`} className="mt-1 inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-sky-200">
                  <Shield className="h-3.5 w-3.5" /> {selectedPlayer.team.name} · {gameShort(selectedPlayer.team.game)}
                </Link>
                {selectedPlayer.role && (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {selectedPlayer.role === 'Sub' ? `Sub · ${selectedPlayer.customRole}` : selectedPlayer.role}
                  </p>
                )}
              </div>
              {selectedPlayer.active === false && <span className="rounded border border-[#343a43] px-2 py-1 text-[9px] font-semibold uppercase text-slate-500">Archived</span>}
            </section>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                ['Matches', playerReport.matches],
                ['W-L', `${playerReport.wins}-${playerReport.losses}`],
                ['Kills', playerReport.kills],
                ['Deaths', playerReport.deaths],
                ['Assists', playerReport.assists],
              ].map(([label, value]) => (
                <section key={label} className="rounded-lg border border-[#252a31] bg-[#101317] px-3 py-3">
                  <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-100">{value}</p>
                </section>
              ))}
            </div>

            <section className="overflow-hidden rounded-lg border border-[#252a31] bg-[#101317]">
              <div className="border-b border-[#252a31] px-4 py-3 text-xs font-bold text-slate-200">Match history</div>
              {playerReport.history.length ? (
                <div className="divide-y divide-[#242830]">
                  {playerReport.history.slice().reverse().map((row) => (
                    <div key={row.id} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-xs sm:grid-cols-[70px_minmax(0,1fr)_auto_auto]">
                      <span className="font-mono text-slate-500">R{row.round}</span>
                      <span className="truncate text-slate-200">vs {row.opponent?.name || 'Unknown team'}</span>
                      <span className={row.won ? 'text-sky-300' : 'text-slate-500'}>{row.won ? 'Win' : 'Loss'}</span>
                      <span className="font-mono text-slate-300">{row.kills}/{row.deaths}/{row.assists}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-8 text-center text-xs text-slate-500">No linked player stats recorded yet.</p>
              )}
            </section>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full max-w-[640px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a player or team" className="w-full rounded-md border border-[#303640] bg-[#101317] py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-sky-500" />
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[#72a9d6]">{filteredPlayers.length} players</p>
            </div>
            {filteredPlayers.length ? (
              <div className="space-y-8">
                {playersByGame.filter((group) => group.players.length > 0).map((group) => (
                  <section key={group.game} aria-labelledby={`players-${group.game}`}>
                    <div className="mb-4 flex items-center justify-between border-b border-[#252a31] pb-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#72a9d6]">Player roster</p>
                        <h2 id={`players-${group.game}`} className="mt-1 text-lg font-black text-white">{gameLabel(group.game)}</h2>
                      </div>
                      <span className="rounded-full border border-[#303640] bg-[#101317] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {group.players.length} {group.players.length === 1 ? 'player' : 'players'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {group.players.map((player) => (
                  <article
                    key={player.id}
                    className="group relative flex h-[300px] w-full overflow-hidden rounded-xl border border-[#252a31] bg-[#101317]/90 transition duration-300 hover:-translate-y-1 hover:border-[#5d9bd0] hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                    style={{ '--player-accent': player.team.color || '#5d9bd0' }}
                  >
                    <PlayerCardArtwork player={player} />
                    <div className="flex min-w-0 flex-1 flex-col">
                    <div className="grid grid-cols-3 items-center border-b border-white/10 bg-black/20 p-1">
                      {['feed', 'stats', 'results'].map((tab) => {
                        const isActive = (cardTabs[player.id] || 'feed') === tab;
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setCardTabs((current) => ({ ...current, [player.id]: tab }))}
                            aria-pressed={isActive}
                            className={`rounded-full px-1 py-1.5 text-[8px] font-extrabold uppercase tracking-widest transition-all ${
                              isActive
                                ? 'bg-[var(--player-accent)] text-white shadow-lg'
                                : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-200'
                            }`}
                          >
                            {tab}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-1 flex-col px-3 py-2.5">
                      {(cardTabs[player.id] || 'feed') === 'feed' && (
                        <div className="flex flex-1 flex-col justify-center">
                          <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">Team affiliation</p>
                          <p className="mt-1 truncate text-[11px] font-semibold text-slate-200">{player.team.name}</p>
                          <p className="mt-1 text-[8px] text-slate-500">
                            #{player.team.tag}{player.team.group ? ` · Group ${player.team.group}` : ''} · {gameShort(player.team.game)}
                          </p>
                          {player.role && (
                            <p className="mt-2 inline-flex w-fit rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-slate-300">
                              {player.role === 'Sub' ? `Sub · ${player.customRole}` : player.role}
                            </p>
                          )}
                        </div>
                      )}
                      {(cardTabs[player.id] || 'feed') === 'stats' && (
                        <div className="flex flex-1 flex-col justify-center">
                          <div className="grid grid-cols-3 gap-1 text-center">
                            {[
                              ['Kills', player.report.kills],
                              ['Deaths', player.report.deaths],
                              ['Assists', player.report.assists],
                            ].map(([label, value]) => (
                              <span key={label} className="rounded-md bg-white/[0.035] py-1.5">
                                <span className="block font-mono text-sm font-black text-white">{value}</span>
                                <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                              </span>
                            ))}
                          </div>
                          <p className="mt-2 text-center text-[9px] text-slate-500">
                            {player.report.matches} matches · {player.report.wins}W-{player.report.losses}L
                          </p>
                        </div>
                      )}
                      {(cardTabs[player.id] || 'feed') === 'results' && (
                        <div className="flex flex-1 flex-col justify-center gap-1.5">
                          {player.report.history.length ? player.report.history.slice(-2).reverse().map((result) => (
                            <div key={result.id} className="flex min-w-0 items-center gap-2 text-[9px]">
                              <span className={`shrink-0 rounded px-1.5 py-0.5 font-bold uppercase ${result.won ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>
                                {result.won ? 'W' : 'L'}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-slate-300">vs {result.opponent?.name || 'Unknown team'}</span>
                              <span className="shrink-0 font-mono text-slate-500">{result.kills}/{result.deaths}/{result.assists}</span>
                            </div>
                          )) : (
                            <p className="text-center text-[9px] text-slate-500">No match history recorded.</p>
                          )}
                        </div>
                      )}
                      <Link
                        to={`/players/${player.id}`}
                        className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[8px] font-bold uppercase tracking-wider text-slate-400 transition hover:text-white"
                      >
                        <span className="flex items-center gap-1.5"><UserRound className="h-3 w-3 text-[#8eb9dc]" /> Full profile</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                    </div>
                  </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UserRound}
                heading="NO PLAYERS REGISTERED YET"
                description="Player profiles will appear here once teams and rosters are registered."
                actionTo="/teams"
                actionLabel="VIEW TEAMS"
              />
            )}
          </div>
        )}
          </div>
          <MiniLeaderboard players={players} />
        </div>
      </div>
    </div>
  );
}
