/**
 * Computes standings from match results.
 * Prefers stored pointsA/pointsB from match results; falls back to 3 pts per win.
 */
export const computeStandings = (teams, schedule, matchResults, game = 'mlbb') => {
  const standingsMap = new Map();
  teams.forEach((team) => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      teamTag: team.tag,
      teamLogo: team.logo,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0,
      scoreDifferential: 0,
      roundsFor: 0,
      roundsAgainst: 0,
      roundDifferential: 0,
      totalWinTime: 0,
      timedWins: 0,
      averageWinTime: null,
      winRate: 0,
    });
  });

  schedule.forEach((round) => {
    round.forEach((match) => {
      const result = matchResults[match.id];
      if (!result) return;

      const teamAId = match.teamAId ?? match.teamA?.id;
      const teamBId = match.teamBId ?? match.teamB?.id;
      const teamAStanding = standingsMap.get(teamAId);
      const teamBStanding = standingsMap.get(teamBId);
      if (!teamAStanding || !teamBStanding) return;

      const { winnerTeamId, durationSeconds } = result;
      const isFinalizedResult = Boolean(winnerTeamId)
        && (winnerTeamId === teamAId || winnerTeamId === teamBId);
      if (!isFinalizedResult) return;

      teamAStanding.played += 1;
      teamBStanding.played += 1;

      const roundsA = Number.isFinite(result.roundsA)
        ? result.roundsA
        : Number.isFinite(result.killsA)
          ? result.killsA
          : 0;
      const roundsB = Number.isFinite(result.roundsB)
        ? result.roundsB
        : Number.isFinite(result.killsB)
          ? result.killsB
          : 0;

      if (game === 'valorant' || game === 'mlbb') {
        teamAStanding.scoreDifferential += roundsA - roundsB;
        teamBStanding.scoreDifferential += roundsB - roundsA;
      }
      if (game === 'valorant') {
        teamAStanding.roundsFor += roundsA;
        teamAStanding.roundsAgainst += roundsB;
        teamAStanding.roundDifferential += roundsA - roundsB;
        teamBStanding.roundsFor += roundsB;
        teamBStanding.roundsAgainst += roundsA;
        teamBStanding.roundDifferential += roundsB - roundsA;
      }

      // 2 points for a win, 0 for a loss.
      teamAStanding.points += winnerTeamId === teamAId ? 2 : 0;
      teamBStanding.points += winnerTeamId === teamBId ? 2 : 0;

      // Forfeits don't count toward average win time.
      const hasRealDuration =
        !result.forfeit && Number.isFinite(durationSeconds) && durationSeconds > 0;

      if (winnerTeamId === teamAId) {
        teamAStanding.wins += 1;
        teamBStanding.losses += 1;
        if (hasRealDuration) {
          teamAStanding.totalWinTime += durationSeconds;
          teamAStanding.timedWins += 1;
        }
      } else if (winnerTeamId === teamBId) {
        teamBStanding.wins += 1;
        teamAStanding.losses += 1;
        if (hasRealDuration) {
          teamBStanding.totalWinTime += durationSeconds;
          teamBStanding.timedWins += 1;
        }
      }
    });
  });

  const standingsArray = Array.from(standingsMap.values()).map((standing) => {
    standing.winRate = standing.played > 0 ? (standing.wins / standing.played) * 100 : 0;
    standing.averageWinTime = standing.timedWins
      ? standing.totalWinTime / standing.timedWins
      : null;
    return standing;
  });

  standingsArray.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (game === 'valorant' && b.roundDifferential !== a.roundDifferential) {
      return b.roundDifferential - a.roundDifferential;
    }
    if (game === 'mlbb') {
      const avgA = a.averageWinTime ?? Infinity;
      const avgB = b.averageWinTime ?? Infinity;
      if (avgA !== avgB) return avgA - avgB;
    }
    return b.scoreDifferential - a.scoreDifferential;
  });

  return standingsArray;
};
