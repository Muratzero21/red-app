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
            duration: 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
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
                  outputRange: [-12, 0, 12],
                }),
              },
              {
                scale: current.progress.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [0.988, 1, 0.988],
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
          href: null,
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
