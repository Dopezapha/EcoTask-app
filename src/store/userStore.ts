import { create } from 'zustand';

export interface UserStats {
  treesPlanted: number;
  plasticCollected: number;
  co2Reduced: number;
}

export interface UserProfile {
  id: string;
  wallet: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  stats: UserStats;
}

interface UserState {
  profile: UserProfile | null;
  token: string | null;
  setProfile: (profile: UserProfile) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>(set => ({
  profile: null,
  token: null,
  setProfile: profile => set({ profile }),
  setToken: token => set({ token }),
  logout: () => set({ profile: null, token: null }),
}));
