import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { REDText } from '../ui/REDText';

interface MovieCardProps {
  id: string;
  posterUrl: string;
  title: string;
  width?: number;
  height?: number;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MovieCard = ({ posterUrl, title, width = 160, height = 240, onPress }: MovieCardProps) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.container, { width, height }, animatedStyle]}
    >
      {posterUrl ? (
        <Image
          source={{ uri: posterUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          allowDownscaling={false}
          priority="high"
          accessibilityLabel={title}
        />
      ) : (
        <View style={[styles.image, { backgroundColor: '#1a1d24', justifyContent: 'center', alignItems: 'center', padding: 8 }]}>
          <REDText size={12} color="rgba(255,255,255,0.5)" style={{ textAlign: 'center' }}>No Image</REDText>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#11131a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
