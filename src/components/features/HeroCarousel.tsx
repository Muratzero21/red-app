import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, interpolate, Extrapolation, useAnimatedStyle, withSpring, useDerivedValue, SharedValue } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';
import { REDText } from '../ui/REDText';
import { Play, Plus } from 'lucide-react-native';
import { getImageUrl } from '../../services/tmdb';
import { useRouter } from 'expo-router';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { DeviceMotion } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.75;

const HeroItem = ({ item, index, scrollX, tiltX, tiltY }: { item: any, index: number, scrollX: SharedValue<number>, tiltX: SharedValue<number>, tiltY: SharedValue<number> }) => {
  const router = useRouter();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  
  const logo = item.images?.logos?.[0]?.file_path || item.logo_path;
  const isSaved = watchlist.some(w => w.id === String(item.id));

  const toggleWatchlist = () => {
    if (isSaved) removeFromWatchlist(String(item.id));
    else addToWatchlist({ 
      id: String(item.id), 
      title: item.title || item.name, 
      posterUrl: getImageUrl(item.poster_path), 
      mediaType: item.mediaType || 'movie' 
    });
  };

  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const backgroundStyle = useAnimatedStyle(() => {
    const scrollTranslateX = interpolate(scrollX.value, inputRange, [-width * 0.4, 0, width * 0.4], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: scrollTranslateX + tiltX.value * 25 },
        { translateY: tiltY.value * 25 },
        { scale: 1.15 } // Room for parallax translation without showing edges
      ],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    const scrollTranslateX = interpolate(scrollX.value, inputRange, [width * 0.3, 0, -width * 0.3], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: scrollTranslateX + tiltX.value * -15 },
        { translateY: tiltY.value * -15 }
      ],
      opacity,
    };
  });

  return (
    <View style={styles.itemContainer}>
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <Image
          source={{ uri: getImageUrl(item.backdrop_path, 'w1280') || getImageUrl(item.poster_path, 'w1280') }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      </Animated.View>
      
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(15,16,21,0.8)', THEME.colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.content, contentStyle]}>
        {logo ? (
          <Image
            source={{ uri: getImageUrl(logo, 'w500') }}
            style={styles.logo}
            contentFit="contain"
          />
        ) : (
          <REDText style={styles.title} weight="bold">{item.title || item.name}</REDText>
        )}

        <REDText style={styles.metadata}>
          {(item.release_date || item.first_air_date || '').split('-')[0]} • {item.mediaType === 'movie' ? 'Movie' : 'Series'} • ⭐ {item.vote_average?.toFixed(1)}
        </REDText>
        
        <REDText style={styles.overview} numberOfLines={2}>
          {item.overview}
        </REDText>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.playButton} onPress={() => router.push(`/detail/${item.mediaType}/${item.id}`)}>
            <Play fill="#000" color="#000" size={20} />
            <REDText style={styles.playText} weight="bold">Play</REDText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.plusButton} onPress={toggleWatchlist}>
            {isSaved ? <Plus color={THEME.colors.red} size={24} style={{transform:[{rotate:'45deg'}]}} /> : <Plus color="#fff" size={24} />}
            <REDText style={styles.plusText}>My RED</REDText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export function HeroCarousel({ items }: { items: any[] }) {
  const scrollX = useSharedValue(0);
  const rawTiltX = useSharedValue(0);
  const rawTiltY = useSharedValue(0);

  const tiltX = useDerivedValue(() => withSpring(rawTiltX.value, { damping: 20, stiffness: 90 }));
  const tiltY = useDerivedValue(() => withSpring(rawTiltY.value, { damping: 20, stiffness: 90 }));

  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const timerRef = useRef<any>(null);
  const currentIndex = useRef(0);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(30);
    const subscription = DeviceMotion.addListener((motionData) => {
      if (motionData.rotation) {
        rawTiltX.value = Math.max(-1, Math.min(1, motionData.rotation.gamma));
        rawTiltY.value = Math.max(-1, Math.min(1, motionData.rotation.beta));
      }
    });
    return () => subscription.remove();
  }, []);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (items.length > 0 && scrollViewRef.current) {
        currentIndex.current = (currentIndex.current + 1) % items.length;
        scrollViewRef.current.scrollTo({ x: currentIndex.current * width, animated: true });
      }
    }, 8000);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
       currentIndex.current = Math.round(event.contentOffset.x / width);
    },
    onBeginDrag: () => {
       if (timerRef.current) clearInterval(timerRef.current);
    },
    onEndDrag: () => {
       resetTimer();
    }
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={false}
      >
        {items.map((item, index) => (
          <HeroItem key={item.id} item={item} index={index} scrollX={scrollX} tiltX={tiltX} tiltY={tiltY} />
        ))}
      </Animated.ScrollView>

      <View style={styles.dotsContainer}>
        {items.map((_, i) => {
          const dotStyle = useAnimatedStyle(() => {
             const opacity = interpolate(scrollX.value, [(i-1)*width, i*width, (i+1)*width], [0.3, 1, 0.3], Extrapolation.CLAMP);
             const dotWidth = interpolate(scrollX.value, [(i-1)*width, i*width, (i+1)*width], [6, 16, 6], Extrapolation.CLAMP);
             // Reanimated does not support animating string colors perfectly in all versions without processColor,
             // so we'll just handle width and opacity for the animated part.
             return { opacity, width: dotWidth };
          });
          return <Animated.View key={i} style={[styles.dot, dotStyle, { backgroundColor: '#fff' }]} />
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: HERO_HEIGHT,
    backgroundColor: '#000',
  },
  itemContainer: {
    width,
    height: HERO_HEIGHT,
  },
  content: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metadata: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overview: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  playText: {
    color: '#000',
    fontSize: 16,
  },
  plusButton: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  plusText: {
    color: '#ccc',
    fontSize: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
