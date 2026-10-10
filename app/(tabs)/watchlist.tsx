import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useWatchlistStore } from '../../src/store/useWatchlistStore';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';
import { TopNavBar } from '../../src/components/ui/TopNavBar';
import { getImageUrl } from '../../src/services/tmdb';
import { useRouter } from 'expo-router';
import { BookmarkMinus } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 8;
const POSTER_WIDTH = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function WatchlistScreen() {
  const { watchlist } = useWatchlistStore();
  const router = useRouter();

  if (watchlist.length === 0) {
    return (
      <View style={styles.container}>
        <TopNavBar title="My RED" showBack={false} />
        <View style={styles.emptyContainer}>
          <BookmarkMinus size={64} color="#333" style={{ marginBottom: 16 }} />
          <REDText style={styles.emptyTitle} weight="bold">Your list is empty</REDText>
          <REDText style={styles.emptySubtitle}>
            Save movies and TV shows to your list to easily find them later.
          </REDText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavBar title="My RED" showBack={false} />
      
      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.id.toString()}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.posterContainer}
            onPress={() => router.push(`/detail/${item.mediaType}/${item.id}`)}
          >
            <Image 
              source={{ uri: getImageUrl(item.posterUrl, 'w500') }}
              style={styles.poster}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  listContainer: {
    padding: SPACING,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: SPACING,
    marginBottom: SPACING,
  },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    marginBottom: 12,
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  }
});
