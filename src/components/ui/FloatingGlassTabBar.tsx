import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Platform, LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { Home, Tv, Heart, Settings } from 'lucide-react-native';
import { REDText } from './REDText';

// Apple TV+ Color Palette: Clean Monochrome Elegance
const ACTIVE_COLOR = '#FFFFFF';
const INACTIVE_COLOR = 'rgba(255, 255, 255, 0.44)';

// 1. Home Icon (Apple TV style: Filled glyph when active, refined stroke when inactive)
const HomeTabIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (active) {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 10.2L12 3L21 10.2V20C21 20.5523 20.5523 21 20 21H14.8V14.8C14.8 14.2477 14.3523 13.8 13.8 13.8H10.2C9.64772 13.8 9.2 14.2477 9.2 14.8V21H4C3.44772 21 3 20.5523 3 20V10.2Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return <Home size={21} color={color} strokeWidth={1.8} />;
};

// 2. Series / TV Icon (Minimalist Screen / Display)
const SeriesTabIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (active) {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
        <Rect
          x="2.5"
          y="4.5"
          width="19"
          height="13.5"
          rx="3"
          fill="rgba(255, 255, 255, 0.16)"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <Path
          d="M8 21H16"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <Path
          d="M12 18V21"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M10.4 8.8L14.8 11.25L10.4 13.7V8.8Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return <Tv size={21} color={color} strokeWidth={1.8} />;
};

// 3. Shorts Vertical Icon (Portrait frame + play)
const ShortsVerticalIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (active) {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
        <Rect
          x="4.5"
          y="2"
          width="15"
          height="20"
          rx="4.5"
          fill="rgba(255, 255, 255, 0.16)"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <Path
          d="M10.2 8.5L15.5 12L10.2 15.5V8.5Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
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
        rx="4.5"
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

// 4. Watchlist Icon (Heart)
const WatchlistTabIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  return (
    <Heart
      size={21}
      color={active ? '#FFFFFF' : color}
      strokeWidth={active ? 2.2 : 1.8}
      fill={active ? '#FFFFFF' : 'none'}
    />
  );
};

// 5. Settings Icon
const SettingsTabIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  return (
    <Settings
      size={21}
      color={active ? '#FFFFFF' : color}
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
  const pressScale = useSharedValue(1);
  const focusProgress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focusProgress.value = withSpring(isFocused ? 1 : 0, {
      damping: 18,
      stiffness: 220,
      mass: 0.7,
    });
  }, [isFocused, focusProgress]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const focusScale = interpolate(focusProgress.value, [0, 1], [0.97, 1.03]);
    return {
      transform: [{ scale: pressScale.value * focusScale }],
      opacity: interpolate(focusProgress.value, [0, 1], [0.72, 1]),
    };
  });

  const handlePress = () => {
    pressScale.value = withSequence(
      withTiming(0.93, { duration: 60 }),
      withSpring(1, { damping: 12, stiffness: 280 })
    );
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // Ignore if haptics unavailable
    }
    onPress();
  };

  const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

  const renderIcon = () => {
    switch (routeName) {
      case 'index':
        return <HomeTabIcon active={isFocused} color={color} />;
      case 'search':
        return <SeriesTabIcon active={isFocused} color={color} />;
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
        {/* Icon Box */}
        <View style={styles.iconBox}>
          {renderIcon()}
        </View>

        {/* Tab Label (Apple TV Clean Micro Typography) */}
        <REDText
          size={10.5}
          weight={isFocused ? 'bold' : 'medium'}
          color={isFocused ? '#FFFFFF' : INACTIVE_COLOR}
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
  search: 'Series',
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
  const [rowWidth, setRowWidth] = useState(0);

  // Filter out hidden routes like "profile"
  const visibleRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key];
    if (route.name === 'profile') return false;
    if ((options as any)?.href === null || (options as any)?.hidden === true) return false;
    return true;
  });

  const activeVisibleIndex = Math.max(
    0,
    visibleRoutes.findIndex((r: any) => r.key === state.routes[state.index]?.key)
  );

  const tabWidth = visibleRoutes.length > 0 ? rowWidth / visibleRoutes.length : 0;
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) {
      indicatorX.value = withSpring(activeVisibleIndex * tabWidth, {
        damping: 20,
        stiffness: 220,
        mass: 0.65,
      });
    }
  }, [activeVisibleIndex, tabWidth, indicatorX]);

  const slidingPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth,
    opacity: tabWidth > 0 ? 1 : 0,
  }));

  const handleRowLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== rowWidth) {
      setRowWidth(w);
    }
  };

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
          {/* Apple TV+ Ultra-Blur Material Surface */}
          <BlurView
            tint="systemUltraThinMaterialDark"
            intensity={Platform.OS === 'ios' ? 85 : 70}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.glassTintOverlay} />
          {/* Ultra-thin Apple top border reflection highlight */}
          <View style={styles.topSpecularLine} pointerEvents="none" />

          <View style={styles.tabsRow} onLayout={handleRowLayout}>
            {/* Apple TV+ Smooth Floating Frosted Glass Capsule behind Active Tab */}
            <Animated.View
              pointerEvents="none"
              style={[styles.slidingHighlightContainer, slidingPillStyle]}
            >
              <View style={styles.slidingHighlightInner} />
            </Animated.View>

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
    left: 20,
    right: 20,
    zIndex: 100,
  },
  capsuleShadowWrapper: {
    borderRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65,
    shadowRadius: 24,
    elevation: 24,
  },
  capsuleClip: {
    height: 64,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(20, 21, 26, 0.72)',
    position: 'relative',
  },
  glassTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 13, 16, 0.45)',
  },
  topSpecularLine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 4,
    position: 'relative',
  },
  slidingHighlightContainer: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slidingHighlightInner: {
    width: '84%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    paddingVertical: 2,
  },
  iconBox: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 3,
    lineHeight: 12,
    letterSpacing: 0.15,
  },
});
