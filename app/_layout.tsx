import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold, TitilliumWeb_700Bold } from '@expo-google-fonts/titillium-web';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLanguageStore } from '../src/store/useLanguageStore';
import { useWatchlistStore } from '../src/store/useWatchlistStore';

SplashScreen.preventAutoHideAsync();
export const queryClient = new QueryClient(); // Exported for language store

export default function RootLayout() {
  const initLanguage = useLanguageStore(state => state.initLanguage);
  const isLanguageLoaded = useLanguageStore(state => state.isLoaded);
  const initWatchlist = useWatchlistStore(state => state.initWatchlist);
  const isWatchlistLoaded = useWatchlistStore(state => state.isLoaded);

  const [loaded, error] = useFonts({
    'TitilliumWeb-Regular': TitilliumWeb_400Regular,
    'TitilliumWeb-SemiBold': TitilliumWeb_600SemiBold,
    'TitilliumWeb-Bold': TitilliumWeb_700Bold,
  });

  useEffect(() => {
    initLanguage();
    initWatchlist();
  }, []);

  const segments = useSegments();
  useEffect(() => {
    if ((loaded || error) && isLanguageLoaded && isWatchlistLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isLanguageLoaded, isWatchlistLoaded]);

  if ((!loaded && !error) || !isLanguageLoaded || !isWatchlistLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0f1015' }}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f1015' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail/[type]/[id]" options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="genre/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
          <Stack.Screen name="legal/privacy" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="legal/terms" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="legal/about" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </QueryClientProvider>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
