import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchlistItem {
  id: string;
  title: string;
  posterUrl: string;
  mediaType: 'movie' | 'tv';
  voteAverage?: number;
}

interface WatchlistState {
  watchlist: WatchlistItem[];
  isLoaded: boolean;
  initWatchlist: () => Promise<void>;
  addToWatchlist: (item: WatchlistItem) => Promise<void>;
  removeFromWatchlist: (id: string) => Promise<void>;
  isInWatchlist: (id: string) => boolean;
}

const STORAGE_KEY = '@red_app_watchlist';

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlist: [],
  isLoaded: false,
  initWatchlist: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            set({ watchlist: parsed, isLoaded: true });
            return;
          }
        } catch {
          // Corrupted data fallback
        }
      }
      set({ watchlist: [], isLoaded: true });
    } catch (e) {
      console.warn("Failed to load watchlist from storage", e);
      set({ watchlist: [], isLoaded: true });
    }
  },
  addToWatchlist: async (item) => {
    try {
      const currentList = Array.isArray(get().watchlist) ? get().watchlist : [];
      const stringId = String(item.id);
      if (!currentList.find(i => String(i?.id) === stringId)) {
        const formattedItem: WatchlistItem = {
          ...item,
          id: stringId,
          posterUrl: item.posterUrl || 'https://via.placeholder.com/500x750?text=No+Poster',
        };
        const newList = [formattedItem, ...currentList];
        set({ watchlist: newList });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      }
    } catch (e) {
      console.warn("Failed to add to watchlist", e);
    }
  },
  removeFromWatchlist: async (id) => {
    try {
      const currentList = Array.isArray(get().watchlist) ? get().watchlist : [];
      const stringId = String(id);
      const newList = currentList.filter(i => String(i?.id) !== stringId);
      set({ watchlist: newList });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.warn("Failed to remove from watchlist", e);
    }
  },
  isInWatchlist: (id) => {
    try {
      const list = get().watchlist;
      if (!Array.isArray(list)) return false;
      return list.some(i => String(i?.id) === String(id));
    } catch {
      return false;
    }
  }
}));
