import { adminDb } from '../config/firebase.js';
import { computeStandings } from '../services/standingsEngine.js';

// In-memory fallback state if database is not configured
let mockTournamentData = {
  id: 'current',
  name: 'Intramurals Esports 2026',
  game: 'mlbb',
  status: 'UPCOMING',
  teams: [],
  schedule: [],
  matchResults: {},
  playoffMatches: [],
  updatedAt: new Date().toISOString()
};

export const getTournamentData = async (req, res) => {
  try {
    if (adminDb) {
      const docRef = adminDb.collection('tournaments').doc('current');
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        return res.json({ success: true, data: snapshot.data() });
      }
    }
    return res.json({ success: true, data: mockTournamentData, source: 'cache/fallback' });
  } catch (error) {
    console.error('Error fetching tournament data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTournamentData = async (req, res) => {
  try {
    const updatePayload = req.body;
    updatePayload.updatedAt = new Date().toISOString();

    if (adminDb) {
      const docRef = adminDb.collection('tournaments').doc('current');
      await docRef.set(updatePayload, { merge: true });
      return res.json({ success: true, message: 'Tournament data updated successfully' });
    }

    mockTournamentData = { ...mockTournamentData, ...updatePayload };
    return res.json({ success: true, message: 'Tournament updated in fallback storage', data: mockTournamentData });
  } catch (error) {
    console.error('Error updating tournament data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStandings = async (req, res) => {
  try {
    let data = mockTournamentData;
    if (adminDb) {
      const docRef = adminDb.collection('tournaments').doc('current');
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        data = snapshot.data();
      }
    }

    const standings = computeStandings(
      data.teams || [],
      data.schedule || [],
      data.matchResults || {},
      data.game || 'mlbb'
    );

    return res.json({ success: true, standings });
  } catch (error) {
    console.error('Error computing standings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
