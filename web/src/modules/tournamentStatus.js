// Derives a public tournament status from real data only. No hardcoded fake status.
export function getTournamentStatus({ teamsCount, scheduledCount, completedCount }) {
  if (!teamsCount || teamsCount < 2) {
    return { key: 'registration', label: 'REGISTRATION OPEN', tone: 'info' };
  }
  if (!scheduledCount) {
    return { key: 'upcoming', label: 'TOURNAMENT UPCOMING', tone: 'info' };
  }
  if (completedCount <= 0) {
    return { key: 'upcoming', label: 'TOURNAMENT UPCOMING', tone: 'info' };
  }
  if (completedCount < scheduledCount) {
    return { key: 'ongoing', label: 'TOURNAMENT ONGOING', tone: 'live' };
  }
  return { key: 'completed', label: 'COMPLETED', tone: 'neutral' };
}

export function getNextUpcomingMatch({ scheduleByGame, resultsByGame, timeSlotsByGame }) {
  // Finds the first unplayed match across games with a real scheduled time if available.
  const candidates = [];
  for (const game of Object.keys(scheduleByGame || {})) {
    const rounds = scheduleByGame[game] || [];
    const results = (resultsByGame && resultsByGame[game]) || {};
    const slots = (timeSlotsByGame && timeSlotsByGame[game]) || [];
    rounds.forEach((round, roundIndex) => {
      const slot = slots[roundIndex];
      (round || []).forEach((match) => {
        if (results[match.id]?.winnerTeamId) return;
        candidates.push({
          game,
          match,
          roundNumber: roundIndex + 1,
          startTime: slot?.startTime ? new Date(slot.startTime) : null,
        });
      });
    });
  }
  candidates.sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime - b.startTime;
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return a.roundNumber - b.roundNumber;
  });
  return candidates[0] || null;
}
