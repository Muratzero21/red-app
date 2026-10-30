import React from 'react';
import { Easing } from 'react-native';
import { Tabs } from 'expo-router';
import { FloatingGlassTabBar } from '../../src/components/ui/FloatingGlassTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: 260,
            easing: Easing.out(Easing.cubic),
          },
        },
        sceneStyleInterpolator: ({ current }: any) => ({
          sceneStyle: {
            opacity: current.progress.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0, 1, 0],
            }),
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [-24, 0, 24],
                }),
              },
              {
                scale: current.progress.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [0.975, 1, 0.975],
                }),
              },
            ],
          },
        }),
        sceneStyle: {
          backgroundColor: '#0f1015',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Series',
        }}
      />
      <Tabs.Screen
        name="trailers"
        options={{
          title: 'Shorts',
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Watchlist',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
