import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Image as RNImage, Linking, Pressable, Alert, Share } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { ChevronLeft, Play, Plus, Download, Check, MessageSquare, Star, Share2 } from 'lucide-react-native';
import { tmdbAPI, getImageUrl } from '../../../src/services/tmdb';
import { getCartoonById } from '../../../src/constants/cartoons';
import { THEME } from '../../../src/constants/theme';
import { REDText } from '../../../src/components/ui/REDText';
import { REDButton } from '../../../src/components/ui/REDButton';
import { YouTubePlayerModal } from '../../../src/components/ui/YouTubePlayerModal';
import { useWatchlistStore } from '../../../src/store/useWatchlistStore';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.55;

// Pseudo-random tint color based on ID
const getDominantColor = (idStr: string) => {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  const hues = [0, 30, 150, 210, 260, 300]; // Red, Orange, Green, Blue, Purple, Pink
  const h = hues[Math.abs(hash) % hues.length];
  return `hsla(${h}, 60%, 15%, 0.8)`; // Deep rich tint
};

export default function DetailScreen() {
  const { type, id } = useLocalSearchParams();
  const scrollY = useSharedValue(0);
  
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const stringId = Array.isArray(id) ? id[0] : String(id);
  const isCartoon = type === 'cartoon';
  const isTv = type === 'tv';
  
  const inMyList = watchlist.some(w => String(w.id) === stringId);
  const dominantColor = getDominantColor(stringId);

  // Selected Season index
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);

  // In-App YouTube Player state
  const [playerModal, setPlayerModal] = useState<{
    visible: boolean;
    videoId: string | null;
    title?: string;
    subtitle?: string;
  }>({
    visible: false,
    videoId: null,
  });

  // 1. If it's a cartoon, load from local catalog
  const cartoonData = useMemo(() => {
    if (isCartoon) {
      return getCartoonById(stringId);
    }
    return null;
  }, [isCartoon, stringId]);

  // 2. If it's TMDB content, fetch details
  const { data: tmdbData, isLoading: tmdbLoading } = useQuery({
    queryKey: ['detail', type, id],
    queryFn: () => tmdbAPI.getDetails(id as string, type as 'movie' | 'tv'),
    enabled: !isCartoon
  });

  const data = isCartoon ? {
    title: cartoonData?.title,
    name: cartoonData?.name,
    backdrop_path: cartoonData?.backdropUrl,
    poster_path: cartoonData?.posterUrl,
    overview: cartoonData?.overview,
    release_date: cartoonData?.releaseDate,
    vote_average: cartoonData?.voteAverage,
    runtime: null,
    videos: {
      results: cartoonData?.seasons?.[0]?.episodes?.[0]?.youtubeId ? [
        {
          site: 'YouTube',
          type: 'Trailer',
          key: cartoonData.seasons[0].episodes[0].youtubeId
        }
      ] : []
    },
    credits: { cast: [] },
    similar: { results: [] }
  } : tmdbData;

  const isLoading = isCartoon ? !cartoonData : tmdbLoading;

  // TMDB TV Seasons
  const tmdbSeasons = useMemo(() => {
    if (!isTv || !tmdbData?.seasons) return [];
    return tmdbData.seasons.filter((s: any) => s.season_number > 0);
  }, [isTv, tmdbData?.seasons]);

  const selectedTmdbSeasonNumber = tmdbSeasons[selectedSeasonIndex]?.season_number || 1;

  // Fetch TMDB Episodes for selected season
  const { data: tmdbSeasonData } = useQuery({
    queryKey: ['tvSeason', stringId, selectedTmdbSeasonNumber],
    queryFn: () => tmdbAPI.getSeasonDetails(stringId, selectedTmdbSeasonNumber),
    enabled: isTv && tmdbSeasons.length > 0
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [-100, 0, HEADER_HEIGHT], [-50, 0, HEADER_HEIGHT * 0.5], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollY.value, [-100, 0], [1.2, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 100], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollY.value, [0, 100], [0, -30], Extrapolation.CLAMP) },
      ],
    };
  });

  if (isLoading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.red} />
      </View>
    );
  }

  const title = data.title || data.name;
  const releaseYear = (data.release_date || data.first_air_date || '').split('-')[0];
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : (isCartoon ? 'Animation' : '');
  const metadata = [releaseYear, runtime].filter(Boolean).join(' • ');

  let trailerId = null;
  if (data?.videos?.results) {
    const ytVideos = data.videos.results.filter((v: any) => v.site === 'YouTube');
    const trailer = ytVideos.find((v: any) => v.type === 'Trailer') || ytVideos[0];
    if (trailer) {
      trailerId = trailer.key;
    }
  }

  const logos = (data as any)?.images?.logos;
  const logoObj = logos?.find((l: any) => l.iso_639_1 === 'en') || logos?.[0];
  const logoUrl = logoObj ? getImageUrl(logoObj.file_path, 'w500') : null;

  const watchProviders = (data as any)?.['watch/providers']?.results?.TR || (data as any)?.['watch/providers']?.results?.US;
  const providerName = watchProviders?.flatrate?.[0]?.provider_name;
  const providerLogo = watchProviders?.flatrate?.[0]?.logo_path ? getImageUrl(watchProviders.flatrate[0].logo_path, 'w92') : null;
  const watchLink = watchProviders?.link;

  const handleToggleList = () => {
    if (inMyList) {
      removeFromWatchlist(stringId);
    } else if (data) {
      addToWatchlist({
        id: stringId,
        title: data.title || data.name,
        mediaType: type as any,
        posterUrl: isCartoon ? (cartoonData?.posterUrl || '') : getImageUrl((data as any).poster_path, 'w500')
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = trailerId 
        ? `https://www.youtube.com/watch?v=${trailerId}` 
        : `https://www.themoviedb.org/${type}/${stringId}`;
      await Share.share({
        title,
        message: `Check out "${title}" on RED! 🎬\n${shareUrl}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const playEpisode = (ep: any) => {
    if (ep.youtubeId) {
      setPlayerModal({
        visible: true,
        videoId: ep.youtubeId,
        title: `${title} - ${ep.title}`,
        subtitle: ep.overview,
      });
    } else {
      // Search for TMDB episode on YouTube
      const query = encodeURIComponent(`${title} Season ${selectedTmdbSeasonNumber} Episode ${ep.episode_number || 1}`);
      Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
    }
  };

  // Determine seasons list
  const seasonsList = isCartoon 
    ? (cartoonData?.seasons || []) 
    : tmdbSeasons;

  const currentEpisodes = isCartoon 
    ? (cartoonData?.seasons?.[selectedSeasonIndex]?.episodes || [])
    : (tmdbSeasonData?.episodes || []);

  const hasSeasons = isCartoon || (isTv && seasonsList.length > 0);

  return (
    <View style={styles.container}>
      {/* Dynamic Background Base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: dominantColor, opacity: 0.2 }]} />
      
      {/* Back Button */}
      <Pressable 
        onPress={() => router.back()} 
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <ChevronLeft color="#fff" size={28} />
        </View>
      </Pressable>

      {/* Share Button */}
      <Pressable 
        onPress={handleShare} 
        style={({ pressed }) => [styles.shareButton, pressed && { opacity: 0.7 }]}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <Share2 color="#fff" size={20} />
        </View>
      </Pressable>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Landscape Backdrop */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          {(data.backdrop_path || data.poster_path) ? (
            <RNImage
              source={{ uri: isCartoon ? (data.backdrop_path || data.poster_path) : getImageUrl(data.backdrop_path || data.poster_path, 'original') }}
              style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1d24' }]} />
          )}
          <LinearGradient
            colors={['transparent', dominantColor, THEME.colors.background]}
            locations={[0.2, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Main Content Area */}
        <View style={styles.content}>
          <Animated.View style={[{ alignItems: 'flex-start', marginBottom: 24 }, logoAnimatedStyle]}>
            {logoUrl ? (
              <RNImage 
                source={{ uri: logoUrl }} 
                style={{ width: width * 0.65, height: 100, marginBottom: 12 }} 
                resizeMode="contain" 
              />
            ) : (
              <REDText weight="bold" size={32} style={{ marginBottom: 12 }}>{title}</REDText>
            )}
            
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <REDText color={THEME.colors.textSecondary} size={15} weight="semibold">{metadata}</REDText>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(isCartoon ? ['FREE', 'HD', 'FAMILY'] : (Number(releaseYear) >= 2018 ? ['4K', 'VISION', 'ATMOS'] : ['HD', '5.1'])).map((badge) => (
                  <View key={badge} style={styles.badge}>
                    <REDText size={10} weight="bold" color="rgba(255,255,255,0.8)">{badge}</REDText>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <REDButton 
              title={isCartoon ? "Watch Episode 1" : (trailerId ? "Play Trailer" : (providerName ? `Play on ${providerName}` : "Play Trailer"))} 
              variant="primary" 
              icon={
                providerLogo ? (
                  <RNImage 
                    source={{ uri: providerLogo }} 
                    style={{ width: 24, height: 24, borderRadius: 4, marginRight: 4 }} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.playIconWrapper}>
                    <Play color={THEME.colors.red} size={16} fill={THEME.colors.red} style={{ marginLeft: 2 }} />
                  </View>
                )
              } 
              style={styles.playButton}
              onPress={() => {
                if (isCartoon && cartoonData?.seasons?.[0]?.episodes?.[0]?.youtubeId) {
                  playEpisode(cartoonData.seasons[0].episodes[0]);
                } else if (trailerId) {
                  setPlayerModal({
                    visible: true,
                    videoId: trailerId,
                    title: `${title} - Official Trailer`,
                    subtitle: data?.overview,
                  });
                } else if (providerName) {
                  const pName = providerName.toLowerCase();
                  const encodedTitle = encodeURIComponent(data?.title || data?.name || '');
                  let deepLink = '';
                  
                  if (pName.includes('netflix')) {
                    deepLink = `nflx://www.netflix.com/search?q=${encodedTitle}`;
                  } else if (pName.includes('disney')) {
                    deepLink = `https://www.disneyplus.com/search?q=${encodedTitle}`;
                  } else if (pName.includes('amazon') || pName.includes('prime')) {
                    deepLink = `https://app.primevideo.com/search?searchTerm=${encodedTitle}`;
                  } else {
                    deepLink = `https://www.google.com/search?q=Watch+${encodedTitle}+on+${encodeURIComponent(providerName)}`;
                  }
                  
                  Linking.openURL(deepLink).catch(() => {
                    if (watchLink) Linking.openURL(watchLink);
                  });
                } else {
                  Alert.alert("Play Not Available", "There are no streaming providers or trailers available for this title.");
                }
              }}
            />
            <Pressable 
              onPress={handleToggleList} 
              style={({ pressed }) => [styles.watchlistButton, pressed && { opacity: 0.7 }]}
            >
              {inMyList ? (
                <>
                  <Check color="#fff" size={20} style={{ marginRight: 6 }} />
                  <REDText weight="semibold" size={14} color="#fff">Added</REDText>
                </>
              ) : (
                <>
                  <Plus color="#fff" size={20} style={{ marginRight: 6 }} />
                  <REDText weight="semibold" size={14} color="#fff">Watchlist</REDText>
                </>
              )}
            </Pressable>
          </View>

          {/* Synopsis */}
          <View style={{ marginBottom: 28 }}>
            <REDText size={15} color="rgba(255,255,255,0.8)" style={{ lineHeight: 24 }}>
              {data.overview || "No overview available."}
            </REDText>
          </View>

          {/* SEASONS & EPISODES SECTION */}
          {hasSeasons && (
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <REDText weight="bold" size={20} color="#fff">Episodes</REDText>
                <REDText size={13} color={THEME.colors.textSecondary}>
                  {currentEpisodes.length} Episodes
                </REDText>
              </View>

              {/* Season Selector Pills */}
              {seasonsList.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 16 }}>
                  {seasonsList.map((s: any, idx: number) => {
                    const isSelected = selectedSeasonIndex === idx;
                    const seasonTitle = s.title || s.name || `Season ${s.seasonNumber || s.season_number || idx + 1}`;
                    return (
                      <Pressable
                        key={idx}
                        onPress={() => setSelectedSeasonIndex(idx)}
                        style={[
                          styles.seasonPill,
                          isSelected && styles.seasonPillActive
                        ]}
                      >
                        <REDText size={13} weight="bold" color={isSelected ? '#fff' : 'rgba(255,255,255,0.6)'}>
                          {seasonTitle}
                        </REDText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Episodes List */}
              <View style={{ gap: 12 }}>
                {currentEpisodes.map((ep: any, epIdx: number) => {
                  const epNumber = ep.episodeNumber || ep.episode_number || epIdx + 1;
                  const epTitle = ep.title || ep.name || `Episode ${epNumber}`;
                  const thumbUri = ep.thumbnailUrl || (ep.still_path ? getImageUrl(ep.still_path, 'w342') : null);

                  return (
                    <Pressable
                      key={ep.id || epIdx}
                      onPress={() => playEpisode(ep)}
                      style={({ pressed }) => [
                        styles.episodeCard,
                        pressed && { opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.08)' }
                      ]}
                    >
                      {/* Thumbnail with Play Icon */}
                      <View style={styles.episodeThumbContainer}>
                        {thumbUri ? (
                          <RNImage
                            source={{ uri: thumbUri }}
                            style={styles.episodeThumb}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.episodeThumb, { backgroundColor: '#1e222d', justifyContent: 'center', alignItems: 'center' }]}>
                            <Play color="rgba(255,255,255,0.4)" size={20} />
                          </View>
                        )}
                        <View style={styles.episodePlayOverlay}>
                          <View style={styles.episodePlayCircle}>
                            <Play fill="#fff" color="#fff" size={14} style={{ marginLeft: 2 }} />
                          </View>
                        </View>
                        {ep.duration && (
                          <View style={styles.durationBadge}>
                            <REDText size={10} weight="bold" color="#fff">{ep.duration}</REDText>
                          </View>
                        )}
                      </View>

                      {/* Episode Info */}
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <REDText size={11} weight="bold" color={THEME.colors.red}>
                          EPISODE {epNumber}
                        </REDText>
                        <REDText size={14} weight="bold" color="#fff" numberOfLines={1} style={{ marginTop: 2 }}>
                          {epTitle}
                        </REDText>
                        {ep.overview ? (
                          <REDText size={12} color="rgba(255,255,255,0.6)" numberOfLines={2} style={{ marginTop: 4, lineHeight: 16 }}>
                            {ep.overview}
                          </REDText>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Cast */}
          {(data as any)?.credits?.cast && (data as any).credits.cast.length > 0 && (
            <View style={styles.section}>
              <REDText weight="bold" size={18} style={styles.sectionTitle}>Cast</REDText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24, gap: 16 }}>
                {(data as any).credits.cast.slice(0, 10).map((person: any) => (
                  <View key={person.id} style={{ width: 80, alignItems: 'center' }}>
                    {person.profile_path ? (
                      <RNImage 
                        source={{ uri: getImageUrl(person.profile_path, 'w500') }}
                        style={styles.castImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.castImage, { backgroundColor: '#1a1d24', justifyContent: 'center', alignItems: 'center' }]}>
                        <REDText size={24} color="rgba(255,255,255,0.3)">?</REDText>
                      </View>
                    )}
                    <REDText size={12} style={{ textAlign: 'center' }} numberOfLines={2}>{person.name}</REDText>
                    <REDText size={10} color={THEME.colors.textSecondary} style={{ textAlign: 'center', marginTop: 2 }} numberOfLines={1}>{person.character}</REDText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Trailer Section */}
          {trailerId && (
            <View style={styles.section}>
              <REDText weight="bold" size={18} style={styles.sectionTitle}>Trailer</REDText>
              <Pressable 
                onPress={() => setPlayerModal({
                  visible: true,
                  videoId: trailerId,
                  title: `${title} - Official Trailer`,
                  subtitle: data?.overview,
                })}
                style={({ pressed }) => [
                  { height: 160, borderRadius: 12, overflow: 'hidden', backgroundColor: '#161922', justifyContent: 'center', alignItems: 'center' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                {data.backdrop_path ? (
                  <RNImage source={{ uri: isCartoon ? data.backdrop_path : getImageUrl(data.backdrop_path, 'w780') }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : null}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }]}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: THEME.colors.red, justifyContent: 'center', alignItems: 'center' }}>
                    <Play fill="#fff" color="#fff" size={24} style={{ marginLeft: 3 }} />
                  </View>
                  <REDText size={14} weight="bold" color="#fff" style={{ marginTop: 8 }}>Watch Official Trailer</REDText>
                </View>
              </Pressable>
            </View>
          )}

          {/* More Like This */}
          {(data as any)?.similar?.results && (data as any).similar.results.length > 0 && (
            <View style={styles.section}>
              <REDText weight="bold" size={18} style={styles.sectionTitle}>More Like This</REDText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24, gap: 12 }}>
                {(data as any).similar.results.slice(0, 10).map((similarItem: any) => (
                  <Pressable key={similarItem.id} style={{ width: 120 }} onPress={() => router.push(`/detail/${type}/${similarItem.id}`)}>
                    {similarItem.poster_path ? (
                      <RNImage source={{ uri: getImageUrl(similarItem.poster_path, 'w500') }} style={styles.similarImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.similarImage, { backgroundColor: '#1a1d24', justifyContent: 'center', alignItems: 'center' }]}>
                        <REDText size={24} color="rgba(255,255,255,0.3)">?</REDText>
                      </View>
                    )}
                    <REDText size={13} numberOfLines={2}>{similarItem.title || similarItem.name}</REDText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* In-App YouTube Player Modal */}
      <YouTubePlayerModal
        visible={playerModal.visible}
        videoId={playerModal.videoId}
        title={playerModal.title}
        subtitle={playerModal.subtitle}
        onClose={() => setPlayerModal({ visible: false, videoId: null })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  loadingContainer: { flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  shareButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  header: { height: HEADER_HEIGHT, width },
  content: { paddingHorizontal: 24, marginTop: -140 },
  badge: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: 'rgba(255,255,255,0.05)' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  playButton: { flex: 1, backgroundColor: THEME.colors.red, height: 52 },
  playIconWrapper: { backgroundColor: '#fff', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  section: { marginTop: 32 },
  sectionTitle: { marginBottom: 16 },
  seasonPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  seasonPillActive: {
    backgroundColor: THEME.colors.red,
    borderColor: THEME.colors.red,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 10,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  episodeThumbContainer: {
    width: 110,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  episodeThumb: {
    width: '100%',
    height: '100%',
  },
  episodePlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodePlayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  castImage: { width: 70, height: 70, borderRadius: 35, marginBottom: 8 },
  similarImage: { width: 120, height: 180, borderRadius: 8, marginBottom: 8 }
});
