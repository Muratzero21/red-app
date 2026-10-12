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
    const stringId = String(item.id);
    if (!currentList.find(i => String(i.id) === stringId)) {
      const formattedItem: WatchlistItem = {
        ...item,
        id: stringId,
        posterUrl: item.posterUrl || 'https://via.placeholder.com/500x750?text=No+Poster',
      };
      const newList = [formattedItem, ...currentList];
      set({ watchlist: newList });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    }
  },
  removeFromWatchlist: async (id) => {
    const stringId = String(id);
    const newList = get().watchlist.filter(i => String(i.id) !== stringId);
    set({ watchlist: newList });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  },
  isInWatchlist: (id) => {
    return get().watchlist.some(i => String(i.id) === String(id));
  }
}));
