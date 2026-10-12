import { create } from 'zustand';

interface AuthState {
  user: any | null;
  isInitialized: boolean;
  setUser: (user: any | null) => void;
  setInitialized: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: true,
  setUser: (user) => set({ user }),
  setInitialized: (val) => set({ isInitialized: val }),
}));
