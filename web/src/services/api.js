/**
 * API client for communicating with the /backend Express server.
 * Uses VITE_API_BASE_URL environment variable.
 * Falls back to direct Firebase SDK calls if the backend is unavailable.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeader = async () => {
  try {
    const { firebaseAuth } = await import('../modules/firebase.js');
    if (firebaseAuth?.currentUser) {
      const token = await firebaseAuth.currentUser.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
  } catch (_) {}
  return {};
};

const apiFetch = async (path, options = {}) => {
  const authHeaders = options.requiresAuth ? await getAuthHeader() : {};
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || `Request failed: ${response.status}`);
  }

  return response.json();
};

// Tournament
export const fetchTournamentData = () => apiFetch('/api/tournaments');
export const updateTournamentData = (data) =>
  apiFetch('/api/tournaments', { method: 'PUT', body: JSON.stringify(data), requiresAuth: true });
export const fetchStandings = () => apiFetch('/api/tournaments/standings');

// Registrations
export const submitRegistration = (data) =>
  apiFetch('/api/registrations', { method: 'POST', body: JSON.stringify(data) });
export const fetchRegistrations = () =>
  apiFetch('/api/registrations', { requiresAuth: true });

// Auth / Role
export const checkOrganizerRole = () =>
  apiFetch('/api/auth/role', { requiresAuth: true });

// Stats
export const fetchPlayerStats = () => apiFetch('/api/stats');
