import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from '../../src/i18n/translations';
import { FloatingGlassTabBar } from '../../src/components/ui/FloatingGlassTabBar';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <FloatingGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_home') || 'Home',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('tab_search') || 'Search',
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
          title: t('tab_watchlist') || 'Watchlist',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab_settings') || 'Settings',
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
