// stores/useAuthStore.ts
import { create } from 'zustand';
import { syncUser, getCurrentUser } from '@/features/auth/api/auth';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  sync: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  fetchUser: async () => {
    try {
      const user = await getCurrentUser();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  sync: async () => {
    try {
      const data = await syncUser();
      set({ user: data });
    } catch (error) {
      console.error('Failed to sync user:', error);
    }
  },
}));