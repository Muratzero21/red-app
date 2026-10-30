import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Home, Search, Heart, Settings } from 'lucide-react-native';
import { REDText } from './REDText';

const ACTIVE_RED = '#E50914';
const INACTIVE_COLOR = 'rgba(255, 255, 255, 0.45)';

// 1. Home Icon (Filled when active, outline when inactive)
const HomeTabIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (active) {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 10.2L12 3L21 10.2V20C21 20.5523 20.5523 21 20 21H14.8V14.8C14.8 14.2477 14.3523 13.8 13.8 13.8H10.2C9.64772 13.8 9.2 14.2477 9.2 14.8V21H4C3.44772 21 3 20.5523 3 20V10.2Z"
          fill={ACTIVE_RED}
          stroke={ACTIVE_RED}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return <Home size={21} color={color} strokeWidth={1.8} />;
};

// 2. Search Icon
const SearchTabIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (active) {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="11"
          cy="11"
          r="7.5"
          fill="rgba(229, 9, 20, 0.25)"
          stroke={ACTIVE_RED}
          strokeWidth="2.2"
        />
        <Path
          d="M16.65 16.65L21 21"
          stroke={ACTIVE_RED}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return <Search size={21} color={color} strokeWidth={1.8} />;
};

// 3. Modern Vertical Video "Shorts" Icon (Portrait frame + Play triangle)
const ShortsVerticalIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (active) {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
        <Rect
          x="4.5"
          y="2"
          width="15"
          height="20"
          rx="4"
          fill="rgba(229, 9, 20, 0.2)"
          stroke={ACTIVE_RED}
          strokeWidth="2"
        />
        <Path
          d="M10.2 8.5L15.5 12L10.2 15.5V8.5Z"
          fill={ACTIVE_RED}
          stroke={ACTIVE_RED}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4.5"
        y="2"
        width="15"
        height="20"
        rx="4"
        stroke={color}
        strokeWidth="1.8"
      />
      <Path
        d="M10.3 8.8L15.2 12L10.3 15.2V8.8Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// 4. Watchlist Icon
const WatchlistTabIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  return (
    <Heart
      size={21}
      color={color}
      strokeWidth={active ? 2.1 : 1.8}
      fill={active ? ACTIVE_RED : 'none'}
    />
  );
};

// 5. Settings Icon
const SettingsTabIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  return (
    <Settings
      size={21}
      color={color}
      strokeWidth={active ? 2.2 : 1.8}
    />
  );
};

interface TabItemProps {
  routeKey: string;
  routeName: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabBarItem: React.FC<TabItemProps> = ({
  routeName,
  label,
  isFocused,
  onPress,
  onLongPress,
}) => {
  const scale = useSharedValue(1);
  const dotScale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    dotScale.value = withSpring(isFocused ? 1 : 0, {
      damping: 14,
      stiffness: 220,
    });
  }, [isFocused, dotScale]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: dotScale.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 65 }),
      withSpring(1, { damping: 10, stiffness: 280 })
    );
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // Ignore if haptics unavailable
    }
    onPress();
  };

  const color = isFocused ? ACTIVE_RED : INACTIVE_COLOR;

  const renderIcon = () => {
    switch (routeName) {
      case 'index':
        return <HomeTabIcon active={isFocused} color={color} />;
      case 'search':
        return <SearchTabIcon active={isFocused} color={color} />;
      case 'trailers':
        return <ShortsVerticalIcon active={isFocused} color={color} />;
      case 'watchlist':
        return <WatchlistTabIcon active={isFocused} color={color} />;
      case 'settings':
        return <SettingsTabIcon active={isFocused} color={color} />;
      default:
        return <HomeTabIcon active={isFocused} color={color} />;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabPressable}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <Animated.View style={[styles.tabInner, animatedContainerStyle]}>
        {/* Fixed-height Icon Box so icons never shift vertically */}
        <View style={styles.iconBox}>
          {isFocused && <View style={styles.activeRedGlow} />}
          <View style={isFocused ? styles.activeIconShadow : undefined}>
            {renderIcon()}
          </View>
        </View>

        {/* Fixed-height Dot Slot right under the icon */}
        <View style={styles.dotSlot}>
          <Animated.View style={[styles.activeDot, animatedDotStyle]} />
        </View>

        {/* Tab Label */}
        <REDText
          size={10}
          weight={isFocused ? 'bold' : 'medium'}
          color={isFocused ? ACTIVE_RED : '#8E8E93'}
          style={styles.label}
          numberOfLines={1}
        >
          {label}
        </REDText>
      </Animated.View>
    </Pressable>
  );
};

export interface FloatingGlassTabBarProps {
  state: any;
  descriptors: Record<string, any>;
  navigation?: any;
  emitter?: any;
  navigateToTab?: (routeKey: string) => void;
  insets?: any;
}

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  search: 'Search',
  trailers: 'Shorts',
  watchlist: 'Watchlist',
  settings: 'Settings',
};

export const FloatingGlassTabBar: React.FC<FloatingGlassTabBarProps> = ({
  state,
  descriptors,
  navigation,
  emitter,
  navigateToTab,
}) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 16);

  // Filter out hidden routes like "profile"
  const visibleRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key];
    if (route.name === 'profile') return false;
    if ((options as any)?.href === null) return false;
    return true;
  });

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outerPositioner,
        {
          bottom: bottomOffset,
        },
      ]}
    >
      <View style={styles.capsuleShadowWrapper}>
        <View style={styles.capsuleClip}>
          <BlurView
            tint="dark"
            intensity={Platform.OS === 'ios' ? 65 : 55}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.glassTintOverlay} />

          <View style={styles.tabsRow}>
            {visibleRoutes.map((route: any) => {
              const label = TAB_LABELS[route.name] || route.name;
              const isFocused = state.routes[state.index]?.key === route.key;

              const onPress = () => {
                const emitFn = emitter?.emit || navigation?.emit;
                const event = emitFn
                  ? emitFn({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    })
                  : { defaultPrevented: false };

                if (!isFocused && !event?.defaultPrevented) {
                  if (navigateToTab) {
                    navigateToTab(route.key);
                  } else if (navigation?.navigate) {
                    navigation.navigate(route.name, route.params);
                  }
                }
              };

              const onLongPress = () => {
                const emitFn = emitter?.emit || navigation?.emit;
                emitFn?.({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              return (
                <TabBarItem
                  key={route.key}
                  routeKey={route.key}
                  routeName={route.name}
                  label={label}
                  isFocused={isFocused}
                  onPress={onPress}
                  onLongPress={onLongPress}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerPositioner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
  },
  capsuleShadowWrapper: {
    borderRadius: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 20,
  },
  capsuleClip: {
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(18, 18, 20, 0.78)',
  },
  glassTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 15, 18, 0.65)',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tabPressable: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 30,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeRedGlow: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(229, 9, 20, 0.16)',
  },
  activeIconShadow: {
    shadowColor: ACTIVE_RED,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  dotSlot: {
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_RED,
  },
  label: {
    marginTop: 2,
    lineHeight: 12,
    letterSpacing: 0.2,
  },
});
