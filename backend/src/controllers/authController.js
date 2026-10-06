import { adminAuth, adminDb } from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: missing bearer token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (adminAuth) {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      return next();
    }
    // Fallback for development without active service account
    req.user = { uid: 'dev-user', email: 'organizer@intramurals.local' };
    next();
  } catch (error) {
    console.error('Auth verification failed:', error);
    return res.status(403).json({ success: false, message: 'Invalid authentication token' });
  }
};

export const checkOrganizerRole = async (req, res) => {
  const { uid } = req.user;
  try {
    if (adminDb) {
      const doc = await adminDb.collection('organizers').doc(uid).get();
      return res.json({ success: true, isOrganizer: doc.exists });
    }
    return res.json({ success: true, isOrganizer: true, note: 'Dev mode bypass' });
  } catch (error) {
    console.error('Role check error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
