import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ActivityIndicator, Image, TouchableOpacity, RefreshControl, Share } from 'react-native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { tmdbAPI, getImageUrl } from '../../src/services/tmdb';
import YoutubePlayer from 'react-native-youtube-iframe';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';
import { Bookmark, Plus, Share2, Play, Maximize2 } from 'lucide-react-native';
import { useWatchlistStore } from '../../src/store/useWatchlistStore';
import { YouTubePlayerModal } from '../../src/components/ui/YouTubePlayerModal';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = Math.round(width * (9 / 16));

interface TrailerCardProps {
  item: any;
  isActive: boolean;
  onOpenCinema?: (videoId: string, title: string, subtitle?: string) => void;
}

const TrailerCard: React.FC<TrailerCardProps> = ({ item, isActive, onOpenCinema }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userActivated, setUserActivated] = useState(false);
  const [pendingPlay, setPendingPlay] = useState(false);
  const [pendingCinema, setPendingCinema] = useState(false);

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ['trailer_feed_detail', item.id],
    queryFn: () => tmdbAPI.getTrailersFeedData(item.id),
    staleTime: 1000 * 60 * 60,
  });

  const videos = details?.videos?.results || [];
  const trailer = 
    videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en') || 
    videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || 
    videos.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube') ||
    videos.find((v: any) => v.site === 'YouTube') ||
    videos[0];

  const logos = details?.images?.logos || [];
  const logo = logos.length > 0 ? logos[0].file_path : null;

  // Sync with scroll visibility
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setUserActivated(false);
    }
  }, [isActive]);

  // Handle pending user tap once trailer resolves
  useEffect(() => {
    if (trailer?.key) {
      if (pendingPlay) {
        setPendingPlay(false);
        setUserActivated(true);
        setIsPlaying(true);
      }
      if (pendingCinema && onOpenCinema) {
        setPendingCinema(false);
        onOpenCinema(trailer.key, item.title || item.name, item.overview);
      }
    }
  }, [pendingPlay, pendingCinema, trailer?.key, onOpenCinema, item]);

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const isSaved = watchlist.some(w => w.id.toString() === item.id.toString());

  const toggleWatchlist = () => {
    if (isSaved) removeFromWatchlist(item.id.toString());
    else addToWatchlist({ id: item.id.toString(), title: item.title, posterUrl: getImageUrl(item.poster_path, 'w500'), mediaType: 'movie' });
  };

  const handleShare = async () => {
    try {
      const shareUrl = trailer?.key 
        ? `https://www.youtube.com/watch?v=${trailer.key}` 
        : `https://www.themoviedb.org/movie/${item.id}`;
      await Share.share({
        title: item.title || item.name,
        message: `Watch "${item.title || item.name}" on RED! 🎬\n${shareUrl}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayPress = () => {
    if (trailer?.key) {
      setUserActivated(true);
      setIsPlaying(true);
    } else {
      setPendingPlay(true);
    }
  };

  const handleCinemaPress = () => {
    if (trailer?.key && onOpenCinema) {
      onOpenCinema(trailer.key, item.title || item.name, item.overview);
    } else {
      setPendingCinema(true);
    }
  };

  const onPlayerStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setIsPlaying(false);
    }
  }, []);

  const shouldShowPlayer = (isActive || userActivated) && !!trailer?.key;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.videoContainer}>
        {shouldShowPlayer ? (
          <YoutubePlayer
            height={VIDEO_HEIGHT}
            width={width}
            play={isPlaying}
            videoId={trailer.key}
            onChangeState={onPlayerStateChange}
            webViewProps={{
              androidLayerType: 'hardware',
              allowsFullscreenVideo: true,
              mediaPlaybackRequiresUserAction: false,
            }}
            initialPlayerParams={{
              preventFullScreen: false,
              controls: true,
              modestbranding: true,
              rel: false,
              iv_load_policy: 3,
            }}
          />
        ) : (
          <TouchableOpacity 
            activeOpacity={0.88} 
            onPress={handlePlayPress} 
            style={[StyleSheet.absoluteFill, styles.center]}
          >
            {item.backdrop_path ? (
              <Image 
                source={{ uri: getImageUrl(item.backdrop_path, 'w1280') }}
                style={{ width, height: VIDEO_HEIGHT }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ width, height: VIDEO_HEIGHT, backgroundColor: '#111' }} />
            )}
            <View style={[StyleSheet.absoluteFill, styles.overlay]}>
              {(detailsLoading || pendingPlay || pendingCinema) ? (
                <View style={styles.loadingPill}>
                  <ActivityIndicator size="small" color="#fff" />
                  <REDText size={12} weight="bold" color="#fff" style={{ marginLeft: 8 }}>
                    Loading...
                  </REDText>
                </View>
              ) : (
                <View style={styles.playButtonCircle}>
                  <Play fill="#fff" color="#fff" size={26} style={{ marginLeft: 3 }} />
                </View>
              )}
            </View>
          </TouchableOpacity>
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
            {isSaved ? <Bookmark fill={THEME.colors.red} color={THEME.colors.red} size={22} /> : <Plus color="#fff" size={22} />}
            <REDText style={styles.actionText}>{isSaved ? 'Saved' : 'My RED'}</REDText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={handleCinemaPress}
          >
            <Maximize2 color="#fff" size={20} />
            <REDText style={styles.actionText}>Cinema</REDText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Share2 color="#fff" size={20} />
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
  const [cinemaModal, setCinemaModal] = useState<{
    visible: boolean;
    videoId: string | null;
    title?: string;
    subtitle?: string;
  }>({
    visible: false,
    videoId: null,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
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
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 35 }).current;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setStartPage(Math.floor(Math.random() * 20) + 1);
    setActiveIndex(0);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleOpenCinema = useCallback((videoId: string, title: string, subtitle?: string) => {
    setCinemaModal({
      visible: true,
      videoId,
      title,
      subtitle,
    });
  }, []);

  const handleCloseCinema = useCallback(() => {
    setCinemaModal(prev => ({ ...prev, visible: false }));
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
          <TrailerCard 
            item={item} 
            isActive={index === activeIndex} 
            onOpenCinema={handleOpenCinema}
          />
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

      {/* OLED Cinema Theater Modal for full luxury viewing */}
      <YouTubePlayerModal
        visible={cinemaModal.visible}
        videoId={cinemaModal.videoId}
        title={cinemaModal.title}
        subtitle={cinemaModal.subtitle}
        onClose={handleCloseCinema}
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
    marginBottom: 40,
  },
  videoContainer: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#0a0b0e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: THEME.colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
  },
  logoImage: {
    width: 150,
    height: 45,
    marginBottom: 14,
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
    gap: 28,
  },
  actionBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
