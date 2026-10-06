/**
 * Schedules a round-robin tournament across lobbies and time.
 * When a round has more matches than lobbies, matches are queued in waves
 * so each lobby only runs one match at a time.
 */
export const scheduleTimeSlots = (
  tournamentStartTime,
  roundDurationMinutes,
  breakDurationMinutes,
  numberOfLobbies,
  schedule
) => {
  let currentTime =
    tournamentStartTime instanceof Date
      ? tournamentStartTime.getTime()
      : tournamentStartTime;
  const lobbies = Math.max(1, numberOfLobbies || 1);
  const roundDurationMs = Math.max(1, roundDurationMinutes) * 60 * 1000;
  const breakDurationMs = Math.max(0, breakDurationMinutes) * 60 * 1000;

  const scheduledRounds = [];

  schedule.forEach((roundMatches, roundIndex) => {
    const lobbyAssignments = Array.from({ length: lobbies }, () => []);
    roundMatches.forEach((match, matchIndex) => {
      lobbyAssignments[matchIndex % lobbies].push(match);
    });

    const waves = Math.max(1, Math.ceil(roundMatches.length / lobbies));
    const roundBlockMs = waves * roundDurationMs;
    const startTime = new Date(currentTime);
    const endTime = new Date(currentTime + roundBlockMs);

    scheduledRounds.push({
      roundNumber: roundIndex + 1,
      startTime,
      endTime,
      waves,
      lobbyAssignments,
    });

    currentTime += roundBlockMs + breakDurationMs;
  });

  return scheduledRounds;
};
