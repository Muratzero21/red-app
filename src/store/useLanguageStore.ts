import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageState {
  language: 'en' | 'tr';
  isLoaded: boolean;
  setLanguage: (lang: 'en' | 'tr') => Promise<void>;
  initLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en', // Default
  isLoaded: false,
  setLanguage: async (lang) => {
    set({ language: lang });
    await AsyncStorage.setItem('@app_language', lang);
  },
  initLanguage: async () => {
    try {
      const stored = await AsyncStorage.getItem('@app_language');
      if (stored === 'tr' || stored === 'en') {
        set({ language: stored, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      set({ isLoaded: true });
    }
  }
}));
