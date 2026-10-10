import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { REDText } from './REDText';

interface TopNavBarProps {
  scrollY?: SharedValue<number>;
  title?: string;
  showBack?: boolean;
}

export const TopNavBar = ({ scrollY, title, showBack }: TopNavBarProps) => {
  const insets = useSafeAreaInsets();
  
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: 0 };
    return {
      opacity: interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP),
    };
  });

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {title ? <REDText weight="bold" size={24}>{title}</REDText> : <Image 
            source={require('../../../assets/images/red-logo.png')} 
            style={styles.logoImage} 
            contentFit="contain" 
          />}
        </View>
        
        <Pressable 
          onPress={() => router.push('/search-engine')}
          style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.7 }]}
        >
          <Search color={THEME.colors.textPrimary} size={24} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 38,
    height: 38,
  },
  searchBtn: {
    padding: 8,
    marginRight: -8,
  }
});
