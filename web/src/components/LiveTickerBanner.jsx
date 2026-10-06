/**
 * LiveTickerBanner
 * Displays a horizontally scrolling ticker showing LIVE match scores.
 * Uses Firestore onSnapshot filtered to status == 'LIVE' to minimize reads.
 * Hidden entirely when no matches are live.
 */
import { useEffect, useRef, useState } from 'react';
import { isFirebaseConfigured, firestore } from '../modules/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useTournament } from '../context/TournamentContext';

const TICKER_HEIGHT_PX = 36;

export default function LiveTickerBanner() {
  const [liveMatches, setLiveMatches] = useState([]);
  const { allTeams, matchResults } = useTournament();
  const tickerRef = useRef(null);

  // Listen to Firestore 'liveMatches' collection (status == 'LIVE') if Firebase is configured.
  // Falls back to computing from TournamentContext matchResults in local/offline mode.
  useEffect(() => {
    if (!isFirebaseConfigured || !firestore) {
      // Offline fallback: find matches with a winnerTeamId === null but both teams set (in-progress)
      // We treat matchResults that have 'live: true' flag as live
      const liveFallback = Object.entries(matchResults)
        .filter(([, r]) => r?.live === true)
        .map(([id, r]) => ({ id, ...r }));
      setLiveMatches(liveFallback);
      return undefined;
    }

    // Targeted query: only listen to documents where status == 'LIVE'
    // This is a single, low-read-count query instead of scanning all matches.
    const q = query(
      collection(firestore, 'liveMatches'),
      where('status', '==', 'LIVE')
    );

    const unsub = onSnapshot(q, (snap) => {
      const matches = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLiveMatches(matches);
    }, (err) => {
      // Non-critical — ticker just disappears on error
      console.warn('[LiveTicker] Firestore error:', err.message);
      setLiveMatches([]);
    });

    return unsub;
  }, [matchResults]);

  // Expose ticker height to CSS so the nav can offset correctly
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--ticker-height',
      liveMatches.length > 0 ? `${TICKER_HEIGHT_PX}px` : '0px'
    );
    return () => {
      document.documentElement.style.setProperty('--ticker-height', '0px');
    };
  }, [liveMatches.length]);

  if (liveMatches.length === 0) return null;

  const getTeamName = (id) => allTeams.find((t) => t.id === id)?.name || id || '—';

  const tickerItems = liveMatches.map((m) => {
    const teamA = getTeamName(m.teamAId || m.teamA?.id);
    const teamB = getTeamName(m.teamBId || m.teamB?.id);
    const scoreA = m.scoreA ?? m.roundsA ?? m.killsA ?? 0;
    const scoreB = m.scoreB ?? m.roundsB ?? m.killsB ?? 0;
    return `🔴 LIVE · ${teamA} ${scoreA}–${scoreB} ${teamB}`;
  });

  const displayText = tickerItems.join('     ⬥     ');

  return (
    <div
      ref={tickerRef}
      className="fixed inset-x-0 top-0 z-50 flex items-center overflow-hidden bg-[#0d1a0d] border-b border-[rgba(34,197,94,0.4)]"
      style={{ height: TICKER_HEIGHT_PX }}
      role="marquee"
      aria-label="Live match scores"
    >
      {/* Live pill */}
      <div className="flex shrink-0 items-center gap-1.5 px-3 border-r border-[rgba(34,197,94,0.3)] h-full bg-[#0d1a0d]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        <span className="font-display text-[10px] font-bold tracking-[0.2em] text-green-400 whitespace-nowrap">LIVE</span>
      </div>

      {/* Scrolling text */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex whitespace-nowrap animate-ticker text-[12px] font-semibold text-green-300"
          style={{ '--ticker-content': `"${displayText}"` }}
        >
          <span className="pr-16">{displayText}</span>
          <span className="pr-16" aria-hidden="true">{displayText}</span>
        </div>
      </div>
    </div>
  );
}
