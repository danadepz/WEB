import { adminDb } from '../config/firebase.js';

export const getPlayerStats = async (req, res) => {
  try {
    if (adminDb) {
      const snapshot = await adminDb.collection('playerStats').get();
      const stats = snapshot.docs.map(doc => doc.data());
      return res.json({ success: true, stats });
    }

    // Mock stats fallback for live viewer & mobile app
    const mockStats = [
      { id: 'p1', name: 'Raven "Apex" De Paz', team: 'CCS CyberKnights', kda: '8.4', mvpCount: 5, matchesPlayed: 6 },
      { id: 'p2', name: 'Cyan "Ghost" Santos', team: 'CBA Titans', kda: '6.2', mvpCount: 3, matchesPlayed: 6 },
      { id: 'p3', name: 'Kael "Viper" Reyes', team: 'COE Engineers', kda: '5.9', mvpCount: 2, matchesPlayed: 5 },
      { id: 'p4', name: 'Lyra "Nova" Cruz', team: 'CAS Spartans', kda: '5.1', mvpCount: 2, matchesPlayed: 5 }
    ];

    return res.json({ success: true, stats: mockStats });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
