import { adminDb } from '../config/firebase.js';
import { computeStandings } from '../services/standingsEngine.js';

/**
 * Refresh the leaderboard/summary document.
 * Called by coordinators after entering match scores to keep the
 * public leaderboard page quota-optimised (one document read per visitor).
 */
export const refreshLeaderboard = async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(503).json({ success: false, message: 'Firestore Admin SDK not configured.' });
    }

    // Read tournament data
    const docRef = adminDb.collection('tournaments').doc('current');
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'No tournament data found.' });
    }

    const data = snap.data();
    const { teams = [], schedulesByGame = {}, matchResultsByGame = {} } = data;

    // Compute standings per game and aggregate by department
    const deptMap = new Map();

    const processGame = (gameId) => {
      const gameTeams = teams.filter((t) => (t.game || 'mlbb') === gameId);
      const gameSchedule = schedulesByGame[gameId] || [];
      const gameResults = matchResultsByGame[gameId] || {};

      const standings = computeStandings(gameTeams, gameSchedule, gameResults, gameId);

      standings.forEach((s, rank) => {
        const team = teams.find((t) => t.id === s.teamId);
        const dept = team?.department || 'Unknown';

        if (!deptMap.has(dept)) {
          deptMap.set(dept, {
            department: dept,
            gold: 0,
            silver: 0,
            bronze: 0,
            totalPoints: 0,
            wins: 0,
          });
        }

        const entry = deptMap.get(dept);
        if (rank === 0) entry.gold += 1;
        else if (rank === 1) entry.silver += 1;
        else if (rank === 2) entry.bronze += 1;
        entry.totalPoints += s.points;
        entry.wins += s.wins;
      });
    };

    processGame('mlbb');
    processGame('valorant');

    const departments = Array.from(deptMap.values()).sort(
      (a, b) =>
        b.gold - a.gold ||
        b.silver - a.silver ||
        b.bronze - a.bronze ||
        b.totalPoints - a.totalPoints
    );

    const summary = {
      departments,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.uid || 'system',
    };

    // Write single summary document — the entire public leaderboard page reads only this doc
    await adminDb.collection('leaderboard').doc('summary').set(summary);

    return res.json({ success: true, message: 'Leaderboard summary refreshed.', summary });
  } catch (error) {
    console.error('Error refreshing leaderboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(503).json({ success: false, message: 'Firestore not configured.' });
    }
    const snap = await adminDb.collection('leaderboard').doc('summary').get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'No leaderboard summary yet. Call POST /refresh first.' });
    }
    return res.json({ success: true, ...snap.data() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
