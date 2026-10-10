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
        set({ watchlist: JSON.parse(data), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.error("Failed to load watchlist", e);
      set({ isLoaded: true });
    }
  },
  addToWatchlist: async (item) => {
    const currentList = get().watchlist;
    if (!currentList.find(i => i.id.toString() === item.id.toString())) {
      const newList = [item, ...currentList];
      set({ watchlist: newList });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    }
  },
  removeFromWatchlist: async (id) => {
    const newList = get().watchlist.filter(i => i.id.toString() !== id.toString());
    set({ watchlist: newList });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  },
  isInWatchlist: (id) => {
    return get().watchlist.some(i => i.id.toString() === id.toString());
  }
}));
