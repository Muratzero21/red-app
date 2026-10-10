import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Image as RNImage } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming, withRepeat, interpolate, Extrapolation } from 'react-native-reanimated';
import { REDText } from '../ui/REDText';
import { REDButton } from '../ui/REDButton';
import { ChevronRight, Plus, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { router } from 'expo-router';
import YoutubePlayer from "react-native-youtube-iframe";
import { useWatchlistStore } from '../../store/useWatchlistStore';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.75; // 75% of screen height

export const UnifiedHero = ({ scrollY, id, type, title, metadata, description, imageUrl, logoUrl, trailerId, rating }: { scrollY?: any, id: string, type: string, title: string, metadata: string, description: string, imageUrl: string, logoUrl?: string, trailerId?: string, rating?: number }) => {
  const scale = useSharedValue(1.0);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  
  const inWatchlist = watchlist.some(w => w.id === id);

  const toggleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist({ 
        id, 
        title, 
        mediaType: type as any, 
        posterUrl: imageUrl 
      });
    }
  };

  useEffect(() => {
    scale.value = 1.0;
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    let translateY = 0;
    let scaleVal = 1;
    
    if (scrollY) {
      if (scrollY.value > 0) {
        // Normal parallax when scrolling up
        translateY = interpolate(scrollY.value, [0, HERO_HEIGHT], [0, HERO_HEIGHT * 0.15], Extrapolation.CLAMP);
      } else {
        // iOS pull-to-refresh bounce (overscroll)
        // Keep image anchored to top and scale it up
        translateY = scrollY.value; // Move up to counter the container moving down
        scaleVal = 1 - (scrollY.value / HERO_HEIGHT); // scale up
      }
    }
    
    return {
      transform: [
        { translateY },
        { scale: scaleVal }
      ],
    };
  });

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(1500)}>
      {/* Background Poster */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <ExpoImage 
          source={{ uri: imageUrl }} 
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
          contentFit="cover"
          transition={1000}
        />
      </Animated.View>

      {/* Kusursuz Sinematik Gradyan (Bottom Fade) */}
      <LinearGradient
        colors={[
          'transparent', 
          'rgba(15, 16, 21, 0.0)', 
          'rgba(15, 16, 21, 0.4)', 
          'rgba(15, 16, 21, 0.85)', 
          THEME.colors.background
        ]}
        locations={[0, 0.4, 0.65, 0.9, 1]}
        style={styles.gradient}
      />

      {/* Content Area */}
      <View style={styles.content}>
        {logoUrl ? (
          <ExpoImage source={{ uri: logoUrl }} style={styles.logo} contentFit="contain" transition={800} />
        ) : (
          <REDText weight="bold" size={32} style={styles.title} numberOfLines={2}>{title}</REDText>
        )}
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <REDText weight="semibold" size={13} color="rgba(255,255,255,0.7)">
            {metadata}
          </REDText>
          {rating !== undefined && (
            <>
              <REDText weight="semibold" size={13} color="rgba(255,255,255,0.7)">•</REDText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ExpoImage 
                  source={{ uri: 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-fresh.149b5e8adc3.svg' }} 
                  style={{ width: 16, height: 16 }} 
                  contentFit="contain" 
                />
                <REDText weight="bold" size={13} color="#fff">
                  {Math.round(rating * 10)}%
                </REDText>
              </View>
            </>
          )}
        </View>

        {description ? (
          <REDText color="rgba(255,255,255,0.5)" size={13} numberOfLines={2} style={styles.description}>
            {description}
          </REDText>
        ) : null}

        <View style={styles.actions}>
          <Pressable 
            style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
            onPress={toggleWatchlist}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 }]} />
            {inWatchlist ? <Check color="#fff" size={24} /> : <Plus color="#fff" size={24} />}
          </Pressable>

          {/* Huge Primary Play Button */}
          <REDButton 
            title="Play" 
            variant="primary" 
            icon={<View style={{ backgroundColor: '#fff', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}><ChevronRight color={THEME.colors.red} size={16} strokeWidth={3} style={{ marginLeft: 2 }} /></View>} 
            style={{ flex: 1, backgroundColor: THEME.colors.red }}
            onPress={() => router.push(`/detail/${type}/${id}`)}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: THEME.colors.background,
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32, // More breathing room at the bottom
    alignItems: 'center',
  },
  logo: {
    width: width * 0.8,
    height: 80, // Sleeker logo height so it doesn't overpower the artwork
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
  },
  description: {
    height: 60,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  iconButton: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)', // ultra subtle
  }
});
