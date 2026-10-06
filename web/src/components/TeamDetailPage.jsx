import { Link, useParams } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  Users,
  Clock,
  TrendingUp,
  Flame,
  Gamepad2,
  Calendar,
  CheckCircle2,
  XCircle,
  Shield,
  Medal,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { secondsToTime } from '../modules/scoringEngine';
import { gameLabel, gameShort } from '../modules/games';
import MiniLeaderboard from './MiniLeaderboard';

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const { allTeams, getScheduleForGame, getMatchResultsForGame } = useTournament();

  const team = allTeams.find((t) => t.id === teamId);
  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-fadeIn text-center space-y-4">
        <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-2">Department Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">The requested department roster does not exist.</p>
          <Link
            to="/teams"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Department Rosters</span>
          </Link>
        </div>
      </div>
    );
  }

  const teamGame = team.game || 'mlbb';
  const schedule = getScheduleForGame(teamGame);
  const matchResults = getMatchResultsForGame(teamGame);

  const teamMatches = [];
  let totalDuration = 0;
  let wins = 0;
  let losses = 0;
  let points = 0;

  schedule.forEach((round, roundIndex) => {
    round.forEach((match) => {
      const isTeamA = (match.teamA?.id ?? match.teamAId) === teamId;
      const isTeamB = (match.teamB?.id ?? match.teamBId) === teamId;
      if (!isTeamA && !isTeamB) return;

      const opponent = isTeamA ? match.teamB : match.teamA;
      const result = matchResults[match.id];

      if (!result) {
        teamMatches.push({
          match,
          opponent,
          result: null,
          roundNumber: roundIndex + 1,
        });
        return;
      }

      const isWinner = result.winnerTeamId === teamId;
      const pointsEarned = isTeamA ? result.pointsA || 0 : result.pointsB || 0;
      totalDuration += result.durationSeconds || 0;
      if (isWinner) wins += 1;
      else losses += 1;
      points += pointsEarned;

      teamMatches.push({
        match,
        opponent,
        result,
        roundNumber: roundIndex + 1,
        isWinner,
        durationSeconds: result.durationSeconds,
        pointsEarned,
      });
    });
  });

  const matchesPlayed = wins + losses;
  const winRate = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;
  const avgGameTime = wins > 0 ? totalDuration / wins : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 space-y-8 animate-fadeIn">
      {/* Back button link */}
      <div>
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Departments</span>
        </Link>
      </div>

      {/* Hero Dossier Banner */}
      <section className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-indigo-950/40 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {team.photo && (
          <img
            src={team.photo}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-15"
          />
        )}
        <div className="flex items-center gap-5 z-10">
          {team.logo ? (
            <img
              src={team.logo}
              alt=""
              className="w-20 h-20 rounded-3xl object-cover border-2 border-blue-500/50 shadow-[0_0_25px_rgba(30,99,255,0.3)] shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 border-2 border-blue-400 flex items-center justify-center font-black text-white text-2xl shadow-[0_0_25px_rgba(30,99,255,0.3)] shrink-0">
              {team.tag?.slice(0, 3) || 'UCB'}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Group {team.group || 'A'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {gameShort(teamGame)}
              </span>
              {team.seed > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30">
                  Seed #{team.seed}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {team.name}
            </h1>
            <span className="text-sm font-extrabold text-blue-400 block">#{team.tag} Esports</span>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="flex items-center gap-3 z-10">
          <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Record</span>
            <span className="text-xl font-black text-white">
              {wins} - {losses}
            </span>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Points</span>
            <span className="text-xl font-black text-blue-400">{points} pts</span>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Win Rate</span>
            <span className="text-xl font-black text-emerald-400">{winRate.toFixed(0)}%</span>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Matches Played
          </span>
          <span className="text-2xl font-black text-white block">{matchesPlayed}</span>
          <span className="text-[11px] text-slate-500 font-medium">Of group schedule</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Victories
          </span>
          <span className="text-2xl font-black text-emerald-400 block">{wins}</span>
          <span className="text-[11px] text-emerald-500 font-semibold">{winRate.toFixed(1)}% Win Rate</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Defeats
          </span>
          <span className="text-2xl font-black text-slate-400 block">{losses}</span>
          <span className="text-[11px] text-slate-500 font-medium">Matches lost</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Avg Victory Duration
          </span>
          <span className="text-2xl font-black text-blue-400 block">
            {avgGameTime ? secondsToTime(avgGameTime) : '—'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Scoring criteria factor</span>
        </div>
      </div>

      {/* Match History Table */}
      <section className="rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-black text-white">Tournament Match History</h2>
        </div>

        {teamMatches.length === 0 ? (
          <p className="py-10 text-center text-slate-500 text-sm">
            No schedule or matches generated for this department yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-center w-16">Round</th>
                  <th className="px-5 py-3.5">Opponent Department</th>
                  <th className="px-5 py-3.5 text-center">Outcome</th>
                  <th className="px-5 py-3.5 text-center">Duration</th>
                  <th className="px-5 py-3.5 text-center">Points Earned</th>
                  <th className="px-5 py-3.5">Official Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {teamMatches.map((row) => (
                  <tr
                    key={row.match.id}
                    className="transition-colors hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 text-center font-bold text-slate-400">
                      R{row.roundNumber}
                    </td>

                    <td className="px-5 py-4">
                      {row.opponent ? (
                        <Link
                          to={`/team/${row.opponent.id}`}
                          className="flex items-center gap-2.5 text-white hover:text-blue-400 font-bold transition-colors"
                        >
                          {row.opponent.logo ? (
                            <img
                              src={row.opponent.logo}
                              alt=""
                              className="w-7 h-7 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <span className="w-7 h-7 rounded-xl bg-slate-800 text-[10px] font-black text-blue-400 grid place-items-center shrink-0">
                              {row.opponent.tag?.slice(0, 3) || 'OPP'}
                            </span>
                          )}
                          <span>{row.opponent.name}</span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            #{row.opponent.tag}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-slate-500 italic">TBD</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center">
                      {row.result ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            row.isWinner
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {row.isWinner ? 'Victory' : 'Defeat'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center text-xs text-slate-300 font-mono">
                      {row.result ? secondsToTime(row.durationSeconds) : '—'}
                    </td>

                    <td className="px-5 py-4 text-center">
                      {row.result ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/15 font-black text-blue-300 text-xs">
                          +{row.pointsEarned} pts
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400 italic">
                      {row.result?.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
        </div>
        <MiniLeaderboard />
      </div>
    </div>
  );
}