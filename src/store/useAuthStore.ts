import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  logout: () => {
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
