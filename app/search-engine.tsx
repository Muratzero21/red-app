import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  FlatList,
  Dimensions,
  Image as RNImage,
  Keyboard,
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
const HERO_VIDEO_HEIGHT = Math.min(Math.round(width * (9 / 16)), Math.round(height * 0.24));
const GRID_PADDING = 14;
const GRID_GAP = 10;
const POSTER_WIDTH = Math.floor((width - GRID_PADDING * 2 - GRID_GAP * 2) / 3);
const POSTER_HEIGHT = Math.round(POSTER_WIDTH * 1.48);

type SearchFilterType = 'all' | 'movie' | 'tv';

export default function SearchEngine() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterType, setFilterType] = useState<SearchFilterType>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);
  const [fullscreenModalVisible, setFullscreenModalVisible] = useState<boolean>(false);

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();

  // Cross-fade opacity shared value for smooth Hero trailer switching
  const heroFade = useSharedValue(1);

  // Track keyboard state so search results are always 100% visible while typing
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 1. 300ms Debounce for TMDB search input (starts from 1 character)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = debouncedQuery.length >= 1;

  // 2. Multi-endpoint TMDB + local stream search (Movies + Series in EN & TR + Actor known_for)
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['tmdbSearchCatalog', debouncedQuery],
    queryFn: () => tmdbAPI.searchCatalog(debouncedQuery),
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
    const valid = rawList.filter(
      (item: any) =>
        item &&
        (item.poster_path || item.backdrop_path) &&
        (item.title || item.name)
    );

    if (filterType === 'all') return valid;
    if (filterType === 'movie') {
      return valid.filter(
        (item: any) =>
          item.media_type === 'movie' ||
          (!item.media_type && item.title && !item.first_air_date)
      );
    }
    return valid.filter(
      (item: any) =>
        item.media_type === 'tv' ||
        item.media_type === 'cartoon' ||
        item.media_type === 'stream' ||
        (!item.media_type && item.first_air_date)
    );
  }, [isSearching, searchData, trendingData, filterType]);

  // Automatically select the first result when query or filter changes
  useEffect(() => {
    if (results.length > 0) {
      setSelectedId(String(results[0].id));
    } else {
      setSelectedId(null);
    }
  }, [debouncedQuery, filterType, results.length]);

  const activeItem = useMemo(() => {
    if (results.length === 0) return null;
    if (!selectedId) return results[0];
    return results.find((r: any) => String(r.id) === String(selectedId)) || results[0];
  }, [results, selectedId]);

  const activeRouteType: 'movie' | 'tv' | 'cartoon' | 'stream' = useMemo(() => {
    if (!activeItem) return 'movie';
    if (activeItem.media_type === 'cartoon') return 'cartoon';
    if (activeItem.media_type === 'stream') return 'stream';
    if (activeItem.media_type === 'tv') return 'tv';
    if (activeItem.media_type === 'movie') return 'movie';
    return activeItem.first_air_date && !activeItem.release_date ? 'tv' : 'movie';
  }, [activeItem]);

  const tmdbFetchType: 'movie' | 'tv' =
    activeRouteType === 'movie' ? 'movie' : 'tv';
  const tmdbLookupId = activeItem?.tmdbId || activeItem?.id;

  // 3. Fetch TMDB videos endpoint for the currently selected Hero item
  const { data: activeDetails, isFetching: trailerFetching } = useQuery({
    queryKey: ['searchHeroTrailer', tmdbLookupId, tmdbFetchType],
    queryFn: () =>
      tmdbLookupId ? tmdbAPI.getDetails(tmdbLookupId, tmdbFetchType) : null,
    enabled: Boolean(tmdbLookupId && !activeItem?.trailerId),
    staleTime: 1000 * 60 * 10,
  });

  const trailerKey = useMemo(() => {
    if (activeItem?.trailerId) return activeItem.trailerId;
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
  }, [activeItem, activeDetails]);

  // Trigger smooth cross-fade whenever activeItem changes
  useEffect(() => {
    heroFade.value = 0.15;
    heroFade.value = withTiming(1, { duration: 320 });
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
        mediaType: activeRouteType === 'movie' ? 'movie' : 'tv',
        voteAverage: activeItem.vote_average,
      });
    }
  }, [activeItem, activeRouteType, inWatchlist, addToWatchlist, removeFromWatchlist]);

  const getItemRouteType = (item: any) => {
    if (item.media_type === 'cartoon') return 'cartoon';
    if (item.media_type === 'stream') return 'stream';
    if (item.media_type === 'tv') return 'tv';
    if (item.media_type === 'movie') return 'movie';
    return item.first_air_date && !item.release_date ? 'tv' : 'movie';
  };

  const handleSelectCard = useCallback(
    (item: any) => {
      Keyboard.dismiss();
      const clickedId = String(item.id);
      try {
        Haptics.selectionAsync().catch(() => {});
      } catch {
        // ignore
      }
      if (clickedId === String(activeItem?.id) && !isKeyboardOpen) {
        // Second tap on the already-previewing poster goes straight to Detail screen
        const mType = getItemRouteType(item);
        router.push(`/detail/${mType}/${item.id}`);
      } else {
        setSelectedId(clickedId);
      }
    },
    [activeItem, isKeyboardOpen]
  );

  const activeTitle = activeItem?.title || activeItem?.name || '';
  const activeYear = String(activeItem?.release_date || activeItem?.first_air_date || '')
    .split('-')[0]
    .trim();
  const activeBackdrop = getImageUrl(
    activeItem?.backdrop_path || activeItem?.poster_path,
    'w780'
  );

  const isLoading = isSearching ? searchLoading : trendingLoading;

  return (
    <View style={styles.container}>
      {/* Top Search Header */}
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
            placeholder="Search any movie, series, or actor..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => {
              setDebouncedQuery(query.trim());
              Keyboard.dismiss();
            }}
            autoFocus={true}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            cursorColor={THEME.colors.red}
            selectionColor={THEME.colors.red}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery('');
                setDebouncedQuery('');
              }}
              hitSlop={8}
              style={styles.clearBtn}
            >
              <X color="rgba(255,255,255,0.65)" size={18} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Pills: All | Movies | Series */}
      <View style={styles.filterBar}>
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'movie', label: 'Movies' },
            { key: 'tv', label: 'Series' },
          ] as const
        ).map((tab) => {
          const isActive = filterType === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setFilterType(tab.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <REDText
                size={12}
                weight={isActive ? 'bold' : 'medium'}
                color={isActive ? '#fff' : 'rgba(255,255,255,0.65)'}
              >
                {tab.label}
              </REDText>
            </Pressable>
          );
        })}

        {isSearching && (
          <REDText
            size={11.5}
            weight="semibold"
            color="rgba(255,255,255,0.45)"
            style={{ marginLeft: 'auto' }}
          >
            {results.length} results
          </REDText>
        )}
      </View>

      {/* TOP ~40%: Cinematic Hero Video Preview & Quick Actions */}
      {activeItem && (
        <Animated.View style={[styles.heroSection, heroAnimatedStyle]}>
          {/* Collapse tall video frame while keyboard is open so results grid has full visibility */}
          {!isKeyboardOpen && (
            <View style={styles.heroVideoContainer}>
              {activeBackdrop ? (
                <RNImage
                  source={{ uri: activeBackdrop }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : null}

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

              <LinearGradient
                colors={['rgba(11,12,16,0.35)', 'transparent', 'rgba(11,12,16,0.96)']}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />

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
          )}

          {/* Hero Metadata + Quick Action Buttons (+ My List, Details) */}
          <View style={styles.heroInfoBar}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <REDText size={16} weight="bold" color="#fff" numberOfLines={1}>
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
                  {activeRouteType === 'movie' ? 'Movie' : 'Series'}
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
                onPress={() => {
                  Keyboard.dismiss();
                  router.push(`/detail/${activeRouteType}/${activeItem.id}`);
                }}
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

      {/* BOTTOM ~60%: Scrollable 3-Column Poster Grid */}
      <View style={styles.gridSection}>
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
              No movies or series found for &quot;{debouncedQuery}&quot;
            </REDText>
          </Animated.View>
        ) : (
          <FlatList
            data={results}
            numColumns={3}
            keyExtractor={(item, idx) => `${item.media_type || 'm'}-${item.id}-${idx}`}
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
              const isMovie = getItemRouteType(item) === 'movie';

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

                    {/* Top-left Movie/Series badge */}
                    <View style={styles.typeMicroBadge}>
                      <REDText size={8} weight="bold" color="rgba(255,255,255,0.9)">
                        {isMovie ? 'MOVIE' : 'SERIES'}
                      </REDText>
                    </View>

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
          genre={activeRouteType === 'movie' ? 'Movie' : 'Series'}
          onClose={() => setFullscreenModalVisible(false)}
        />
      )}
    </View>
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
    paddingBottom: 8,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    height: 42,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: '#0b0c10',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  filterChipActive: {
    backgroundColor: THEME.colors.red,
    borderColor: THEME.colors.red,
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
  gridListContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 10,
    paddingBottom: 90,
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
  typeMicroBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(10, 11, 16, 0.78)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
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
