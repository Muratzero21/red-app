import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useLanguageStore } from '../src/store/useLanguageStore';
import { useWatchlistStore } from '../src/store/useWatchlistStore';
import { useWatchProgressStore } from '../src/store/useWatchProgressStore';
import { queryClient } from '../src/services/queryClient';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';

// Guard splash screen preventAutoHideAsync so failures never hang startup
try {
  SplashScreen.preventAutoHideAsync().catch(() => {});
} catch {
  // Ignore in case native module is unavailable or already called
}

export default function RootLayout() {
  const initLanguage = useLanguageStore(state => state.initLanguage);
  const initWatchlist = useWatchlistStore(state => state.initWatchlist);
  const initWatchProgress = useWatchProgressStore(state => state.initWatchProgress);

  useEffect(() => {
    let isMounted = true;

    const prepare = async () => {
      try {
        await Promise.allSettled([
          initLanguage().catch(() => {}),
          initWatchlist().catch(() => {}),
          initWatchProgress().catch(() => {}),
        ]);
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        if (isMounted) {
          try {
            await SplashScreen.hideAsync().catch(() => {});
          } catch {
            // Splash screen already hidden or unavailable
          }
        }
      }
    };

    prepare();

    return () => {
      isMounted = false;
    };
  }, [initLanguage, initWatchlist]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0f1015' }}>
      <SafeAreaProvider>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
