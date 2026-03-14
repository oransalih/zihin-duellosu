/**
 * ProfileRepository — local persistence for profile and stats.
 * All data stored in AsyncStorage. This abstraction makes future
 * migration to server-side persistence straightforward.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlayerProfile {
  username: string;
  hasSeenOnboarding: boolean;
  lastUpdatedAt: number;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  /** Fewest guesses used to win a game. null = no wins recorded. */
  bestWinGuessCount: number | null;
  lastUpdatedAt: number;
}

const PROFILE_KEY = '@profile:data';
const STATS_KEY = '@profile:stats';

const DEFAULT_PROFILE: PlayerProfile = {
  username: '',
  hasSeenOnboarding: false,
  lastUpdatedAt: 0,
};

const DEFAULT_STATS: PlayerStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  bestWinGuessCount: null,
  lastUpdatedAt: 0,
};

// ── Profile ──────────────────────────────────────────────────────────────────

export async function loadProfile(): Promise<PlayerProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(profile: Partial<PlayerProfile>): Promise<void> {
  try {
    const current = await loadProfile();
    const updated: PlayerProfile = {
      ...current,
      ...profile,
      lastUpdatedAt: Date.now(),
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  } catch {
    // Silent — non-critical persistence failure
  }
}

// ── Stats ────────────────────────────────────────────────────────────────────

export async function loadStats(): Promise<PlayerStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export async function saveStats(stats: Partial<PlayerStats>): Promise<void> {
  try {
    const current = await loadStats();
    const updated: PlayerStats = {
      ...current,
      ...stats,
      lastUpdatedAt: Date.now(),
    };
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch {
    // Silent — non-critical persistence failure
  }
}

/**
 * Record the outcome of a finished game.
 * winner: 'you' | 'opponent' | 'draw'
 * yourGuessCount: number of guesses you made
 */
export async function recordGameResult(
  winner: 'you' | 'opponent' | 'draw',
  yourGuessCount: number
): Promise<PlayerStats> {
  const current = await loadStats();
  const updated: PlayerStats = {
    ...current,
    totalGames: current.totalGames + 1,
    wins: winner === 'you' ? current.wins + 1 : current.wins,
    losses: winner === 'opponent' ? current.losses + 1 : current.losses,
    draws: winner === 'draw' ? current.draws + 1 : current.draws,
    bestWinGuessCount:
      winner === 'you'
        ? current.bestWinGuessCount === null
          ? yourGuessCount
          : Math.min(current.bestWinGuessCount, yourGuessCount)
        : current.bestWinGuessCount,
    lastUpdatedAt: Date.now(),
  };
  await saveStats(updated);
  return updated;
}

// ── Username Validation ───────────────────────────────────────────────────────

export function validateUsername(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: 'required' };
  if (trimmed.length < 2) return { valid: false, error: 'tooShort' };
  if (trimmed.length > 16) return { valid: false, error: 'tooLong' };
  if (!/^[\w\u00C0-\u024F\u1E00-\u1EFF]+$/.test(trimmed)) {
    return { valid: false, error: 'invalidChars' };
  }
  return { valid: true };
}
