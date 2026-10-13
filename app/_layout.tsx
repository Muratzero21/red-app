import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { useLanguageStore } from '../src/store/useLanguageStore';
import { useWatchlistStore } from '../src/store/useWatchlistStore';
import { queryClient } from '../src/services/queryClient';

export default function RootLayout() {
  const initLanguage = useLanguageStore(state => state.initLanguage);
  const initWatchlist = useWatchlistStore(state => state.initWatchlist);

  useEffect(() => {
    // Non-blocking background initialization
    initLanguage().catch(() => {});
    initWatchlist().catch(() => {});
  }, []);

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
