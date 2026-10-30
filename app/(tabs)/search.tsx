import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Image as RNImage,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Star, Search as SearchIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { REDText } from '../../src/components/ui/REDText';
import { THEME } from '../../src/constants/theme';
import { getAllStreamShows, StreamShow } from '../../src/constants/streams';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 12;
const CARD_WIDTH = Math.floor((width - GRID_PADDING * 2 - GRID_GAP * 2) / 3);
const POSTER_HEIGHT = Math.round(CARD_WIDTH * 1.48);

const SERIES_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'kids', label: 'Animation' },
  { key: 'turkish_classics', label: 'Drama' },
  { key: 'indie_web', label: 'Mini-Series' },
] as const;

export default function SeriesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter strictly to series that have active playable episodes with a valid YouTube stream ID
  const playableSeries = useMemo(() => {
    return getAllStreamShows().filter((show) =>
      show.seasons?.some((s) =>
        s.episodes?.some((ep) => Boolean(ep.youtubeId && ep.youtubeId.trim().length > 0))
      )
    );
  }, []);

  const filteredSeries = useMemo(() => {
    if (selectedCategory === 'all') return playableSeries;
    return playableSeries.filter((s) => s.category === selectedCategory);
  }, [playableSeries, selectedCategory]);

  const handlePressSeries = (show: StreamShow) => {
    const routeType = show.category === 'kids' ? 'cartoon' : 'stream';
    router.push(`/detail/${routeType}/${show.id}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(229, 9, 20, 0.12)', THEME.colors.background]}
        locations={[0, 0.28]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 4 }]}>
        <View>
          <REDText weight="bold" size={28} color="#fff">
            Series
          </REDText>
          <REDText size={12} color="rgba(255,255,255,0.5)" style={{ marginTop: 2 }}>
            {filteredSeries.length} Full Playable Series Ready to Stream
          </REDText>
        </View>

        <Pressable
          onPress={() => router.push('/search-engine')}
          style={({ pressed }) => [styles.searchIconBtn, pressed && { opacity: 0.7 }]}
        >
          <SearchIcon color="#fff" size={20} />
        </Pressable>
      </View>

      {/* Horizontal Category Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {SERIES_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <REDText
                  size={13}
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? '#fff' : 'rgba(255,255,255,0.65)'}
                >
                  {cat.label}
                </REDText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Playable Series Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
      >
        <View style={styles.gridContainer}>
          {filteredSeries.map((show) => {
            const totalEpisodes = show.seasons.reduce(
              (acc, s) => acc + (s.episodes?.length || 0),
              0
            );
            return (
              <Pressable
                key={show.id}
                onPress={() => handlePressSeries(show)}
                style={({ pressed }) => [
                  styles.seriesCard,
                  pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] },
                ]}
              >
                <View style={styles.posterBox}>
                  <RNImage
                    source={{ uri: show.posterUrl || show.backdropUrl }}
                    style={styles.posterImage}
                    resizeMode="cover"
                  />

                  {/* Top-left Playable Indicator */}
                  <View style={styles.streamBadge}>
                    <Play size={8} color="#fff" fill="#fff" style={{ marginRight: 3 }} />
                    <REDText size={8.5} weight="bold" color="#fff" style={{ letterSpacing: 0.4 }}>
                      STREAM
                    </REDText>
                  </View>

                  {/* Bottom Rating & Episode Pill */}
                  <LinearGradient
                    colors={['transparent', 'rgba(10,11,16,0.92)']}
                    style={styles.posterBottomGradient}
                  >
                    <View style={styles.ratingRow}>
                      <Star size={10} color="#F5C518" fill="#F5C518" />
                      <REDText size={10} weight="bold" color="#fff" style={{ marginLeft: 3 }}>
                        {show.voteAverage.toFixed(1)}
                      </REDText>
                    </View>
                    <REDText size={9.5} weight="semibold" color="rgba(255,255,255,0.75)">
                      {show.seasons.length > 1
                        ? `${show.seasons.length} Seasons`
                        : `${totalEpisodes} Ep`}
                    </REDText>
                  </LinearGradient>
                </View>

                <REDText
                  size={12.5}
                  weight="bold"
                  color="#fff"
                  numberOfLines={1}
                  style={styles.cardTitle}
                >
                  {show.title}
                </REDText>
                <REDText
                  size={10.5}
                  color="rgba(255,255,255,0.5)"
                  numberOfLines={1}
                  style={{ marginTop: 1 }}
                >
                  {show.category === 'kids'
                    ? 'Animation'
                    : show.category === 'turkish_classics'
                    ? 'Drama'
                    : 'Mini-Series'}
                </REDText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  filterPillActive: {
    backgroundColor: THEME.colors.red,
    borderColor: THEME.colors.red,
  },
  scrollContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    rowGap: 18,
  },
  seriesCard: {
    width: CARD_WIDTH,
  },
  posterBox: {
    width: CARD_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#161822',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  streamBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  posterBottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 7,
    paddingTop: 18,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    marginTop: 7,
  },
});
