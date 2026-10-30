import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
  Image as RNImage,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Search as SearchIcon,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Plus,
  Check,
  Info,
  Star,
  Play,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { THEME } from '../src/constants/theme';
import { REDText } from '../src/components/ui/REDText';
import { tmdbAPI, getImageUrl } from '../src/services/tmdb';
import { useWatchlistStore } from '../src/store/useWatchlistStore';
import { YouTubePlayerModal } from '../src/components/ui/YouTubePlayerModal';

const { width, height } = Dimensions.get('window');
const HERO_VIDEO_HEIGHT = Math.min(Math.round(width * (9 / 16)), Math.round(height * 0.25));
const GRID_PADDING = 14;
const GRID_GAP = 10;
const POSTER_WIDTH = Math.floor((width - GRID_PADDING * 2 - GRID_GAP * 2) / 3);
const POSTER_HEIGHT = Math.round(POSTER_WIDTH * 1.48);

export default function SearchEngine() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [fullscreenModalVisible, setFullscreenModalVisible] = useState<boolean>(false);

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();

  // Cross-fade opacity shared value for smooth Hero trailer switching
  const heroFade = useSharedValue(1);

  // 1. 300ms Debounce for TMDB search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // 2. Fetch TMDB multi-search when query is entered, or Trending Worldwide as default discovery feed
  const isSearching = debouncedQuery.length >= 2;

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['tmdbSearchMulti', debouncedQuery],
    queryFn: () => tmdbAPI.searchMulti(debouncedQuery),
    enabled: isSearching,
  });

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['tmdbSearchTrendingDefault'],
    queryFn: () => tmdbAPI.getTrendingWorldwide(),
    enabled: !isSearching,
  });

  const results = useMemo(() => {
    const rawList = isSearching ? searchData?.results : trendingData?.results;
    if (!Array.isArray(rawList)) return [];
    return rawList.filter(
      (item: any) =>
        (item.media_type === 'movie' ||
          item.media_type === 'tv' ||
          (!item.media_type && (item.title || item.name))) &&
        (item.poster_path || item.backdrop_path)
    );
  }, [isSearching, searchData, trendingData]);

  // Automatically select the first result when results change
  useEffect(() => {
    if (results.length > 0) {
      const firstId = String(results[0].id);
      setSelectedId(firstId);
    } else {
      setSelectedId(null);
    }
  }, [debouncedQuery, results.length]);

  const activeItem = useMemo(() => {
    if (results.length === 0) return null;
    if (!selectedId) return results[0];
    return results.find((r: any) => String(r.id) === String(selectedId)) || results[0];
  }, [results, selectedId]);

  const activeMediaType: 'movie' | 'tv' = useMemo(() => {
    if (!activeItem) return 'movie';
    if (activeItem.media_type === 'tv') return 'tv';
    if (activeItem.media_type === 'movie') return 'movie';
    return activeItem.first_air_date && !activeItem.release_date ? 'tv' : 'movie';
  }, [activeItem]);

  // 3. Fetch TMDB videos endpoint for the currently selected Hero item
  const { data: activeDetails, isFetching: trailerFetching } = useQuery({
    queryKey: ['searchHeroTrailer', activeItem?.id, activeMediaType],
    queryFn: () =>
      activeItem ? tmdbAPI.getDetails(activeItem.id, activeMediaType) : null,
    enabled: !!activeItem?.id,
    staleTime: 1000 * 60 * 10,
  });

  const trailerKey = useMemo(() => {
    const vids = activeDetails?.videos?.results;
    if (!Array.isArray(vids) || vids.length === 0) return null;
    const ytVids = vids.filter((v: any) => v.site === 'YouTube' && v.key);
    if (ytVids.length === 0) return null;
    const officialTrailer =
      ytVids.find((v: any) => v.type === 'Trailer' && v.official) ||
      ytVids.find((v: any) => v.type === 'Trailer') ||
      ytVids.find((v: any) => v.type === 'Teaser') ||
      ytVids[0];
    return officialTrailer?.key || null;
  }, [activeDetails]);

  // Trigger smooth cross-fade whenever activeItem changes
  useEffect(() => {
    heroFade.value = 0.15;
    heroFade.value = withTiming(1, { duration: 340 });
  }, [activeItem?.id, trailerKey, heroFade]);

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroFade.value,
  }));

  const inWatchlist = useMemo(() => {
    if (!activeItem) return false;
    return watchlist.some((w) => String(w.id) === String(activeItem.id));
  }, [watchlist, activeItem]);

  const handleToggleWatchlist = useCallback(() => {
    if (!activeItem) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // ignore
    }
    const idStr = String(activeItem.id);
    if (inWatchlist) {
      removeFromWatchlist(idStr);
    } else {
      addToWatchlist({
        id: idStr,
        title: activeItem.title || activeItem.name || 'Untitled',
        posterUrl: getImageUrl(activeItem.poster_path || activeItem.backdrop_path, 'w500'),
        mediaType: activeMediaType,
        voteAverage: activeItem.vote_average,
      });
    }
  }, [activeItem, activeMediaType, inWatchlist, addToWatchlist, removeFromWatchlist]);

  const handleSelectCard = useCallback(
    (item: any) => {
      const clickedId = String(item.id);
      try {
        Haptics.selectionAsync().catch(() => {});
      } catch {
        // ignore
      }
      if (clickedId === String(activeItem?.id)) {
        // Second tap on the already-previewing poster goes straight to Detail screen
        const mType =
          item.media_type === 'tv' || (item.first_air_date && !item.release_date)
            ? 'tv'
            : 'movie';
        router.push(`/detail/${mType}/${item.id}`);
      } else {
        setSelectedId(clickedId);
      }
    },
    [activeItem]
  );

  const activeTitle = activeItem?.title || activeItem?.name || '';
  const activeYear = (activeItem?.release_date || activeItem?.first_air_date || '')
    .split('-')[0]
    .trim();
  const activeBackdrop = getImageUrl(
    activeItem?.backdrop_path || activeItem?.poster_path,
    'w780'
  );

  const isLoading = isSearching ? searchLoading : trendingLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Search Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 14) }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <ChevronLeft color="#fff" size={24} />
        </Pressable>

        <View style={styles.inputContainer}>
          <SearchIcon color="rgba(255,255,255,0.45)" size={18} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search movies, series, classics..."
            placeholderTextColor="rgba(255,255,255,0.32)"
            value={query}
            onChangeText={setQuery}
            autoFocus={false}
            returnKeyType="search"
            cursorColor={THEME.colors.red}
            selectionColor={THEME.colors.red}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8} style={styles.clearBtn}>
              <X color="rgba(255,255,255,0.6)" size={18} />
            </Pressable>
          )}
        </View>
      </View>

      {/* TOP ~40%: Cinematic Hero Video Preview & Quick Actions */}
      {activeItem && (
        <Animated.View style={[styles.heroSection, heroAnimatedStyle]}>
          <View style={styles.heroVideoContainer}>
            {/* Backdrop Underlayer while trailer loads or if no trailer exists */}
            {activeBackdrop ? (
              <RNImage
                source={{ uri: activeBackdrop }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : null}

            {/* Live Muted Auto-Play YouTube Trailer */}
            {trailerKey && !fullscreenModalVisible ? (
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <YoutubePlayer
                  key={`${activeItem.id}-${trailerKey}`}
                  width={width}
                  height={HERO_VIDEO_HEIGHT}
                  play={true}
                  mute={isMuted}
                  videoId={trailerKey}
                  webViewProps={{
                    androidLayerType: 'hardware',
                    mediaPlaybackRequiresUserAction: false,
                  }}
                  initialPlayerParams={{
                    controls: false,
                    modestbranding: true,
                    rel: false,
                    iv_load_policy: 3,
                    loop: true,
                  }}
                />
              </View>
            ) : null}

            {/* Subtle Top & Bottom Cinematic Vignette */}
            <LinearGradient
              colors={['rgba(11,12,16,0.35)', 'transparent', 'rgba(11,12,16,0.96)']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Top-Left Preview Status Badge */}
            <View style={styles.previewBadge}>
              <View style={styles.previewDot} />
              <REDText size={9.5} weight="bold" color="#fff" style={{ letterSpacing: 0.6 }}>
                {trailerKey
                  ? 'TRAILER PREVIEW'
                  : trailerFetching
                  ? 'LOADING PREVIEW...'
                  : 'SPOTLIGHT PREVIEW'}
              </REDText>
            </View>

            {/* Top-Right Mute/Unmute & Fullscreen Controls */}
            {trailerKey && (
              <View style={styles.heroControlsRow}>
                <Pressable
                  onPress={() => setIsMuted((prev) => !prev)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.heroControlBtn,
                    pressed && { opacity: 0.75, transform: [{ scale: 0.94 }] },
                  ]}
                >
                  {isMuted ? (
                    <VolumeX size={16} color="#fff" />
                  ) : (
                    <Volume2 size={16} color="#fff" />
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setFullscreenModalVisible(true)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.heroControlBtn,
                    pressed && { opacity: 0.75, transform: [{ scale: 0.94 }] },
                  ]}
                >
                  <Maximize2 size={15} color="#fff" />
                </Pressable>
              </View>
            )}
          </View>

          {/* Hero Metadata + Quick Action Buttons (+ Watchlist, Details) */}
          <View style={styles.heroInfoBar}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <REDText size={17} weight="bold" color="#fff" numberOfLines={1}>
                {activeTitle}
              </REDText>
              <View style={styles.heroMetaRow}>
                {activeYear ? (
                  <REDText size={11.5} weight="semibold" color="rgba(255,255,255,0.65)">
                    {activeYear}
                  </REDText>
                ) : null}
                <REDText size={11.5} color="rgba(255,255,255,0.35)">
                  •
                </REDText>
                <REDText size={11.5} weight="semibold" color="rgba(255,255,255,0.65)">
                  {activeMediaType === 'tv' ? 'Series' : 'Movie'}
                </REDText>
                {activeItem.vote_average ? (
                  <>
                    <REDText size={11.5} color="rgba(255,255,255,0.35)">
                      •
                    </REDText>
                    <View style={styles.ratingInline}>
                      <Star size={11} color="#F5C518" fill="#F5C518" />
                      <REDText
                        size={11.5}
                        weight="bold"
                        color="#F5C518"
                        style={{ marginLeft: 3 }}
                      >
                        {Number(activeItem.vote_average).toFixed(1)}
                      </REDText>
                    </View>
                  </>
                ) : null}
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.heroActions}>
              <Pressable
                onPress={handleToggleWatchlist}
                style={({ pressed }) => [
                  styles.quickBtn,
                  inWatchlist && styles.quickBtnActive,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
                ]}
              >
                {inWatchlist ? (
                  <Check size={14} color="#fff" />
                ) : (
                  <Plus size={14} color="#fff" />
                )}
                <REDText size={12} weight="bold" color="#fff" style={{ marginLeft: 5 }}>
                  {inWatchlist ? 'In List' : 'My List'}
                </REDText>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push(`/detail/${activeMediaType}/${activeItem.id}`)
                }
                style={({ pressed }) => [
                  styles.detailsBtn,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
                ]}
              >
                <Info size={14} color="#fff" />
                <REDText size={12} weight="bold" color="#fff" style={{ marginLeft: 5 }}>
                  Details
                </REDText>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}

      {/* BOTTOM ~60%: Scrollable 3-Column Poster Grid (Keyboard-Friendly) */}
      <View style={styles.gridSection}>
        <View style={styles.gridHeaderRow}>
          <REDText
            size={12}
            weight="bold"
            color="rgba(255,255,255,0.5)"
            style={{ letterSpacing: 0.7 }}
          >
            {isSearching
              ? `SEARCH RESULTS (${results.length})`
              : 'TRENDING WORLDWIDE • TAP TO PREVIEW'}
          </REDText>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={THEME.colors.red} />
          </View>
        ) : results.length === 0 ? (
          <Animated.View entering={FadeIn} style={styles.center}>
            <SearchIcon
              color="rgba(255,255,255,0.12)"
              size={54}
              style={{ marginBottom: 12 }}
            />
            <REDText size={16} color="rgba(255,255,255,0.5)">
              No titles found for &quot;{debouncedQuery}&quot;
            </REDText>
          </Animated.View>
        ) : (
          <FlatList
            data={results}
            numColumns={3}
            keyExtractor={(item) => `${item.media_type || 'm'}-${item.id}`}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridListContent}
            columnWrapperStyle={styles.gridColumnWrapper}
            renderItem={({ item }) => {
              const isSelected = String(item.id) === String(activeItem?.id);
              const posterUri = getImageUrl(
                item.poster_path || item.backdrop_path,
                'w342'
              );
              const itemTitle = item.title || item.name;

              return (
                <Pressable
                  onPress={() => handleSelectCard(item)}
                  style={({ pressed }) => [
                    styles.posterCard,
                    pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <View
                    style={[
                      styles.posterWrapper,
                      isSelected && styles.posterWrapperSelected,
                    ]}
                  >
                    {posterUri ? (
                      <RNImage
                        source={{ uri: posterUri }}
                        style={styles.posterImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.posterImg, { backgroundColor: '#1a1d24' }]} />
                    )}

                    {isSelected && (
                      <View style={styles.nowPreviewingTag}>
                        <Play size={8} color="#fff" fill="#fff" style={{ marginRight: 3 }} />
                        <REDText size={8.5} weight="bold" color="#fff">
                          PREVIEWING
                        </REDText>
                      </View>
                    )}
                  </View>

                  <REDText
                    size={11.5}
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? '#fff' : 'rgba(255,255,255,0.75)'}
                    numberOfLines={1}
                    style={{ marginTop: 5 }}
                  >
                    {itemTitle}
                  </REDText>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {/* Fullscreen Trailer Modal when Maximize button is pressed */}
      {activeItem && trailerKey && (
        <YouTubePlayerModal
          visible={fullscreenModalVisible}
          videoId={trailerKey}
          title={`${activeTitle} — Official Trailer`}
          subtitle={activeItem.overview}
          year={activeYear}
          genre={activeMediaType === 'tv' ? 'Series' : 'Movie'}
          onClose={() => setFullscreenModalVisible(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: '#0b0c10',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 22,
    height: 42,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14.5,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 6,
  },
  heroSection: {
    backgroundColor: '#11131a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  heroVideoContainer: {
    width: '100%',
    height: HERO_VIDEO_HEIGHT,
    backgroundColor: '#050608',
    position: 'relative',
    overflow: 'hidden',
  },
  previewBadge: {
    position: 'absolute',
    top: 10,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 22, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.red,
    marginRight: 6,
  },
  heroControlsRow: {
    position: 'absolute',
    top: 10,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroControlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(12, 13, 18, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#11131a',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
  },
  quickBtnActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.22)',
    borderColor: THEME.colors.red,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.red,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  gridSection: {
    flex: 1,
    backgroundColor: '#0b0c10',
  },
  gridHeaderRow: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 10,
    paddingBottom: 6,
  },
  gridListContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 4,
    paddingBottom: 80,
  },
  gridColumnWrapper: {
    gap: GRID_GAP,
    marginBottom: 14,
  },
  posterCard: {
    width: POSTER_WIDTH,
  },
  posterWrapper: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#161822',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    position: 'relative',
  },
  posterWrapperSelected: {
    borderColor: THEME.colors.red,
    borderWidth: 2,
  },
  posterImg: {
    width: '100%',
    height: '100%',
  },
  nowPreviewingTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
