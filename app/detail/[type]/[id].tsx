import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Image as RNImage, Linking, Pressable, Alert, Share, Modal } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { ChevronLeft, Play, Plus, Download, Check, MessageSquare, Star, Share2, ChevronDown, X } from 'lucide-react-native';
import { tmdbAPI, getImageUrl } from '../../../src/services/tmdb';
import { getStreamShowById, getCartoonById } from '../../../src/constants/streams';
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

  // 1. If it's a stream show (cartoons, turkish classics, indie web), resolve from hybrid catalog
  const streamShow = useMemo(() => {
    return getStreamShowById(stringId);
  }, [stringId]);

  const isStreamShow = isCartoon || type === 'stream' || !!streamShow;
  const streamData = useMemo(() => {
    if (streamShow) return streamShow;
    if (isCartoon) return getCartoonById(stringId);
    return null;
  }, [streamShow, isCartoon, stringId]);
  
  const inMyList = watchlist.some(w => String(w.id) === stringId);
  const dominantColor = getDominantColor(stringId);

  // Selected Season index & modal state
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [seasonModalVisible, setSeasonModalVisible] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<any>(null);

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

  // 2. If it's TMDB content, fetch details
  const { data: tmdbData, isLoading: tmdbLoading } = useQuery({
    queryKey: ['detail', type, id],
    queryFn: () => tmdbAPI.getDetails(id as string, type as 'movie' | 'tv'),
    enabled: !isStreamShow
  });

  const data = isStreamShow ? {
    title: streamData?.title,
    name: streamData?.name,
    backdrop_path: streamData?.backdropUrl,
    poster_path: streamData?.posterUrl,
    overview: streamData?.overview,
    release_date: streamData?.releaseDate,
    vote_average: streamData?.voteAverage,
    runtime: null,
    videos: {
      results: streamData?.seasons?.[0]?.episodes?.[0]?.youtubeId ? [
        {
          site: 'YouTube',
          type: 'Trailer',
          key: streamData.seasons[0].episodes[0].youtubeId
        }
      ] : []
    },
    credits: { cast: [] },
    similar: { results: [] }
  } : tmdbData;

  const isLoading = isStreamShow ? !streamData : tmdbLoading;

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

  // We ONLY show seasons & episodes for stream shows that have actual playable YouTube episodes!
  // Subscription platform series (Netflix, Disney+, etc.) will not display unplayable episode lists.
  const hasSeasons = isStreamShow && (streamData?.seasons?.length ?? 0) > 0;
  const seasonsList = hasSeasons ? (streamData?.seasons || []) : [];
  const currentEpisodes = hasSeasons ? (streamData?.seasons?.[selectedSeasonIndex]?.episodes || []) : [];
  const currentSeasonTitle = hasSeasons ? (streamData?.seasons?.[selectedSeasonIndex]?.title || `Season ${selectedSeasonIndex + 1}`) : '';

  // Netflix-style next episode resolver for autoplay
  const nextEpisode = useMemo(() => {
    if (!activeEpisode || !currentEpisodes || currentEpisodes.length === 0) return null;
    const currentIndex = currentEpisodes.findIndex(
      (e: any) => e.id === activeEpisode.id || e.youtubeId === activeEpisode.youtubeId
    );
    if (currentIndex >= 0 && currentIndex < currentEpisodes.length - 1) {
      const next = currentEpisodes[currentIndex + 1];
      return {
        id: next.id,
        episodeNumber: next.episodeNumber || currentIndex + 2,
        title: next.title,
        youtubeId: next.youtubeId,
        overview: next.overview,
        duration: next.duration,
        thumbnail: next.thumbnail || (next.youtubeId ? `https://img.youtube.com/vi/${next.youtubeId}/mqdefault.jpg` : undefined),
      };
    }
    return null;
  }, [activeEpisode, currentEpisodes]);

  const playEpisode = (ep: any) => {
    if (ep?.youtubeId) {
      setActiveEpisode(ep);
      const showTitle = data?.title || data?.name || streamData?.title || 'Show';
      setPlayerModal({
        visible: true,
        videoId: ep.youtubeId,
        title: `${showTitle} - ${ep.title}`,
        subtitle: ep.overview,
      });
    }
  };

  if (isLoading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.red} />
      </View>
    );
  }

  const title = data.title || data.name;
  const releaseYear = (data.release_date || data.first_air_date || streamData?.releaseDate || '').split('-')[0].trim();
  const primaryGenre = (data?.genres && data.genres.length > 0)
    ? data.genres.map((g: any) => g.name).slice(0, 2).join(', ')
    : (isStreamShow ? (streamData?.categoryTitle || 'Series') : '');
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : (isStreamShow ? 'Full Series' : '');
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
  const logoUrl = isStreamShow ? streamData?.logoUrl : (logoObj ? getImageUrl(logoObj.file_path, 'w500') : null);

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
        posterUrl: isStreamShow ? (streamData?.posterUrl || '') : getImageUrl((data as any).poster_path, 'w500')
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
              source={{ uri: isStreamShow ? (data.backdrop_path || data.poster_path) : getImageUrl(data.backdrop_path || data.poster_path, 'original') }}
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
                {Array.from(new Set(
                  isStreamShow 
                    ? ['FREE STREAM', 'FULL HD', streamData?.badge && streamData.badge !== 'FREE STREAM' ? streamData.badge : 'EXCLUSIVE']
                    : (Number(releaseYear) >= 2018 ? ['4K', 'VISION', 'ATMOS'] : ['HD', '5.1'])
                )).map((badge, badgeIdx) => (
                  <View key={`${badge}-${badgeIdx}`} style={styles.badge}>
                    <REDText size={10} weight="bold" color="rgba(255,255,255,0.8)">{badge}</REDText>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <REDButton 
              title={isStreamShow ? "Watch Episode 1" : (trailerId ? "Play Trailer" : (providerName ? `Play on ${providerName}` : "Play Trailer"))} 
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
                if (isStreamShow && streamData?.seasons?.[0]?.episodes?.[0]?.youtubeId) {
                  playEpisode(streamData.seasons[0].episodes[0]);
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

          {/* SEASONS & EPISODES SECTION (100% NETFLIX MOBILE STYLE) */}
          {hasSeasons && (
            <View style={styles.section}>
              {/* Header with Season Selector Dropdown */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <REDText weight="bold" size={20} color="#fff">Episodes</REDText>

                {/* Netflix Season Button (Always Opens Netflix Season Picker) */}
                <Pressable
                  onPress={() => setSeasonModalVisible(true)}
                  style={({ pressed }) => [
                    styles.netflixSeasonBtn,
                    pressed && { opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.18)' }
                  ]}
                >
                  <REDText size={13} weight="bold" color="#fff">
                    {currentSeasonTitle}
                  </REDText>
                  <ChevronDown size={15} color="#fff" style={{ marginLeft: 6 }} />
                </Pressable>
              </View>

              {/* Episodes List */}
              <View style={{ gap: 2 }}>
                {currentEpisodes.map((ep: any, epIdx: number) => {
                  const epNumber = ep.episodeNumber || ep.episode_number || epIdx + 1;
                  const epTitle = ep.title || ep.name || `Episode ${epNumber}`;
                  const thumbUri = ep.thumbnail || ep.thumbnailUrl || (ep.youtubeId ? `https://img.youtube.com/vi/${ep.youtubeId}/mqdefault.jpg` : null) || (ep.still_path ? getImageUrl(ep.still_path, 'w342') : null);

                  return (
                    <Pressable
                      key={ep.id || epIdx}
                      onPress={() => playEpisode(ep)}
                      style={({ pressed }) => [
                        styles.netflixEpisodeRow,
                        pressed && { opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.04)' }
                      ]}
                    >
                      {/* Top Part: Thumbnail + Title + Play Button */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        {/* 16:9 Thumbnail with Play Overlay */}
                        <View style={styles.netflixThumbBox}>
                          {thumbUri ? (
                            <RNImage
                              source={{ uri: thumbUri }}
                              style={styles.netflixThumbImg}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.netflixThumbImg, { backgroundColor: '#1c1f28', justifyContent: 'center', alignItems: 'center' }]}>
                              <Play color="rgba(255,255,255,0.4)" size={20} />
                            </View>
                          )}
                          <View style={styles.netflixThumbPlayOverlay}>
                            <View style={styles.netflixThumbPlayIcon}>
                              <Play fill="#fff" color="#fff" size={13} style={{ marginLeft: 2 }} />
                            </View>
                          </View>
                          {ep.duration && (
                            <View style={styles.netflixDurationBadge}>
                              <REDText size={9} weight="bold" color="#fff">{ep.duration}</REDText>
                            </View>
                          )}
                        </View>

                        {/* Title & Duration */}
                        <View style={{ flex: 1 }}>
                          <REDText size={15} weight="bold" color="#fff" numberOfLines={1}>
                            {epNumber}. {epTitle}
                          </REDText>
                          <REDText size={12} color="rgba(255,255,255,0.5)" style={{ marginTop: 4 }}>
                            {ep.duration ? `${ep.duration} • ` : ''}Episode {epNumber}
                          </REDText>
                        </View>

                        {/* Netflix Play Circle Action Button */}
                        <View style={styles.netflixPlayCircleBtn}>
                          <Play fill={THEME.colors.red} color={THEME.colors.red} size={14} style={{ marginLeft: 2 }} />
                        </View>
                      </View>

                      {/* Bottom Part: Synopsis */}
                      {ep.overview ? (
                        <REDText size={13} color="rgba(255,255,255,0.65)" style={{ marginTop: 10, lineHeight: 18 }}>
                          {ep.overview}
                        </REDText>
                      ) : null}
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
                  <RNImage source={{ uri: isStreamShow ? data.backdrop_path : getImageUrl(data.backdrop_path, 'w780') }} style={StyleSheet.absoluteFill} resizeMode="cover" />
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

      {/* Netflix-Style Season Selector Modal */}
      <Modal
        visible={seasonModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSeasonModalVisible(false)}
      >
        <Pressable 
          style={styles.seasonModalBackdrop}
          onPress={() => setSeasonModalVisible(false)}
        >
          <View style={styles.seasonModalContent} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.seasonModalHeader}>
              <View>
                <REDText size={18} weight="bold" color="#fff">
                  Seasons
                </REDText>
                <REDText size={12} color="rgba(255,255,255,0.45)" style={{ marginTop: 2 }}>
                  {title}
                </REDText>
              </View>
              <Pressable 
                onPress={() => setSeasonModalVisible(false)}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.seasonModalCloseIconBtn,
                  pressed && { opacity: 0.7, backgroundColor: 'rgba(255,255,255,0.2)' }
                ]}
              >
                <X size={18} color="#fff" />
              </Pressable>
            </View>

            {/* Season List */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {seasonsList.map((season: any, idx: number) => {
                const isSelected = idx === selectedSeasonIndex;
                const sTitle = season.title || `Season ${season.seasonNumber || idx + 1}`;
                const epCount = season.episodes?.length || 0;

                return (
                  <Pressable
                    key={season.seasonNumber || idx}
                    onPress={() => {
                      setSelectedSeasonIndex(idx);
                      setSeasonModalVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.seasonModalItem,
                      isSelected && styles.seasonModalItemSelected,
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <REDText 
                        size={15} 
                        weight={isSelected ? 'bold' : 'regular'} 
                        color={isSelected ? '#fff' : 'rgba(255,255,255,0.8)'}
                      >
                        {sTitle}
                      </REDText>
                      <REDText size={12} color="rgba(255,255,255,0.4)" style={{ marginTop: 3 }}>
                        {epCount} {epCount === 1 ? 'Episode' : 'Episodes'}
                      </REDText>
                    </View>

                    {isSelected && (
                      <View style={styles.seasonCheckCircle}>
                        <Check size={14} color="#fff" strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Bottom Close Action */}
            <Pressable
              onPress={() => setSeasonModalVisible(false)}
              style={({ pressed }) => [
                styles.seasonModalCloseBtn,
                pressed && { opacity: 0.8 }
              ]}
            >
              <REDText size={14} weight="bold" color="rgba(255,255,255,0.85)">
                Close
              </REDText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* In-App YouTube Player Modal */}
      <YouTubePlayerModal
        visible={playerModal.visible}
        videoId={playerModal.videoId}
        title={playerModal.title}
        subtitle={playerModal.subtitle}
        year={releaseYear}
        genre={primaryGenre}
        onClose={() => setPlayerModal({ visible: false, videoId: null })}
        nextEpisode={nextEpisode}
        onPlayNextEpisode={(next) => playEpisode(next)}
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
  netflixSeasonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  seasonModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  seasonModalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#16181f',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
  },
  seasonModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  seasonModalCloseIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  seasonModalItemSelected: {
    backgroundColor: 'rgba(229, 9, 20, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  seasonCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonModalCloseBtn: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  netflixEpisodeRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  netflixThumbBox: {
    width: 120,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  netflixThumbImg: {
    width: '100%',
    height: '100%',
  },
  netflixThumbPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  netflixThumbPlayIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  netflixDurationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  netflixPlayCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  castImage: { width: 70, height: 70, borderRadius: 35, marginBottom: 8 },
  similarImage: { width: 120, height: 180, borderRadius: 8, marginBottom: 8 }
});
