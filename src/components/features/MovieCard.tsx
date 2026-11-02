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

export const MovieCard = ({ posterUrl, title, width = 128, height = 192, onPress }: MovieCardProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 18, stiffness: 320, mass: 0.6 });
    opacity.value = withSpring(0.92, { damping: 18, stiffness: 320 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320, mass: 0.6 });
    opacity.value = withSpring(1, { damping: 18, stiffness: 320 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
          transition={300}
          cachePolicy="memory-disk"
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
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#11131a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
