/**
 * Sample Tournament Data for University of Cebu - Banilad (UCB) Intramurals
 */
export const SAMPLE_TOURNAMENT = {
  name: 'UCB Intramurals 2026 Esports Championship',
  organizer: 'UCB Supreme Student Council & Webmasters Esports',
  date: '2026-10-15',
  format: 'single-round-robin',
  expectedTeams: 12,
};

export const SAMPLE_TEAMS = [
  // MLBB Teams (Group A)
  {
    id: 'mlbb-ccs',
    name: 'College of Computer Studies',
    tag: 'CCS',
    game: 'mlbb',
    group: 'A',
    seed: 1,
    color: '#3B82F6',
  },
  {
    id: 'mlbb-cba',
    name: 'College of Business Administration',
    tag: 'CBA',
    game: 'mlbb',
    group: 'A',
    seed: 2,
    color: '#F59E0B',
  },
  {
    id: 'mlbb-coe',
    name: 'College of Engineering',
    tag: 'COE',
    game: 'mlbb',
    group: 'A',
    seed: 3,
    color: '#EF4444',
  },
  {
    id: 'mlbb-cas',
    name: 'College of Arts and Sciences',
    tag: 'CAS',
    game: 'mlbb',
    group: 'A',
    seed: 4,
    color: '#8B5CF6',
  },
  // MLBB Teams (Group B)
  {
    id: 'mlbb-ccj',
    name: 'College of Criminal Justice',
    tag: 'CCJ',
    game: 'mlbb',
    group: 'B',
    seed: 1,
    color: '#10B981',
  },
  {
    id: 'mlbb-cte',
    name: 'College of Teacher Education',
    tag: 'CTE',
    game: 'mlbb',
    group: 'B',
    seed: 2,
    color: '#EC4899',
  },
  {
    id: 'mlbb-chm',
    name: 'College of Hospitality Management',
    tag: 'CHM',
    game: 'mlbb',
    group: 'B',
    seed: 3,
    color: '#14B8A6',
  },
  {
    id: 'mlbb-cnahs',
    name: 'College of Nursing & Allied Health',
    tag: 'CNAHS',
    game: 'mlbb',
    group: 'B',
    seed: 4,
    color: '#F97316',
  },

  // VALORANT Teams (Group A)
  {
    id: 'val-ccs',
    name: 'College of Computer Studies',
    tag: 'CCS',
    game: 'valorant',
    group: 'A',
    seed: 1,
    color: '#3B82F6',
  },
  {
    id: 'val-coe',
    name: 'College of Engineering',
    tag: 'COE',
    game: 'valorant',
    group: 'A',
    seed: 2,
    color: '#EF4444',
  },
  {
    id: 'val-cba',
    name: 'College of Business Administration',
    tag: 'CBA',
    game: 'valorant',
    group: 'A',
    seed: 3,
    color: '#F59E0B',
  },
  {
    id: 'val-cit',
    name: 'College of Information Technology',
    tag: 'CIT',
    game: 'valorant',
    group: 'A',
    seed: 4,
    color: '#06B6D4',
  },
  // VALORANT Teams (Group B)
  {
    id: 'val-ccj',
    name: 'College of Criminal Justice',
    tag: 'CCJ',
    game: 'valorant',
    group: 'B',
    seed: 1,
    color: '#10B981',
  },
  {
    id: 'val-cas',
    name: 'College of Arts and Sciences',
    tag: 'CAS',
    game: 'valorant',
    group: 'B',
    seed: 2,
    color: '#8B5CF6',
  },
  {
    id: 'val-cte',
    name: 'College of Teacher Education',
    tag: 'CTE',
    game: 'valorant',
    group: 'B',
    seed: 3,
    color: '#EC4899',
  },
  {
    id: 'val-cnahs',
    name: 'College of Nursing & Allied Health',
    tag: 'CNAHS',
    game: 'valorant',
    group: 'B',
    seed: 4,
    color: '#F97316',
  },
];

export const SAMPLE_SCORING_CONFIG = [
  { minSeconds: 0, maxSeconds: 600, points: 5 },    // Under 10m: 5 pts
  { minSeconds: 601, maxSeconds: 900, points: 4 },  // 10:01 - 15m: 4 pts
  { minSeconds: 901, maxSeconds: 3600, points: 3 }, // 15m+: 3 pts
];
