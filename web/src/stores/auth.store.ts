import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthState {
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      login: (token, email) => set({ token, email }),
      logout: () => set({ token: null, email: null }),
    }),
    {
      name: STORAGE_KEYS.ADMIN_AUTH,
    },
  ),
);