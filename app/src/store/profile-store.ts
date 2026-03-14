import { create } from 'zustand';
import {
  PlayerProfile,
  PlayerStats,
  loadProfile,
  loadStats,
  saveProfile,
  recordGameResult,
} from '../services/profile-repository';

interface ProfileStore {
  profile: PlayerProfile;
  stats: PlayerStats;
  loaded: boolean;

  // Actions
  initialize: () => Promise<void>;
  setUsername: (username: string) => Promise<void>;
  setHasSeenOnboarding: () => Promise<void>;
  recordResult: (winner: 'you' | 'opponent' | 'draw', guessCount: number) => Promise<void>;
}

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

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: DEFAULT_PROFILE,
  stats: DEFAULT_STATS,
  loaded: false,

  initialize: async () => {
    const [profile, stats] = await Promise.all([loadProfile(), loadStats()]);
    set({ profile, stats, loaded: true });
  },

  setUsername: async (username: string) => {
    const trimmed = username.trim();
    await saveProfile({ username: trimmed });
    set((s) => ({ profile: { ...s.profile, username: trimmed } }));
  },

  setHasSeenOnboarding: async () => {
    await saveProfile({ hasSeenOnboarding: true });
    set((s) => ({ profile: { ...s.profile, hasSeenOnboarding: true } }));
  },

  recordResult: async (winner, guessCount) => {
    // Avoid double-recording the same result across re-renders
    const updated = await recordGameResult(winner, guessCount);
    set({ stats: updated });
  },
}));
