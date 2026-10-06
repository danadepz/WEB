import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Crown,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { secondsToTime } from '../modules/scoringEngine';
import TeamCard from './ui/TeamCard';

export default function PublicTournamentView() {
  const {
    tournament,
    teams,
    schedule,
    matchResults,
    standings,
    scheduledTimeSlots,
  } = useTournament();

  const [activeTab, setActiveTab] = useState('overview');

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 animate-fadeIn">
        <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-2">Tournament Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">No tournament data currently available.</p>
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            Go to Tournament Setup
          </Link>
        </div>
      </div>
    );
  }

  const totalTeams = teams.length;
  const totalMatches = schedule.reduce((sum, round) => sum + round.length, 0);
  const matchesCompleted = Object.keys(matchResults).length;
  const progressPercent = totalMatches > 0 ? (matchesCompleted / totalMatches) * 100 : 0;
  const currentLeader = standings.length > 0 && matchesCompleted > 0 ? standings[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title Subheader */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-blue-400 block mb-1">
            Tournament Archive & Detailed Report
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{tournament.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organized by {tournament.organizer} · Date: {tournament.date}
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <span>View Live Stage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg">
        {['overview', 'standings', 'schedule', 'teams', 'results'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Format
              </span>
              <span className="text-lg font-black text-white block capitalize">
                {tournament.format?.replace(/-/g, ' ')}
              </span>
              <span className="text-xs text-slate-500">Dual group pools</span>
            </div>

            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Registered Departments
              </span>
              <span className="text-lg font-black text-blue-400 block">{totalTeams} Teams</span>
              <span className="text-xs text-slate-500">Across tournament pools</span>
            </div>

            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Progress
              </span>
              <span className="text-lg font-black text-emerald-400 block">
                {matchesCompleted} of {totalMatches} Matches
              </span>
              <span className="text-xs text-slate-500">{progressPercent.toFixed(0)}% Finished</span>
            </div>
          </div>

          {currentLeader && (
            <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-950 shadow-2xl backdrop-blur-md flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {currentLeader.teamLogo ? (
                  <img
                    src={currentLeader.teamLogo}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-600 border border-amber-400 grid place-items-center text-white font-black text-xl">
                    {currentLeader.teamTag?.slice(0, 3)}
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> Current Leader
                  </span>
                  <h3 className="text-xl font-black text-white">{currentLeader.teamName}</h3>
                  <span className="text-xs text-slate-400">
                    {currentLeader.wins}W - {currentLeader.losses}L · {currentLeader.points} pts
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-wider">Tournament Completion</span>
              <span className="text-blue-400">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Standings Tab */}
      {activeTab === 'standings' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5 text-center">Rank</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5 text-center">P</th>
                <th className="px-5 py-3.5 text-center">W</th>
                <th className="px-5 py-3.5 text-center">L</th>
                <th className="px-5 py-3.5 text-center">PTS</th>
                <th className="px-5 py-3.5 text-center">Diff</th>
                <th className="px-5 py-3.5 text-center">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {standings.map((s, idx) => (
                <tr key={s.teamId} className="hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-5 py-3.5 font-bold text-white">
                    <Link to={`/team/${s.teamId}`} className="hover:text-blue-400">
                      {s.teamName} <span className="text-slate-500 text-xs">#{s.teamTag}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-center text-slate-300">{s.played}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-white">{s.wins}</td>
                  <td className="px-5 py-3.5 text-center text-slate-400">{s.losses}</td>
                  <td className="px-5 py-3.5 text-center font-black text-blue-400">{s.points}</td>
                  <td className="px-5 py-3.5 text-center text-xs font-semibold">
                    {s.scoreDifferential > 0 ? `+${s.scoreDifferential}` : s.scoreDifferential}
                  </td>
                  <td className="px-5 py-3.5 text-center text-slate-300">
                    {s.winRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {schedule.map((round, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-3"
            >
              <h3 className="font-black text-white text-base">Round {idx + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {round.map((match) => (
                  <div
                    key={match.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white">{match.teamA?.name}</span>
                    <span className="text-slate-500 font-black">VS</span>
                    <span className="font-bold text-white">{match.teamB?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map((t) => (
            <TeamCard
              key={t.id}
              team={t}
              compact={true}
            />
          ))}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {matchesCompleted === 0 ? (
            <p className="py-12 text-center text-slate-500 text-sm">No completed matches yet.</p>
          ) : (
            schedule.map((round, idx) => {
              const done = round.filter((m) => matchResults[m.id]);
              if (!done.length) return null;
              return (
                <div key={idx} className="p-5 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
                  <h3 className="font-bold text-white text-sm">Round {idx + 1} Results</h3>
                  <div className="space-y-2">
                    {done.map((m) => {
                      const res = matchResults[m.id];
                      const win = res.winnerTeamId === m.teamA?.id ? m.teamA : m.teamB;
                      return (
                        <div
                          key={m.id}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs flex justify-between"
                        >
                          <span>
                            {m.teamA?.name} vs {m.teamB?.name}
                          </span>
                          <span className="font-bold text-emerald-400">
                            Winner: {win?.name} ({secondsToTime(res.durationSeconds)})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}