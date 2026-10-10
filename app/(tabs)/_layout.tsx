import { Tabs } from 'expo-router';
import { Home, Compass, Heart, Settings, Film, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform } from 'react-native';
import { THEME } from '../../src/constants/theme';
import { useTranslation } from '../../src/i18n/translations';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.03)',
          paddingTop: 8,
          // We don't set a fixed height here so React Navigation can natively inject safe-area padding
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView 
              tint="dark" 
              intensity={90} 
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 16, 21, 0.7)' }]} 
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 16, 21, 0.95)' }]} />
          )
        ),
        tabBarActiveTintColor: THEME.colors.red,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          paddingBottom: Platform.OS === 'android' ? 8 : 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_home'),
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('tab_search'),
          tabBarIcon: ({ color }) => <Compass size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="trailers"
        options={{
          title: 'Shorts',
          tabBarIcon: ({ color, size }) => <Film size={size} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: t('tab_watchlist'),
          tabBarIcon: ({ color }) => <Heart size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
