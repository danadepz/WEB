/**
 * Resolve a team reference (id or legacy embedded object) against the live teams list.
 */
export const resolveTeam = (teams, teamOrId) => {
  if (teamOrId == null) return null;
  const id = typeof teamOrId === 'string' ? teamOrId : teamOrId.id;
  const live = teams.find((t) => t.id === id);
  if (live) return live;
  if (typeof teamOrId === 'object') return teamOrId;
  return { id, name: 'Unknown Team', tag: '???', logo: null, seed: 0 };
};

/**
 * Normalize a match to include live teamA/teamB plus stable teamAId/teamBId.
 * Supports legacy matches that embedded full team objects.
 */
export const resolveMatch = (match, teams) => {
  const teamAId = match.teamAId ?? match.teamA?.id;
  const teamBId = match.teamBId ?? match.teamB?.id;
  return {
    ...match,
    teamAId,
    teamBId,
    teamA: resolveTeam(teams, teamAId ?? match.teamA),
    teamB: resolveTeam(teams, teamBId ?? match.teamB),
  };
};

export const resolveSchedule = (schedule, teams) =>
  (schedule || []).map((round) => (round || []).map((match) => resolveMatch(match, teams)));

/** Parse YYYY-MM-DD (+ optional HH:MM) as a local Date (avoids UTC midnight skew). */
export const parseLocalDateTime = (dateStr, timeStr = '09:00') => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = String(timeStr || '09:00').split(':').map((n) => parseInt(n, 10) || 0);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

export const formatLocalTimeInput = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '09:00';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const formatLocalDateInput = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
