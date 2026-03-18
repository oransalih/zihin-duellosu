export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface BotProfile {
  difficulty: BotDifficulty;
  /** Think time range in ms [min, max] */
  thinkTimeRange: [number, number];
  /** Probability of picking the most-eliminating candidate */
  optimalPickRate: number;
  /** Probability of ignoring candidate filter (human-like mistake) */
  blunderRate: number;
  /** When candidateCount < this, speed up */
  endgameThreshold: number;
  /** Multiply thinkTime by this factor near endgame */
  endgameSpeedup: number;
}

export const BOT_PROFILES: Record<BotDifficulty, BotProfile> = {
  easy: {
    difficulty: 'easy',
    thinkTimeRange: [3000, 7000],
    optimalPickRate: 0.45,
    blunderRate: 0.12,
    endgameThreshold: 8,
    endgameSpeedup: 0.85,
  },
  medium: {
    difficulty: 'medium',
    thinkTimeRange: [2000, 5000],
    optimalPickRate: 0.65,
    blunderRate: 0.06,
    endgameThreshold: 6,
    endgameSpeedup: 0.65,
  },
  hard: {
    difficulty: 'hard',
    thinkTimeRange: [1500, 4000],
    optimalPickRate: 0.82,
    blunderRate: 0.02,
    endgameThreshold: 4,
    endgameSpeedup: 0.50,
  },
};

/**
 * Neutral, role-based names — not impersonating real people.
 * No personal/human names in this list.
 */
export const BOT_NAMES = [
  'Kaşif', 'Avcı', 'Çözücü', 'Gezgin', 'Akılcı',
  'Düşünür', 'Bulucu', 'Hesaplı', 'Stratejist', 'Meraklı',
  'Deneyimli', 'Takipçi', 'Zeki', 'Tecrübeli', 'Analitik',
];

/**
 * Opening guess pools per difficulty — varied so the same user
 * doesn't see the same first guess across matches.
 */
export const OPENING_POOLS: Record<BotDifficulty, string[]> = {
  easy:   ['1234', '5678', '2468', '1357', '9012', '3456', '7890', '1478'],
  medium: ['1235', '2467', '1390', '5802', '3714', '6091', '4823', '1560'],
  hard:   ['1023', '2345', '1458', '3690', '2057', '1679', '4081', '3702'],
};

export function selectBotDifficulty(): BotDifficulty {
  const r = Math.random();
  if (r < 0.40) return 'easy';
  if (r < 0.80) return 'medium';
  return 'hard';
}

export function selectBotName(): string {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]!;
}
