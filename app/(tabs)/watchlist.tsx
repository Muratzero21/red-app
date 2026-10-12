import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useWatchlistStore } from '../../src/store/useWatchlistStore';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';
import { TopNavBar } from '../../src/components/ui/TopNavBar';
import { getImageUrl } from '../../src/services/tmdb';
import { useRouter } from 'expo-router';
import { BookmarkMinus, Trash2 } from 'lucide-react-native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 10;
const POSTER_WIDTH = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function WatchlistScreen() {
  const { watchlist, removeFromWatchlist } = useWatchlistStore();
  const router = useRouter();

  const handleRemove = (id: string, title: string) => {
    Alert.alert(
      'Remove from My RED',
      `Are you sure you want to remove "${title}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromWatchlist(id) },
      ]
    );
  };

  if (watchlist.length === 0) {
    return (
      <View style={styles.container}>
        <TopNavBar title="My RED" showBack={false} />
        <View style={styles.emptyContainer}>
          <BookmarkMinus size={64} color="rgba(229, 9, 20, 0.4)" style={{ marginBottom: 16 }} />
          <REDText style={styles.emptyTitle} weight="bold">Your list is empty</REDText>
          <REDText style={styles.emptySubtitle}>
            Tap "My RED" on any movie or show to save it here.
          </REDText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavBar title={`My RED (${watchlist.length})`} showBack={false} />
      
      <FlatList
        data={watchlist}
        keyExtractor={(item) => String(item.id)}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const poster = item.posterUrl ? getImageUrl(item.posterUrl, 'w500') : 'https://via.placeholder.com/500x750?text=No+Poster';
          return (
            <View style={styles.itemWrapper}>
              <TouchableOpacity 
                style={styles.posterContainer}
                activeOpacity={0.8}
                onPress={() => router.push(`/detail/${item.mediaType || 'movie'}/${item.id}`)}
              >
                <Image 
                  source={{ uri: poster }}
                  style={styles.poster}
                  contentFit="cover"
                  transition={200}
                />
                <TouchableOpacity 
                  style={styles.removeBadge}
                  onPress={() => handleRemove(String(item.id), item.title)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 color="#fff" size={13} />
                </TouchableOpacity>
              </TouchableOpacity>
              <REDText size={12} weight="semibold" numberOfLines={1} style={styles.itemTitle}>
                {item.title}
              </REDText>
            </View>
          );
        }}
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
    paddingBottom: 110,
  },
  columnWrapper: {
    gap: SPACING,
    marginBottom: 16,
  },
  itemWrapper: {
    width: POSTER_WIDTH,
  },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  itemTitle: {
    marginTop: 6,
    color: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    marginBottom: 10,
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 22,
  }
});
