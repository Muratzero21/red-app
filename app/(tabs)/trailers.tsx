import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ActivityIndicator, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { tmdbAPI, getImageUrl } from '../../src/services/tmdb';
import YoutubePlayer from 'react-native-youtube-iframe';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';
import { Bookmark, Plus, Share2, Play } from 'lucide-react-native';
import { useWatchlistStore } from '../../src/store/useWatchlistStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TrailerCard = ({ item, isActive }: { item: any, isActive: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => { setIsPlaying(isActive); }, [isActive]);
  const { data: details } = useQuery({
    queryKey: ['trailer_detail', item.id],
    queryFn: () => tmdbAPI.getDetails(item.id, 'movie'),
    staleTime: 1000 * 60 * 60,
  });

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const isSaved = watchlist.some(w => w.id.toString() === item.id.toString());

  const toggleWatchlist = () => {
    if (isSaved) removeFromWatchlist(item.id.toString());
    else addToWatchlist({ id: item.id.toString(), title: item.title, posterUrl: getImageUrl(item.poster_path, 'w500'), mediaType: 'movie' });
  };

  const videos = details?.videos?.results || [];
  const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en') || videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];
  const logos = details?.images?.logos || [];
  const logo = logos.length > 0 ? logos[0].file_path : null;

    return (
    <View style={styles.cardContainer}>
      <View style={styles.videoContainer}>
        {trailer ? (
          <YoutubePlayer
            height={width * (9 / 16)}
            width={width}
            play={isPlaying}
            onChangeState={(state: string) => { if(state === 'playing') setIsPlaying(true); else setIsPlaying(false); }}
            videoId={trailer.key}
            initialPlayerParams={{
              modestbranding: true,
              rel: false,
              controls: true,
            }}
          />
        ) : item.backdrop_path ? (
          <Image 
            source={{ uri: getImageUrl(item.backdrop_path, 'w1280') }}
            style={{ width, height: width * (9 / 16) }}
          />
        ) : (
          <View style={{ width, height: width * (9 / 16), backgroundColor: '#111' }} />
        )}
      </View>

      <View style={styles.infoContainer}>
        {logo ? (
          <Image 
            source={{ uri: getImageUrl(logo, 'w500') }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        ) : (
          <REDText style={styles.title} weight="bold">{item.title}</REDText>
        )}
        <REDText style={styles.overview} numberOfLines={3}>{item.overview}</REDText>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={toggleWatchlist}>
            {isSaved ? <Bookmark fill={THEME.colors.red} color={THEME.colors.red} size={24} /> : <Plus color="#fff" size={24} />}
            <REDText style={styles.actionText}>{isSaved ? 'Saved' : 'My RED'}</REDText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Share2 color="#fff" size={22} />
            <REDText style={styles.actionText}>Share</REDText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function TrailersScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [startPage, setStartPage] = useState(() => Math.floor(Math.random() * 20) + 1);
  const [refreshing, setRefreshing] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['trailers_feed_infinite', startPage],
    queryFn: ({ pageParam = startPage }) => tmdbAPI.getPopularMovies(pageParam),
    initialPageParam: startPage,
    getNextPageParam: (lastPage: any) => {
      if (lastPage?.page < lastPage?.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const allMovies = data?.pages.flatMap(page => page.results) || [];

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 40 }).current;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setStartPage(Math.floor(Math.random() * 20) + 1);
    setActiveIndex(0);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (isLoading) {
      return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={THEME.colors.red} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={allMovies}
        keyExtractor={(item, index) => item.id.toString() + index}
        renderItem={({ item, index }) => (
          <TrailerCard item={item} isActive={index === activeIndex} />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={THEME.colors.red} style={{ margin: 40 }} /> : null}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.red} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width,
    backgroundColor: THEME.colors.background,
    marginBottom: 60,
    
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#0f1015',
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
  },
  logoImage: {
    width: 150,
    height: 45,
    marginBottom: 16,
  },
  overview: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 16,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  actionBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  }
});
