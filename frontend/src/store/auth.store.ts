import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IAuthState } from '../types/auth';

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
