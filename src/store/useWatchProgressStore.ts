import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ContinueWatchingItem {
  showId: string;
  showTitle: string;
  mediaType: 'cartoon' | 'stream' | 'tv' | 'movie';
  posterUrl: string;
  backdropUrl?: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeId: string;
  episodeTitle: string;
  youtubeId: string;
  thumbnail?: string;
  overview?: string;
  currentTime: number; // seconds
  duration: number; // seconds
  progress: number; // 0..1
  remainingMinutes: number;
  updatedAt: number;
}

export interface EpisodeProgressEntry {
  currentTime: number;
  duration: number;
  progress: number;
  seasonNumber: number;
  episodeNumber: number;
  updatedAt: number;
}

interface WatchProgressState {
  continueWatching: ContinueWatchingItem[];
  episodeProgress: Record<string, EpisodeProgressEntry>;
  isLoaded: boolean;
  initWatchProgress: () => Promise<void>;
  saveProgress: (payload: {
    showId: string;
    showTitle: string;
    mediaType: 'cartoon' | 'stream' | 'tv' | 'movie';
    posterUrl: string;
    backdropUrl?: string;
    seasonNumber: number;
    episodeNumber: number;
    episodeId: string;
    episodeTitle: string;
    youtubeId: string;
    thumbnail?: string;
    overview?: string;
    currentTime: number;
    duration: number;
  }) => Promise<void>;
  removeFromContinueWatching: (showId: string) => Promise<void>;
  getShowProgress: (showId: string) => ContinueWatchingItem | undefined;
  getEpisodeProgress: (
    showId: string,
    seasonNumber: number,
    episodeNumber: number
  ) => EpisodeProgressEntry | undefined;
}

const STORAGE_KEY = '@red_app_watch_progress_v1';

const makeEpisodeKey = (showId: string, seasonNumber: number, episodeNumber: number) =>
  `${String(showId)}:S${seasonNumber}:E${episodeNumber}`;

export const useWatchProgressStore = create<WatchProgressState>((set, get) => ({
  continueWatching: [],
  episodeProgress: {},
  isLoaded: false,

  initWatchProgress: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          set({
            continueWatching: Array.isArray(parsed.continueWatching) ? parsed.continueWatching : [],
            episodeProgress: parsed.episodeProgress && typeof parsed.episodeProgress === 'object' ? parsed.episodeProgress : {},
            isLoaded: true,
          });
          return;
        }
      }
      set({ continueWatching: [], episodeProgress: {}, isLoaded: true });
    } catch (e) {
      console.warn('Failed to load watch progress from storage', e);
      set({ continueWatching: [], episodeProgress: {}, isLoaded: true });
    }
  },

  saveProgress: async (payload) => {
    try {
      const safeDuration = payload.duration > 0 ? payload.duration : 1320; // default 22m in seconds if metadata still loading
      const safeCurrent = Math.max(1, Math.min(payload.currentTime, safeDuration));
      const rawRatio = safeCurrent / safeDuration;
      // Keep visible progress between 6% and 98% while watching
      const progress = Math.max(0.06, Math.min(0.98, rawRatio));
      const remainingSeconds = Math.max(60, safeDuration - safeCurrent);
      const remainingMinutes = Math.max(1, Math.round(remainingSeconds / 60));
      const now = Date.now();

      const item: ContinueWatchingItem = {
        showId: String(payload.showId),
        showTitle: payload.showTitle,
        mediaType: payload.mediaType,
        posterUrl: payload.posterUrl,
        backdropUrl: payload.backdropUrl,
        seasonNumber: payload.seasonNumber || 1,
        episodeNumber: payload.episodeNumber || 1,
        episodeId: payload.episodeId,
        episodeTitle: payload.episodeTitle,
        youtubeId: payload.youtubeId,
        thumbnail: payload.thumbnail,
        overview: payload.overview,
        currentTime: safeCurrent,
        duration: safeDuration,
        progress,
        remainingMinutes,
        updatedAt: now,
      };

      const epKey = makeEpisodeKey(item.showId, item.seasonNumber, item.episodeNumber);
      const nextEpisodeProgress: Record<string, EpisodeProgressEntry> = {
        ...get().episodeProgress,
        [epKey]: {
          currentTime: safeCurrent,
          duration: safeDuration,
          progress,
          seasonNumber: item.seasonNumber,
          episodeNumber: item.episodeNumber,
          updatedAt: now,
        },
      };

      const existingList = Array.isArray(get().continueWatching) ? get().continueWatching : [];
      const filtered = existingList.filter((x) => String(x.showId) !== item.showId);
      const nextContinueWatching = [item, ...filtered].slice(0, 20);

      set({
        continueWatching: nextContinueWatching,
        episodeProgress: nextEpisodeProgress,
      });

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          continueWatching: nextContinueWatching,
          episodeProgress: nextEpisodeProgress,
        })
      );
    } catch (e) {
      console.warn('Failed to save watch progress', e);
    }
  },

  removeFromContinueWatching: async (showId: string) => {
    try {
      const target = String(showId);
      const nextContinueWatching = get().continueWatching.filter(
        (x) => String(x.showId) !== target
      );
      set({ continueWatching: nextContinueWatching });
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          continueWatching: nextContinueWatching,
          episodeProgress: get().episodeProgress,
        })
      );
    } catch (e) {
      console.warn('Failed to remove from continue watching', e);
    }
  },

  getShowProgress: (showId: string) => {
    const target = String(showId);
    return get().continueWatching.find((x) => String(x.showId) === target);
  },

  getEpisodeProgress: (showId: string, seasonNumber: number, episodeNumber: number) => {
    const epKey = makeEpisodeKey(showId, seasonNumber, episodeNumber);
    return get().episodeProgress[epKey];
  },
}));
