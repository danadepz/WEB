import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Trophy } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { DEFAULT_GAME, GAMES, gameShort } from '../modules/games';

export default function MiniLeaderboard({ players = null }) {
  const { activeGame, getStandingsForGame } = useTournament();
  const [selectedGame, setSelectedGame] = useState(activeGame || DEFAULT_GAME);
  const isPlayerLeaderboard = Array.isArray(players);
  const standings = isPlayerLeaderboard
    ? []
    : getStandingsForGame(selectedGame).slice(0, 5);
  const topPlayers = isPlayerLeaderboard
    ? players
      .filter((player) => player.active !== false && (player.team.game || DEFAULT_GAME) === selectedGame)
      .sort((a, b) => {
        const aKda = (a.report.kills + a.report.assists) / Math.max(a.report.deaths, 1);
        const bKda = (b.report.kills + b.report.assists) / Math.max(b.report.deaths, 1);
        if (bKda !== aKda) return bKda - aKda;
        if (b.report.kills !== a.report.kills) return b.report.kills - a.report.kills;
        return a.report.deaths - b.report.deaths;
      })
      .slice(0, 3)
    : [];

  return (
    <aside className="min-w-0 lg:sticky lg:top-24">
      <section
        className="relative isolate overflow-hidden rounded-xl border border-[#303640] bg-[#0d1014] shadow-xl"
        style={{
          backgroundImage: "linear-gradient(180deg, rgba(8, 11, 16, 0.86), rgba(8, 11, 16, 0.97)), url('/images/backgrounds/match-standings-background-optimized.jpg')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-sky-500/10 to-transparent" />
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <img src="/images/logo/logo-optimized.png" alt="" className="h-10 w-10 rounded-lg bg-transparent object-contain p-1" />
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-sky-300">
              {isPlayerLeaderboard ? 'Player leaderboard' : 'Tournament standings'}
            </p>
            <h2 className="mt-1 text-sm font-black text-white">
              {isPlayerLeaderboard ? 'Top 3 MVP' : 'Leaderboard'}
            </h2>
          </div>
          <Trophy className="ml-auto h-4 w-4 shrink-0 text-amber-300" />
        </header>

        <div className="grid grid-cols-2 gap-1.5 p-3" role="group" aria-label="Leaderboard game">
          {GAMES.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => setSelectedGame(game.id)}
              aria-pressed={selectedGame === game.id}
              className={`rounded-md border px-2 py-1.5 text-[9px] font-bold transition ${
                selectedGame === game.id
                  ? 'border-sky-400/30 bg-sky-400/10 text-sky-200'
                  : 'border-white/5 bg-black/20 text-slate-500 hover:text-slate-200'
              }`}
            >
              {gameShort(game.id)}
            </button>
          ))}
        </div>

        {isPlayerLeaderboard ? (
          topPlayers.length ? (
            <ol className="divide-y divide-white/[0.06] px-3">
              {topPlayers.map((player, index) => (
                <li key={player.id}>
                  <Link to={`/players/${player.id}`} className="flex items-center gap-2.5 py-2.5 hover:bg-white/[0.035]">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[9px] font-black ${
                      index === 0
                        ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                        : 'border-white/10 bg-white/[0.035] text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                    {player.photo ? (
                      <img src={player.photo} alt="" className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover" />
                    ) : (
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-black/30 text-[8px] font-bold text-slate-400">
                        {player.name?.slice(0, 2).toUpperCase() || 'PL'}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-bold text-slate-200">{player.name}</span>
                      <span className="mt-0.5 block truncate text-[8px] text-slate-500">{player.team.tag} · {player.report.matches} matches</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-[10px] font-black text-white">
                        {player.report.kills}/{player.report.deaths}/{player.report.assists}
                      </span>
                      <span className="mt-1 block text-[7px] font-bold uppercase tracking-widest text-slate-500">K/D/A</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-4 py-6 text-center text-[10px] text-slate-500">No player stats recorded for this game yet.</p>
          )
        ) : standings.length ? (
          <ol className="divide-y divide-white/[0.06] px-3">
            {standings.map((row, index) => (
              <li key={row.teamId}>
                <Link to={`/team/${row.teamId}`} className="flex items-center gap-2.5 py-2.5 hover:bg-white/[0.035]">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[9px] font-black ${
                    index === 0
                      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                      : 'border-white/10 bg-white/[0.035] text-slate-500'
                  }`}>
                    {index === 0 ? <Crown className="h-3 w-3" /> : index + 1}
                  </span>
                  {row.teamLogo ? (
                    <img src={row.teamLogo} alt="" className="h-8 w-8 shrink-0 rounded-md border border-white/10 bg-black/30 object-cover" />
                  ) : (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 bg-black/30 text-[8px] font-bold text-slate-400">
                      {row.teamTag?.slice(0, 3) || 'TM'}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-bold text-slate-200">{row.teamName}</span>
                    <span className="mt-0.5 block text-[8px] text-slate-500">{row.wins}W - {row.losses}L</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-sm font-black leading-none text-white">{row.points}</span>
                    <span className="mt-1 block text-[7px] font-bold uppercase tracking-widest text-slate-500">PTS</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-4 py-6 text-center text-[10px] text-slate-500">No teams in this leaderboard yet.</p>
        )}

        <Link
          to={isPlayerLeaderboard ? '/players' : '/standings'}
          className="m-3 flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-400 transition hover:border-sky-400/30 hover:text-white"
        >
          {isPlayerLeaderboard ? 'All players' : 'Full standings'} <span aria-hidden="true">→</span>
        </Link>
      </section>
    </aside>
  );
}
