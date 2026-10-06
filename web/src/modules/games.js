export const GAMES = [
  { id: 'mlbb', short: 'MLBB', label: 'Mobile Legends: Bang Bang' },
  { id: 'valorant', short: 'VALORANT', label: 'Valorant' },
];

export const DEFAULT_GAME = 'mlbb';

export const gameLabel = (gameId) =>
  GAMES.find((g) => g.id === gameId)?.label || 'Mobile Legends: Bang Bang';

export const gameShort = (gameId) =>
  GAMES.find((g) => g.id === gameId)?.short || 'MLBB';

export const isValidGame = (gameId) => GAMES.some((g) => g.id === gameId);

export const emptyGameMap = (factory = () => []) =>
  Object.fromEntries(GAMES.map((g) => [g.id, factory()]));
