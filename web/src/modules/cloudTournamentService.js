import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, collection, query, where } from 'firebase/firestore';
import { firestore } from './firebase';

const tournamentDocument = () => doc(firestore, 'tournaments', 'current');
const organizerDocument = (uid) => doc(firestore, 'organizers', uid);

// Checks whether the signed-in account is registered as an organizer.
// Returns true/false, or null when the deployed rules deny even reading
// your own organizer document (older rules) — meaning "unknown".
export const fetchIsOrganizer = async (uid) => {
  if (!firestore) {
    throw new Error('Firebase Firestore is not configured.');
  }
  try {
    const snapshot = await getDoc(organizerDocument(uid));
    return snapshot.exists();
  } catch (error) {
    if (error?.code === 'permission-denied') return null;
    throw error;
  }
};

// Maps raw Firestore errors to one clear, actionable line for the UI.
export const describeCloudError = (error) => {
  const code = error?.code || '';
  if (code === 'permission-denied') {
    return 'Firestore blocked the request (permissions). Deploy the latest firestore.rules and make sure this account is registered as an organizer. Data is safe on this device.';
  }
  if (code === 'unauthenticated') {
    return 'Your sign-in session expired. Sign in again to resume cloud sync.';
  }
  if (code === 'unavailable' || code === 'deadline-exceeded' || code === 'cancelled') {
    return 'Cannot reach Firestore (network, offline, or a content blocker). Changes are stored locally.';
  }
  if (code === 'failed-precondition' || code === 'not-found') {
    return 'Firestore database is not set up for this Firebase project yet. Create it in the Firebase console.';
  }
  return error?.message || 'Unknown cloud sync problem. Changes are stored locally.';
};

export const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

export const subscribeToCloudTournament = (onData, onError) => {
  if (!firestore) {
    throw new Error('Firebase Firestore is not configured.');
  }

  return onSnapshot(tournamentDocument(), (snapshot) => {
    if (!snapshot.exists()) {
      onData(null);
      return;
    }

    const tournamentData = { ...snapshot.data() };
    delete tournamentData.updatedAt;
    delete tournamentData.updatedBy;
    onData(tournamentData);
  }, onError);
};

export const saveCloudTournament = (tournamentData, userId) => {
  if (!firestore) {
    throw new Error('Firebase Firestore is not configured.');
  }

  return setDoc(tournamentDocument(), {
    ...tournamentData,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
};

/**
 * Quota-optimized listener: Only queries documents where status == 'LIVE'.
 * Restricts real-time listener reads strictly to matches actively in progress.
 */
export const subscribeToLiveMatches = (onData, onError) => {
  if (!firestore) {
    throw new Error('Firebase Firestore is not configured.');
  }

  const liveQuery = query(
    collection(firestore, 'liveMatches'),
    where('status', '==', 'LIVE')
  );

  return onSnapshot(liveQuery, (snapshot) => {
    const liveMatches = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onData(liveMatches);
  }, onError);
};

/**
 * Quota-optimized listener: Only reads the single leaderboard/summary document.
 */
export const subscribeToLeaderboardSummary = (onData, onError) => {
  if (!firestore) {
    throw new Error('Firebase Firestore is not configured.');
  }

  return onSnapshot(doc(firestore, 'leaderboard', 'summary'), (snapshot) => {
    if (!snapshot.exists()) {
      onData(null);
      return;
    }
    onData(snapshot.data());
  }, onError);
};

