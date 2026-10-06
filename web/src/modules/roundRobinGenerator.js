/**
 * Generates a single round-robin schedule for a given number of teams.
 * Stores team IDs only so renames/logos stay in sync with the teams list.
 * @param {Array} teams - Array of team objects. Each team must have an 'id' property.
 * @returns {Array} An array of rounds, each round is an array of { id, teamAId, teamBId }.
 */
export const generateRoundRobin = (teams) => {
  if (teams.length < 2) {
    return [];
  }

  const hasBye = teams.length % 2 !== 0;
  const adjustedTeams = hasBye ? [...teams, null] : [...teams];
  const n = adjustedTeams.length;
  const rounds = [];

  let positions = Array.from({ length: n }, (_, i) => i);

  for (let round = 0; round < n - 1; round++) {
    const matches = [];
    for (let i = 0; i < n / 2; i++) {
      const teamA = adjustedTeams[positions[i]];
      const teamB = adjustedTeams[positions[n - 1 - i]];
      if (teamA === null || teamB === null) {
        continue;
      }
      const matchId = `match-${teamA.id}-${teamB.id}-${round}`;
      matches.push({ id: matchId, teamAId: teamA.id, teamBId: teamB.id });
    }
    rounds.push(matches);

    const last = positions.pop();
    positions.splice(1, 0, last);
  }

  return rounds;
};

export const generateGroupStage = (teams) => {
  const groups = ['A', 'B'];
  const schedules = groups.map((group) => generateRoundRobin(teams.filter((team) => (team.group || 'A') === group)));
  const totalRounds = Math.max(...schedules.map((schedule) => schedule.length), 0);
  return Array.from({ length: totalRounds }, (_, roundIndex) =>
    schedules.flatMap((schedule, groupIndex) =>
      (schedule[roundIndex] || []).map((match) => ({ ...match, group: groups[groupIndex] }))
    )
  );
};
