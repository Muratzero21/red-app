import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { THEME } from '../../constants/theme';
import { REDText } from './REDText';

interface REDButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'glass';
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const REDButton = ({ title, variant = 'primary', icon, style, onPress, ...props }: REDButtonProps) => {
  const scale = useSharedValue(1);

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    props.onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    props.onPressOut?.(e);
  };

  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return THEME.colors.red;
      case 'secondary': return 'rgba(255, 255, 255, 0.15)';
      case 'glass': return THEME.colors.glassBackground;
      default: return THEME.colors.red;
    }
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'glass' && styles.glassBorder,
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {icon}
      <REDText weight="semibold" size={16}>{title}</REDText>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
  },
});
