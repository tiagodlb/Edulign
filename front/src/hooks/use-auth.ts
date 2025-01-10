import { create } from 'zustand';
import { AUTH_COOKIE_CONFIG } from '@/lib/constants/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  setAuth: (user: { id: string; email: string } | null) => void;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuth: (user) => set({ isAuthenticated: !!user, user }),
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));