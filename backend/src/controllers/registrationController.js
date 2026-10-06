import { adminDb } from '../config/firebase.js';

let mockRegistrations = [];

export const submitRegistration = async (req, res) => {
  try {
    const { teamName, department, captainName, contactEmail, players, game } = req.body;
    
    if (!teamName || !department || !captainName) {
      return res.status(400).json({ success: false, message: 'Missing required team fields' });
    }

    const registrationDoc = {
      id: `reg_${Date.now()}`,
      teamName,
      department,
      captainName,
      contactEmail,
      players: players || [],
      game: game || 'mlbb',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    if (adminDb) {
      await adminDb.collection('registrations').doc(registrationDoc.id).set(registrationDoc);
    } else {
      mockRegistrations.push(registrationDoc);
    }

    return res.status(201).json({ success: true, message: 'Registration submitted successfully', registration: registrationDoc });
  } catch (error) {
    console.error('Error submitting registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRegistrations = async (req, res) => {
  try {
    if (adminDb) {
      const snapshot = await adminDb.collection('registrations').get();
      const list = snapshot.docs.map(doc => doc.data());
      return res.json({ success: true, registrations: list });
    }
    return res.json({ success: true, registrations: mockRegistrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
