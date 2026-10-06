/**
 * Calculates points for a match based on duration and scoring rules.
 */
export const calculatePoints = (
  winnerTeamId,
  loserTeamId,
  durationSeconds,
  scoringRules = [],
  lossPoints = 0
) => {
  let winnerPoints = lossPoints;
  for (const rule of scoringRules) {
    if (durationSeconds >= rule.minSeconds && durationSeconds <= rule.maxSeconds) {
      winnerPoints = rule.points;
      break;
    }
  }

  return { winnerPoints, loserPoints: lossPoints };
};

/** Calculates points for a match, regardless of game type. */
export const calculateMatchPoints = () => ({ winnerPoints: 2, loserPoints: 0 });

/** Converts MM:SS to total seconds. Returns NaN if invalid. */
export const timeToSeconds = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return NaN;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return NaN;
  const minutes = Number(parts[0]);
  const seconds = Number(parts[1]);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return NaN;
  if (seconds < 0 || seconds >= 60 || minutes < 0) return NaN;
  return minutes * 60 + seconds;
};

/** Converts total seconds to MM:SS (rounds fractional values). */
export const secondsToTime = (totalSeconds) => {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
