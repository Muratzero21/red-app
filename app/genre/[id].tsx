import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image as RNImage } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { tmdbAPI, getImageUrl } from '../../src/services/tmdb';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 8;
const ITEM_WIDTH = (width - 48 - (SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5; // 2:3 ratio

export default function GenreScreen() {
  const { id, name } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const { data: movies, isLoading: moviesLoading } = useQuery({
    queryKey: ['genreMovies', id],
    queryFn: async () => {
      const [p1, p2] = await Promise.all([
        tmdbAPI.getMoviesByGenre(id as string, 1),
        tmdbAPI.getMoviesByGenre(id as string, 2)
      ]);
      return { results: [...(p1?.results || []), ...(p2?.results || [])] };
    }
  });

  const { data: tvShows, isLoading: tvLoading } = useQuery({
    queryKey: ['genreTv', id],
    queryFn: async () => {
      const [p1, p2] = await Promise.all([
        tmdbAPI.getTvShowsByGenre(id as string, 1),
        tmdbAPI.getTvShowsByGenre(id as string, 2)
      ]);
      return { results: [...(p1?.results || []), ...(p2?.results || [])] };
    }
  });

  const mixedData = useMemo(() => {
    if (!movies?.results && !tvShows?.results) return [];
    
    const movieResults = (movies?.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
    const tvResults = (tvShows?.results || []).map((t: any) => ({ ...t, media_type: 'tv' }));
    
    // Mix them alternating
    const mixed = [];
    const maxLength = Math.max(movieResults.length, tvResults.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < movieResults.length) mixed.push(movieResults[i]);
      if (i < tvResults.length) mixed.push(tvResults[i]);
    }
    
    // Filter out missing posters
    return mixed.filter(item => item.poster_path);
  }, [movies, tvShows]);

  const renderItem = ({ item }: { item: any }) => {
    const posterUrl = getImageUrl(item.poster_path, 'w500');
    return (
      <Pressable 
        style={styles.cardContainer}
        onPress={() => router.push(`/detail/${item.media_type}/${item.id}`)}
      >
        <RNImage
          source={{ uri: posterUrl }}
          style={styles.poster}
          resizeMode="cover"
        />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Pressable 
          onPress={() => router.back()} 
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
        >
          <ChevronLeft color="#fff" size={28} />
        </Pressable>
        <REDText weight="bold" size={22} style={styles.title}>{name}</REDText>
        <View style={{ width: 44 }} />
      </View>

      {(moviesLoading || tvLoading) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.red} />
        </View>
      ) : (
        <FlashList
          data={mixedData}
          renderItem={renderItem}
          estimatedItemSize={ITEM_HEIGHT}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  cardContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginBottom: SPACING,
    marginRight: SPACING, // This works safely with FlashList numColumns if we adjust container padding
  },
  poster: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#1a1d24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  }
});
