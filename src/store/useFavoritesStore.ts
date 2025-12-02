import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Favorite } from '../types';

interface FavoritesState {
  favorites: Favorite[];

  addFavorite: (resourceId: string, resourceType: 'course' | 'node', userId: string) => void;
  removeFavorite: (favoriteId: string) => void;
  isFavorite: (resourceId: string) => boolean;
  getFavoritesByType: (resourceType: 'course' | 'node') => Favorite[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (resourceId, resourceType, userId) => {
        const newFavorite: Favorite = {
          id: crypto.randomUUID(),
          userId,
          resourceId,
          resourceType,
          createdAt: new Date(),
        };

        set((state) => ({
          favorites: [...state.favorites, newFavorite],
        }));
      },

      removeFavorite: (favoriteId) => {
        set((state) => ({
          favorites: state.favorites.filter(fav => fav.id !== favoriteId),
        }));
      },

      isFavorite: (resourceId) => {
        return get().favorites.some(fav => fav.resourceId === resourceId);
      },

      getFavoritesByType: (resourceType) => {
        return get().favorites.filter(fav => fav.resourceType === resourceType);
      },
    }),
    {
      name: 'favorites-storage',
    }
  )
);
