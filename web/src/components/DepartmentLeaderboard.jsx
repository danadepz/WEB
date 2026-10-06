/**
 * DepartmentLeaderboard
 *
 * Quota-optimised: reads from a single Firestore summary document
 * `leaderboard/summary` which is pre-computed by the backend after each
 * score update. Falls back to computing from TournamentContext standings
 * if the summary document doesn't exist or Firebase is not configured.
 */
import { useEffect, useState } from 'react';
import { isFirebaseConfigured, firestore } from '../modules/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useTournament } from '../context/TournamentContext';

const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];
const MEDAL_LABELS = ['🥇', '🥈', '🥉'];

const DEPT_COLORS = {
  CCS: 'from-blue-600 to-cyan-600',
  CBA: 'from-emerald-600 to-teal-600',
  COE: 'from-orange-600 to-amber-600',
  CAS: 'from-purple-600 to-violet-600',
  CED: 'from-rose-600 to-pink-600',
  CN: 'from-sky-600 to-indigo-600',
  CRIM: 'from-red-600 to-orange-600',
};

export default function DepartmentLeaderboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const { standings, allTeams } = useTournament();

  useEffect(() => {
    if (!isFirebaseConfigured || !firestore) {
      setUsingFallback(true);
      setLoading(false);
      return undefined;
    }

    // Single document read — very quota-friendly
    const unsub = onSnapshot(
      doc(firestore, 'leaderboard', 'summary'),
      (snap) => {
        if (snap.exists()) {
          setSummary(snap.data());
          setUsingFallback(false);
        } else {
          setUsingFallback(true);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('[Leaderboard] Firestore error:', err.message);
        setUsingFallback(true);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  // Fallback: compute department tallies from context standings
  const computedDepts = (() => {
    if (!usingFallback || standings.length === 0) return [];
    const deptMap = new Map();
    standings.forEach((s, rank) => {
      const team = allTeams.find((t) => t.id === s.teamId);
      const dept = team?.department || 'Unknown';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { department: dept, gold: 0, silver: 0, bronze: 0, totalPoints: 0, wins: 0 });
      }
      const entry = deptMap.get(dept);
      if (rank === 0) entry.gold += 1;
      else if (rank === 1) entry.silver += 1;
      else if (rank === 2) entry.bronze += 1;
      entry.wins += s.wins;
      entry.totalPoints += s.points;
    });
    return Array.from(deptMap.values()).sort(
      (a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.totalPoints - a.totalPoints
    );
  })();

  const departments = summary?.departments || computedDepts;
  const lastUpdated = summary?.updatedAt
    ? new Date(summary.updatedAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <section className="min-h-screen bg-[#090a0c] pt-8 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-display text-[11px] font-bold tracking-[0.3em] text-[#7fb3ff] mb-3">INTRAMURALS 2026</p>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-wide text-white mb-2">
            DEPARTMENT <span className="wm-hero-title">LEADERBOARD</span>
          </h1>
          <p className="text-sm text-slate-400">Overall medal tally and point standings across all sports and esports events</p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-600">Last updated: {lastUpdated}</p>
          )}
          {usingFallback && (
            <span className="inline-block mt-2 text-[10px] font-semibold text-amber-400/80 border border-amber-400/20 bg-amber-400/5 rounded px-2 py-0.5">
              Computed from esports standings
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#7fb3ff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No results yet.</p>
            <p className="text-slate-600 text-sm mt-2">Check back once events begin!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-4 mb-10">
              {[departments[1], departments[0], departments[2]].filter(Boolean).map((dept, i) => {
                const podiumOrder = [1, 0, 2];
                const rank = podiumOrder[i];
                const heights = ['h-28', 'h-36', 'h-24'];
                const colorKey = Object.keys(DEPT_COLORS).find((k) => dept.department.includes(k));
                const gradient = DEPT_COLORS[colorKey] || 'from-slate-600 to-slate-700';
                return (
                  <div key={dept.department} className="flex flex-col items-center">
                    <p className="text-2xl mb-1">{MEDAL_LABELS[rank]}</p>
                    <p className="text-white font-black text-sm mb-2 text-center">{dept.department}</p>
                    <div
                      className={`w-24 sm:w-28 ${heights[i]} rounded-t-xl bg-gradient-to-b ${gradient} flex flex-col items-center justify-end pb-3 border border-white/10`}
                      style={{ boxShadow: `0 -8px 30px ${MEDAL_COLORS[rank]}33` }}
                    >
                      <span className="text-white font-black text-xl">{dept.gold}🥇</span>
                      <span className="text-white/60 text-xs">{dept.totalPoints} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Table */}
            <div className="rounded-2xl border border-[rgba(30,99,255,0.25)] overflow-hidden bg-[#0b0f1e]">
              <div className="grid grid-cols-[2rem_1fr_repeat(4,minmax(3rem,1fr))] gap-0 border-b border-white/[0.06] px-4 py-3 text-[11px] font-bold tracking-[0.15em] text-slate-500 uppercase">
                <span>#</span>
                <span>Department</span>
                <span className="text-center">🥇</span>
                <span className="text-center">🥈</span>
                <span className="text-center">🥉</span>
                <span className="text-center">PTS</span>
              </div>

              {departments.map((dept, i) => {
                const colorKey = Object.keys(DEPT_COLORS).find((k) => dept.department.includes(k));
                const gradient = DEPT_COLORS[colorKey] || 'from-slate-600 to-slate-700';
                return (
                  <div
                    key={dept.department}
                    className={`grid grid-cols-[2rem_1fr_repeat(4,minmax(3rem,1fr))] gap-0 px-4 py-4 items-center border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] ${i < 3 ? 'bg-white/[0.015]' : ''}`}
                  >
                    <span className="text-slate-500 font-bold text-sm">
                      {i < 3 ? MEDAL_LABELS[i] : i + 1}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${gradient} shrink-0`} />
                      <span className="font-bold text-white text-sm truncate">{dept.department}</span>
                    </div>
                    <span className="text-center font-black text-amber-400 text-base">{dept.gold ?? 0}</span>
                    <span className="text-center font-bold text-slate-300 text-base">{dept.silver ?? 0}</span>
                    <span className="text-center font-bold text-[#b45309] text-base">{dept.bronze ?? 0}</span>
                    <span className="text-center font-black text-[#7fb3ff] text-base">{dept.totalPoints ?? dept.wins ?? 0}</span>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-center text-xs text-slate-600">
              Medal tallies include all esports events. Traditional sports results updated by event coordinators.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
