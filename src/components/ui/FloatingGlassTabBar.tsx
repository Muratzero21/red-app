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
import { Home, Compass, Heart, Settings } from 'lucide-react-native';
import { REDText } from './REDText';
import { THEME } from '../../constants/theme';

const ACTIVE_RED = '#E50914';
const INACTIVE_COLOR = 'rgba(255, 255, 255, 0.45)';

// Custom Modern Vertical Video "Shorts" Icon (Portrait frame with Play button inside)
const ShortsVerticalIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (active) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Rect
          x="4"
          y="2"
          width="16"
          height="20"
          rx="4.5"
          fill={ACTIVE_RED}
          stroke={ACTIVE_RED}
          strokeWidth="1.8"
        />
        <Path
          d="M10.2 8.6L15.6 12L10.2 15.4V8.6Z"
          fill="#FFFFFF"
        />
      </Svg>
    );
  }

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="2"
        width="16"
        height="20"
        rx="4.5"
        stroke={color}
        strokeWidth="1.9"
      />
      <Path
        d="M10.3 8.8L15.4 12L10.3 15.2V8.8Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Custom Home Icon with true solid filled state when active
const HomeTabIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (active) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 10.2L12 3L21 10.2V20C21 20.5523 20.5523 21 20 21H15V14.5C15 13.9477 14.5523 13.5 14 13.5H10C9.44772 13.5 9 13.9477 9 14.5V21H4C3.44772 21 3 20.5523 3 20V10.2Z"
          fill={ACTIVE_RED}
          stroke={ACTIVE_RED}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return <Home size={21} color={color} strokeWidth={1.9} />;
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
      damping: 12,
      stiffness: 220,
    });
    if (isFocused) {
      scale.value = withSequence(
        withTiming(0.94, { duration: 70 }),
        withSpring(1, { damping: 10, stiffness: 260 })
      );
    }
  }, [isFocused, dotScale, scale]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: dotScale.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 65 }),
      withSpring(1, { damping: 9, stiffness: 280 })
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
        return (
          <Compass
            size={21}
            color={color}
            strokeWidth={isFocused ? 2.3 : 1.9}
            fill={isFocused ? 'rgba(229, 9, 20, 0.22)' : 'none'}
          />
        );
      case 'trailers':
        return <ShortsVerticalIcon active={isFocused} color={color} />;
      case 'watchlist':
        return (
          <Heart
            size={21}
            color={color}
            strokeWidth={isFocused ? 2.2 : 1.9}
            fill={isFocused ? ACTIVE_RED : 'none'}
          />
        );
      case 'settings':
        return (
          <Settings
            size={21}
            color={color}
            strokeWidth={isFocused ? 2.3 : 1.9}
            fill={isFocused ? 'rgba(229, 9, 20, 0.22)' : 'none'}
          />
        );
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
        {/* Icon + Subtle Red Glow + Active Dot Indicator */}
        <View style={styles.iconStack}>
          {isFocused && <View style={styles.activeRedGlow} />}
          <View style={isFocused ? styles.activeIconShadow : undefined}>
            {renderIcon()}
          </View>
          <Animated.View style={[styles.activeDot, animatedDotStyle]} />
        </View>

        {/* Tab Label */}
        <REDText
          size={10.5}
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

export const FloatingGlassTabBar: React.FC<FloatingGlassTabBarProps> = ({
  state,
  descriptors,
  navigation,
  emitter,
  navigateToTab,
}) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 16);

  // Filter out hidden routes like "profile" (href: null)
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
      {/* Shadow Wrapper */}
      <View style={styles.capsuleShadowWrapper}>
        {/* Clipped Pill Capsule with Frosted Glass Blur */}
        <View style={styles.capsuleClip}>
          <BlurView
            tint="dark"
            intensity={Platform.OS === 'ios' ? 75 : 85}
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          {/* Semi-transparent dark glass tint overlay */}
          <View style={styles.glassTintOverlay} />

          {/* Tab Items Row */}
          <View style={styles.tabsRow}>
            {visibleRoutes.map((route: any) => {
              const { options } = descriptors[route.key];
              const rawLabel =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              const label = typeof rawLabel === 'string' ? rawLabel : route.name;
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
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 22,
  },
  capsuleClip: {
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(15, 15, 18, 0.72)',
  },
  glassTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 16, 20, 0.62)',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
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
    paddingTop: 4,
  },
  iconStack: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    position: 'relative',
  },
  activeRedGlow: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(229, 9, 20, 0.18)',
    top: -2,
  },
  activeIconShadow: {
    shadowColor: ACTIVE_RED,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.65,
    shadowRadius: 6,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_RED,
    marginTop: 3,
    shadowColor: ACTIVE_RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  label: {
    marginTop: 3,
    letterSpacing: 0.2,
  },
});
