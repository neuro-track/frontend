import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  fetchUserFromApi: () => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    try {
      // TODO: Replace with actual API call (password will be used then)
      const mockUser: User = {
        id: '1',
        name: 'Demo User',
        email: email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
        joinedAt: new Date(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Fetch current logged user from backend (/api/v1/me). Uses cookies (credentials: 'include').
  fetchUserFromApi: async () => {
    set({ isLoading: true });
    try {
  const apiBase = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/v1/me`, {
        credentials: 'include'
      });

      if (!res.ok) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const data = await res.json();
      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
        joinedAt: new Date()
      };

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Try to notify backend, but always clear local state.
    (async () => {
      try {
  const apiBase = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:3000';
        await fetch(`${apiBase}/api/v1/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (err) {
        // ignore
      }
    })();

    set({ user: null, isAuthenticated: false });
  },

  register: async (name: string, email: string, _password: string) => {
    set({ isLoading: true });
    try {
      // TODO: Replace with actual API call (password will be used then)
      const mockUser: User = {
        id: '1',
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        joinedAt: new Date(),
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
