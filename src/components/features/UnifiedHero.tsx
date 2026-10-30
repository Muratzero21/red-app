import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { REDText } from '../ui/REDText';
import { REDButton } from '../ui/REDButton';
import { ChevronRight, Plus, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { router } from 'expo-router';
import { useWatchlistStore } from '../../store/useWatchlistStore';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.75;

export const UnifiedHero = ({
  scrollY,
  id,
  type,
  title,
  metadata,
  description,
  imageUrl,
  logoUrl,
  trailerId,
  rating,
}: {
  scrollY?: any;
  id: string;
  type: string;
  title: string;
  metadata: string;
  description: string;
  imageUrl: string;
  logoUrl?: string;
  trailerId?: string;
  rating?: number;
}) => {
  const scale = useSharedValue(1.0);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();

  const inWatchlist = watchlist.some((w) => w.id === id);

  const toggleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist({
        id,
        title,
        mediaType: type as any,
        posterUrl: imageUrl,
      });
    }
  };

  useEffect(() => {
    scale.value = 1.0;
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => {
    let translateY = 0;
    let scaleVal = 1;

    if (scrollY) {
      if (scrollY.value > 0) {
        translateY = interpolate(scrollY.value, [0, HERO_HEIGHT], [0, HERO_HEIGHT * 0.15], Extrapolation.CLAMP);
      } else {
        translateY = scrollY.value;
        scaleVal = 1 - scrollY.value / HERO_HEIGHT;
      }
    }

    return {
      transform: [{ translateY }, { scale: scaleVal }],
    };
  });

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(1000)}>
      {/* 4K Master Background Artwork */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <ExpoImage
          source={{ uri: imageUrl }}
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
          contentFit="cover"
          transition={500}
          cachePolicy="memory-disk"
          allowDownscaling={false}
          priority="high"
        />
      </Animated.View>

      {/* Cinematic Gradient */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(15, 16, 21, 0.0)',
          'rgba(15, 16, 21, 0.35)',
          'rgba(15, 16, 21, 0.85)',
          THEME.colors.background,
        ]}
        locations={[0, 0.4, 0.65, 0.9, 1]}
        style={styles.gradient}
      />

      {/* Content Area */}
      <View style={styles.content}>
        {logoUrl ? (
          <ExpoImage
            source={{ uri: logoUrl }}
            style={styles.logo}
            contentFit="contain"
            transition={400}
            cachePolicy="memory-disk"
            allowDownscaling={false}
            priority="high"
          />
        ) : (
          <REDText weight="bold" size={32} style={styles.title} numberOfLines={2}>
            {title}
          </REDText>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <REDText weight="semibold" size={13} color="rgba(255,255,255,0.75)">
            {metadata}
          </REDText>
          {rating !== undefined && (
            <>
              <REDText weight="semibold" size={13} color="rgba(255,255,255,0.7)">
                •
              </REDText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ExpoImage
                  source={{
                    uri: 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-fresh.149b5e8adc3.svg',
                  }}
                  style={{ width: 16, height: 16 }}
                  contentFit="contain"
                />
                <REDText weight="bold" size={13} color="#fff">
                  {Math.round(rating * 10)}%
                </REDText>
              </View>
            </>
          )}
          <View style={styles.uhdBadge}>
            <REDText size={9} weight="bold" color="#fff">
              4K UHD
            </REDText>
          </View>
        </View>

        {description ? (
          <REDText color="rgba(255,255,255,0.6)" size={13} numberOfLines={2} style={styles.description}>
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

          <REDButton
            title="Play"
            variant="primary"
            icon={
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ChevronRight color={THEME.colors.red} size={16} strokeWidth={3} style={{ marginLeft: 2 }} />
              </View>
            }
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
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.8,
    height: 80,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
  },
  uhdBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
