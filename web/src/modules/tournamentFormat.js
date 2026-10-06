// Tournament format facts derived from the official rulebook
// ("MLBB AND VALORANT - INTRAMURALS TOURNAMENT PICTURE.pdf").
// Group stage: single round robin (BO1), two groups of 6 per title.
// Play-ins (BO3) -> upper/lower bracket playoffs -> grand finals.

export const GROUPS_PER_GAME = ['A', 'B'];
export const TEAMS_PER_GROUP = 6;
export const MAX_TEAMS_PER_GAME = GROUPS_PER_GAME.length * TEAMS_PER_GROUP; // 12

// 5v5 titles; up to 2 substitutes per registered squad.
export const STARTERS_PER_TEAM = 5;
export const MAX_SUBSTITUTES = 2;

export const FORMAT_CHIPS = [
  '12 SLOTS PER TITLE',
  '2 GROUPS × 6 TEAMS',
  'SINGLE ROUND ROBIN · BO1',
  'PLAY-INS · BO3',
];

export const KEY_DATES = [
  { label: 'Group Stage · Day 1', value: 'Nov 14, 2026' },
  { label: 'Group Stage · Day 2', value: 'Nov 20, 2026' },
  { label: 'Play-ins (BO3)', value: 'Nov 23 MLBB · Nov 24 VALORANT' },
  { label: 'Playoffs', value: 'Nov 25 MLBB · Nov 26 VALORANT' },
  { label: 'Grand Finals', value: 'Nov 27, 2026' },
];
