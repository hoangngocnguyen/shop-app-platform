import { create } from "zustand";
import { syncUser, getCurrentUser } from "@/features/auth/api/auth";
import { createClient } from "@/lib/supabase/client";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: () => boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  fetchUser: () => Promise<void>;
  sync: () => Promise<User | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  isAuthenticated: () => get().user !== null,

  setUser: (user) => set({ user }),

  setIsLoading: (isLoading) => set({ isLoading }),

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  sync: async () => {
    try {
      await syncUser();
      const user = await getCurrentUser();
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      console.error("Failed to sync/fetch user:", error);
      set({ user: null, isLoading: false });
      return null;
    }
  },

  logout: async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out from Supabase:", error);
    } finally {
      set({ user: null, isLoading: false });
    }
  },
}));