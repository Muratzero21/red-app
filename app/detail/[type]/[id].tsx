import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Image as RNImage, Linking, Pressable, Alert, Share, Modal } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { ChevronLeft, Play, Plus, Download, Check, MessageSquare, Star, Share2, ChevronDown, X, ThumbsUp } from 'lucide-react-native';
import { tmdbAPI, getImageUrl } from '../../../src/services/tmdb';
import { getStreamShowById, getCartoonById } from '../../../src/constants/streams';
import { THEME } from '../../../src/constants/theme';
import { REDText } from '../../../src/components/ui/REDText';
import { REDButton } from '../../../src/components/ui/REDButton';
import { YouTubePlayerModal } from '../../../src/components/ui/YouTubePlayerModal';
import { useWatchlistStore } from '../../../src/store/useWatchlistStore';
import { useWatchProgressStore } from '../../../src/store/useWatchProgressStore';

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
  const { type, id, autoResume } = useLocalSearchParams();
  const scrollY = useSharedValue(0);
  
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const continueWatching = useWatchProgressStore(state => state.continueWatching);
  const episodeProgressMap = useWatchProgressStore(state => state.episodeProgress);
  const saveProgress = useWatchProgressStore(state => state.saveProgress);

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

  const canonicalShowId = streamData?.id || stringId;
  const savedShowProgress = useMemo(() => {
    return continueWatching.find(
      (item) => String(item.showId) === String(canonicalShowId) || String(item.showId) === String(stringId)
    );
  }, [continueWatching, canonicalShowId, stringId]);
  
  const inMyList = watchlist.some(w => String(w.id) === stringId);
  const dominantColor = getDominantColor(stringId);

  // Selected Season index & modal state
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [seasonModalVisible, setSeasonModalVisible] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<any>(null);
  const hasSyncedSavedSeason = useRef(false);
  const hasAutoResumed = useRef(false);

  // In-App YouTube Player state
  const [playerModal, setPlayerModal] = useState<{
    visible: boolean;
    videoId: string | null;
    title?: string;
    subtitle?: string;
    initialStartSeconds?: number;
  }>({
    visible: false,
    videoId: null,
  });

  // 2. Fetch TMDB details (both for regular TMDB items AND for stream shows that have a tmdbId so we can pull all real seasons/cast/similar)
  const targetTmdbId = isStreamShow ? (streamData?.tmdbId ? String(streamData.tmdbId) : null) : (id as string);
  const targetTmdbType = isStreamShow ? 'tv' : (type as 'movie' | 'tv');

  const { data: tmdbData, isLoading: tmdbLoading } = useQuery({
    queryKey: ['detail', targetTmdbType, targetTmdbId],
    queryFn: () => tmdbAPI.getDetails(targetTmdbId!, targetTmdbType),
    enabled: !!targetTmdbId,
  });

  const data = isStreamShow ? {
    title: streamData?.title || tmdbData?.title || tmdbData?.name,
    name: streamData?.name || tmdbData?.name || tmdbData?.title,
    backdrop_path: streamData?.backdropUrl || tmdbData?.backdrop_path,
    poster_path: streamData?.posterUrl || tmdbData?.poster_path,
    overview: streamData?.overview || tmdbData?.overview,
    release_date: streamData?.releaseDate || tmdbData?.first_air_date,
    vote_average: streamData?.voteAverage || tmdbData?.vote_average,
    runtime: null,
    videos: {
      results: streamData?.seasons?.[0]?.episodes?.[0]?.youtubeId ? [
        {
          site: 'YouTube',
          type: 'Trailer',
          key: streamData.seasons[0].episodes[0].youtubeId
        }
      ] : (tmdbData?.videos?.results || [])
    },
    credits: tmdbData?.credits || { cast: [] },
    similar: tmdbData?.similar || { results: [] }
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

  // Build complete seasons list: merge all real seasons from TMDB (if available) with local streamData seasons
  const seasonsList = useMemo(() => {
    if (!hasSeasons) return [];
    const localSeasons = streamData?.seasons || [];
    const tmdbRawSeasons = (tmdbData as any)?.seasons;
    if (Array.isArray(tmdbRawSeasons)) {
      const validTmdbSeasons = tmdbRawSeasons.filter(
        (s: any) => s.season_number > 0 && s.episode_count > 0
      );
      if (validTmdbSeasons.length > 0) {
        return validTmdbSeasons.map((ts: any) => {
          const matchedLocal = localSeasons.find(
            (ls: any) => ls.seasonNumber === ts.season_number
          );
          return {
            seasonNumber: ts.season_number,
            title: matchedLocal?.title || ts.name || `Season ${ts.season_number}`,
            episodeCount: ts.episode_count,
            episodes: matchedLocal?.episodes || [],
          };
        });
      }
    }
    return localSeasons.map((ls: any) => ({
      ...ls,
      episodeCount: ls.episodes?.length || 0,
    }));
  }, [hasSeasons, streamData, tmdbData]);

  const selectedSeasonNumber = useMemo(() => {
    if (!hasSeasons || seasonsList.length === 0) return 1;
    const s = seasonsList[selectedSeasonIndex] || seasonsList[0];
    return s?.seasonNumber || selectedSeasonIndex + 1;
  }, [hasSeasons, seasonsList, selectedSeasonIndex]);

  // Fetch ALL episodes of the currently selected season from TMDB so not a single episode is missing
  const { data: tmdbSeasonData, isFetching: seasonEpisodesLoading } = useQuery({
    queryKey: ['seasonDetail', streamData?.tmdbId, selectedSeasonNumber],
    queryFn: () => tmdbAPI.getSeasonDetails(streamData!.tmdbId!, selectedSeasonNumber),
    enabled: hasSeasons && !!streamData?.tmdbId && !!selectedSeasonNumber,
  });

  // Resolve full episode list for the selected season (100% of episodes in that season)
  const currentEpisodes = useMemo(() => {
    if (!hasSeasons) return [];
    const localSeasons = streamData?.seasons || [];
    const matchedLocalSeason =
      localSeasons.find((s: any) => s.seasonNumber === selectedSeasonNumber) ||
      localSeasons[selectedSeasonIndex] ||
      localSeasons[0];
    const localSeasonEpisodes = matchedLocalSeason?.episodes || [];
    const allShowEpisodes = localSeasons.flatMap((s: any) => s.episodes || []);

    const tmdbEpisodes = tmdbSeasonData?.episodes;
    if (Array.isArray(tmdbEpisodes) && tmdbEpisodes.length > 0) {
      return tmdbEpisodes.map((tmdbEp: any, idx: number) => {
        const epNum = tmdbEp.episode_number || idx + 1;
        const exactLocal = localSeasonEpisodes.find(
          (e: any) => e.episodeNumber === epNum
        );
        const fallbackLocal =
          exactLocal ||
          (localSeasonEpisodes.length > 0
            ? localSeasonEpisodes[idx % localSeasonEpisodes.length]
            : allShowEpisodes[idx % Math.max(1, allShowEpisodes.length)]);

        return {
          id: `${streamData?.id || stringId}-s${selectedSeasonNumber}-e${epNum}`,
          episodeNumber: epNum,
          title: tmdbEp.name || exactLocal?.title || `Episode ${epNum}`,
          duration: tmdbEp.runtime
            ? `${tmdbEp.runtime}m`
            : exactLocal?.duration || fallbackLocal?.duration || '22m',
          thumbnail: tmdbEp.still_path
            ? getImageUrl(tmdbEp.still_path, 'w500')
            : exactLocal?.thumbnail ||
              (fallbackLocal?.youtubeId
                ? `https://img.youtube.com/vi/${fallbackLocal.youtubeId}/mqdefault.jpg`
                : streamData?.backdropUrl),
          youtubeId: fallbackLocal?.youtubeId,
          source_type: 'youtube',
          overview:
            tmdbEp.overview ||
            exactLocal?.overview ||
            fallbackLocal?.overview ||
            streamData?.overview ||
            '',
        };
      });
    }

    return localSeasonEpisodes;
  }, [hasSeasons, streamData, selectedSeasonNumber, selectedSeasonIndex, tmdbSeasonData, stringId]);

  const currentSeasonTitle = hasSeasons
    ? seasonsList[selectedSeasonIndex]?.title || `Season ${selectedSeasonNumber}`
    : '';

  const currentSeasonPillLabel = useMemo(() => {
    if (!hasSeasons || seasonsList.length === 0) return 'Season 1';
    return `Season ${selectedSeasonNumber}`;
  }, [hasSeasons, seasonsList, selectedSeasonNumber]);

  // Netflix-style next episode resolver for autoplay
  const nextEpisode = useMemo(() => {
    if (!activeEpisode || !currentEpisodes || currentEpisodes.length === 0) return null;
    const currentIndex = currentEpisodes.findIndex(
      (e: any) =>
        e.id === activeEpisode.id ||
        (e.episodeNumber && e.episodeNumber === activeEpisode.episodeNumber)
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

  // Automatically switch to the season where the user left off on initial load
  useEffect(() => {
    if (!hasSyncedSavedSeason.current && savedShowProgress && seasonsList.length > 0) {
      const targetIdx = seasonsList.findIndex(
        (s: any, idx: number) => (s.seasonNumber || idx + 1) === savedShowProgress.seasonNumber
      );
      if (targetIdx >= 0) {
        setSelectedSeasonIndex(targetIdx);
      }
      hasSyncedSavedSeason.current = true;
    }
  }, [savedShowProgress, seasonsList]);

  // Parse minutes string like "22m" or "75m" into seconds
  const parseDurationSeconds = (durStr?: string) => {
    if (!durStr) return 1320;
    const match = String(durStr).match(/(\d+)/);
    return match ? parseInt(match[1], 10) * 60 : 1320;
  };

  const playEpisode = useCallback((ep: any, explicitSeasonNumber?: number, startSec?: number) => {
    if (ep?.youtubeId) {
      const sNum = explicitSeasonNumber || selectedSeasonNumber || 1;
      const epNum = ep.episodeNumber || ep.episode_number || 1;
      const epKey = `${String(canonicalShowId)}:S${sNum}:E${epNum}`;
      const existingEpProg = episodeProgressMap[epKey];
      const resumeAt = startSec !== undefined ? startSec : (existingEpProg?.currentTime || 0);
      const estDuration = existingEpProg?.duration || parseDurationSeconds(ep.duration);

      const enrichedEp = {
        ...ep,
        seasonNumber: sNum,
        episodeNumber: epNum,
      };
      setActiveEpisode(enrichedEp);

      const showTitle = data?.title || data?.name || streamData?.title || 'Show';
      const epTitle = ep.title || ep.name || `Episode ${epNum}`;
      const thumbUri =
        ep.thumbnail ||
        ep.thumbnailUrl ||
        (ep.youtubeId ? `https://img.youtube.com/vi/${ep.youtubeId}/mqdefault.jpg` : undefined) ||
        streamData?.backdropUrl;

      // Save immediately so it registers in Continue Watching right away
      saveProgress({
        showId: String(canonicalShowId),
        showTitle,
        mediaType: (isCartoon ? 'cartoon' : isStreamShow ? 'stream' : (type as any)) || 'stream',
        posterUrl: isStreamShow ? (streamData?.posterUrl || '') : getImageUrl((data as any)?.poster_path, 'w500'),
        backdropUrl: isStreamShow ? (streamData?.backdropUrl || '') : getImageUrl((data as any)?.backdrop_path, 'w780'),
        seasonNumber: sNum,
        episodeNumber: epNum,
        episodeId: ep.id || `${canonicalShowId}-s${sNum}-e${epNum}`,
        episodeTitle: epTitle,
        youtubeId: ep.youtubeId,
        thumbnail: thumbUri,
        overview: ep.overview,
        currentTime: resumeAt > 5 ? resumeAt : Math.max(60, Math.round(estDuration * 0.08)),
        duration: estDuration,
      });

      setPlayerModal({
        visible: true,
        videoId: ep.youtubeId,
        title: `${showTitle} - S${sNum}:E${epNum} ${epTitle}`,
        subtitle: ep.overview,
        initialStartSeconds: resumeAt > 5 ? resumeAt : undefined,
      });
    }
  }, [
    selectedSeasonNumber,
    canonicalShowId,
    episodeProgressMap,
    data,
    streamData,
    saveProgress,
    isCartoon,
    isStreamShow,
    type,
  ]);

  // Support ?autoResume=1 when tapped from the Home Continue Watching row
  useEffect(() => {
    if (autoResume === '1' && !hasAutoResumed.current && savedShowProgress) {
      hasAutoResumed.current = true;
      playEpisode(
        {
          id: savedShowProgress.episodeId,
          episodeNumber: savedShowProgress.episodeNumber,
          title: savedShowProgress.episodeTitle,
          youtubeId: savedShowProgress.youtubeId,
          thumbnail: savedShowProgress.thumbnail,
          overview: savedShowProgress.overview,
          duration: `${Math.round((savedShowProgress.duration || 1320) / 60)}m`,
        },
        savedShowProgress.seasonNumber,
        savedShowProgress.currentTime
      );
    }
  }, [autoResume, savedShowProgress, playEpisode]);

  const handlePlayerProgressUpdate = useCallback((currentTime: number, duration: number) => {
    if (!activeEpisode || !isStreamShow) return;
    const sNum = activeEpisode.seasonNumber || selectedSeasonNumber || 1;
    const epNum = activeEpisode.episodeNumber || activeEpisode.episode_number || 1;
    const showTitle = data?.title || data?.name || streamData?.title || 'Show';
    const epTitle = activeEpisode.title || activeEpisode.name || `Episode ${epNum}`;
    const thumbUri =
      activeEpisode.thumbnail ||
      activeEpisode.thumbnailUrl ||
      (activeEpisode.youtubeId ? `https://img.youtube.com/vi/${activeEpisode.youtubeId}/mqdefault.jpg` : undefined) ||
      streamData?.backdropUrl;

    saveProgress({
      showId: String(canonicalShowId),
      showTitle,
      mediaType: (isCartoon ? 'cartoon' : 'stream'),
      posterUrl: streamData?.posterUrl || '',
      backdropUrl: streamData?.backdropUrl || '',
      seasonNumber: sNum,
      episodeNumber: epNum,
      episodeId: activeEpisode.id || `${canonicalShowId}-s${sNum}-e${epNum}`,
      episodeTitle: epTitle,
      youtubeId: activeEpisode.youtubeId,
      thumbnail: thumbUri,
      overview: activeEpisode.overview,
      currentTime,
      duration: duration > 0 ? duration : parseDurationSeconds(activeEpisode.duration),
    });
  }, [activeEpisode, isStreamShow, selectedSeasonNumber, data, streamData, saveProgress, canonicalShowId, isCartoon]);

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
                    ? ['TR Dublaj / Altyazı', '7+', 'FULL HD', streamData?.badge && streamData.badge !== 'FREE STREAM' ? streamData.badge : 'FREE STREAM']
                    : ['TR Dublaj / Altyazı', '7+', ...(Number(releaseYear) >= 2018 ? ['4K', 'HD'] : ['HD'])]
                )).map((badge, badgeIdx) => (
                  <View key={`${badge}-${badgeIdx}`} style={styles.badge}>
                    <REDText size={10} weight="bold" color="rgba(255,255,255,0.8)">{badge}</REDText>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View style={[styles.actionsRow, savedShowProgress && isStreamShow ? { marginBottom: 12 } : null]}>
            <REDButton 
              title={
                isStreamShow
                  ? (savedShowProgress
                      ? `Resume S${savedShowProgress.seasonNumber}:E${savedShowProgress.episodeNumber}`
                      : "Watch Episode 1")
                  : (trailerId ? "Play Trailer" : (providerName ? `Play on ${providerName}` : "Play Trailer"))
              } 
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
                if (isStreamShow && savedShowProgress?.youtubeId) {
                  playEpisode(
                    {
                      id: savedShowProgress.episodeId,
                      episodeNumber: savedShowProgress.episodeNumber,
                      title: savedShowProgress.episodeTitle,
                      youtubeId: savedShowProgress.youtubeId,
                      thumbnail: savedShowProgress.thumbnail,
                      overview: savedShowProgress.overview,
                      duration: `${Math.round((savedShowProgress.duration || 1320) / 60)}m`,
                    },
                    savedShowProgress.seasonNumber,
                    savedShowProgress.currentTime
                  );
                } else if (isStreamShow && (currentEpisodes?.[0]?.youtubeId || streamData?.seasons?.[0]?.episodes?.[0]?.youtubeId)) {
                  playEpisode(currentEpisodes?.[0] || streamData?.seasons?.[0]?.episodes?.[0], selectedSeasonNumber, 0);
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

          {/* Netflix Resume Progress Strip under CTA button when show has saved progress */}
          {isStreamShow && savedShowProgress && (
            <View style={styles.resumeStatusContainer}>
              <View style={styles.resumeProgressTrack}>
                <View
                  style={[
                    styles.resumeProgressFill,
                    { width: `${Math.round(Math.max(6, Math.min(98, (savedShowProgress.progress || 0.12) * 100)))}%` },
                  ]}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <REDText size={12} weight="semibold" color="rgba(255,255,255,0.85)" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
                  S{savedShowProgress.seasonNumber}:E{savedShowProgress.episodeNumber} &quot;{savedShowProgress.episodeTitle}&quot;
                </REDText>
                <REDText size={12} weight="bold" color="rgba(255,255,255,0.55)">
                  {savedShowProgress.remainingMinutes}m left
                </REDText>
              </View>
            </View>
          )}

          {/* Synopsis */}
          <View style={{ marginBottom: 16 }}>
            <REDText size={15} color="rgba(255,255,255,0.8)" style={{ lineHeight: 24 }}>
              {data.overview || "No overview available."}
            </REDText>
          </View>

          {/* Horizontal Action Bar: + Listem | Beğen | Paylaş */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <Pressable
              onPress={handleToggleList}
              style={({ pressed }) => [
                {
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  paddingVertical: 11,
                  borderRadius: 10,
                  backgroundColor: inMyList ? 'rgba(229, 9, 20, 0.14)' : 'rgba(255, 255, 255, 0.06)',
                  borderWidth: 1,
                  borderColor: inMyList ? 'rgba(229, 9, 20, 0.45)' : 'rgba(255, 255, 255, 0.1)',
                },
                pressed && { opacity: 0.75 },
              ]}
            >
              {inMyList ? (
                <Check size={17} color={THEME.colors.red} />
              ) : (
                <Plus size={17} color="#fff" />
              )}
              <REDText size={12.5} weight="semibold" color={inMyList ? THEME.colors.red : '#fff'}>
                {inMyList ? 'Listemde' : '+ Listem'}
              </REDText>
            </Pressable>

            <Pressable
              onPress={() => setLiked((prev) => !prev)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  paddingVertical: 11,
                  borderRadius: 10,
                  backgroundColor: liked ? 'rgba(229, 9, 20, 0.14)' : 'rgba(255, 255, 255, 0.06)',
                  borderWidth: 1,
                  borderColor: liked ? 'rgba(229, 9, 20, 0.45)' : 'rgba(255, 255, 255, 0.1)',
                },
                pressed && { opacity: 0.75 },
              ]}
            >
              <ThumbsUp
                size={16}
                color={liked ? THEME.colors.red : '#fff'}
                fill={liked ? THEME.colors.red : 'none'}
              />
              <REDText size={12.5} weight="semibold" color={liked ? THEME.colors.red : '#fff'}>
                Beğen
              </REDText>
            </Pressable>

            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                {
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  paddingVertical: 11,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Share2 size={16} color="#fff" />
              <REDText size={12.5} weight="semibold" color="#fff">
                Paylaş
              </REDText>
            </Pressable>
          </View>

          {/* SEASONS & EPISODES SECTION (100% NETFLIX MOBILE STYLE) */}
          {hasSeasons && (
            <View style={styles.section}>
              {/* Header with Season Selector Dropdown */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <REDText weight="bold" size={20} color="#fff">
                    Episodes {currentEpisodes.length > 0 ? `(${currentEpisodes.length})` : ''}
                  </REDText>
                  {seasonEpisodesLoading && (
                    <ActivityIndicator size="small" color={THEME.colors.red} />
                  )}
                </View>

                {/* Netflix Season Pill Button: Only visible if seasons.length > 1 */}
                {seasonsList.length > 1 && (
                  <Pressable
                    onPress={() => setSeasonModalVisible(true)}
                    style={({ pressed }) => [
                      styles.netflixSeasonPillBtn,
                      pressed && { opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.2)' }
                    ]}
                  >
                    <REDText size={13} weight="bold" color="#fff">
                      {currentSeasonPillLabel}
                    </REDText>
                    <ChevronDown size={14} color="#fff" style={{ marginLeft: 6 }} />
                  </Pressable>
                )}
              </View>

              {/* Horizontal Season Selector Tabs */}
              {seasonsList.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
                >
                  {seasonsList.map((season: any, idx: number) => {
                    const sNum = season.seasonNumber || idx + 1;
                    const isSelected = idx === selectedSeasonIndex;
                    return (
                      <Pressable
                        key={sNum}
                        onPress={() => setSelectedSeasonIndex(idx)}
                        style={{
                          paddingHorizontal: 15,
                          paddingVertical: 7,
                          borderRadius: 18,
                          backgroundColor: isSelected ? THEME.colors.red : 'rgba(255,255,255,0.06)',
                          borderWidth: 1,
                          borderColor: isSelected ? THEME.colors.red : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <REDText
                          size={12.5}
                          weight={isSelected ? 'bold' : 'medium'}
                          color={isSelected ? '#fff' : 'rgba(255,255,255,0.65)'}
                        >
                          Season {sNum}
                        </REDText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Episodes List */}
              <View style={{ gap: 2 }}>
                {currentEpisodes.map((ep: any, epIdx: number) => {
                  const epNumber = ep.episodeNumber || ep.episode_number || epIdx + 1;
                  const epTitle = ep.title || ep.name || `Episode ${epNumber}`;
                  const thumbUri = ep.thumbnail || ep.thumbnailUrl || (ep.youtubeId ? `https://img.youtube.com/vi/${ep.youtubeId}/mqdefault.jpg` : null) || (ep.still_path ? getImageUrl(ep.still_path, 'w342') : null);
                  const epProgressKey = `${String(canonicalShowId)}:S${selectedSeasonNumber}:E${epNumber}`;
                  const epProgressObj = episodeProgressMap[epProgressKey];
                  const epProgressPct = epProgressObj
                    ? Math.round(Math.max(6, Math.min(98, (epProgressObj.progress || 0.1) * 100)))
                    : 0;
                  const isCurrentlyPausedEp =
                    savedShowProgress &&
                    savedShowProgress.seasonNumber === selectedSeasonNumber &&
                    savedShowProgress.episodeNumber === epNumber;

                  return (
                    <Pressable
                      key={ep.id || epIdx}
                      onPress={() => playEpisode(ep, selectedSeasonNumber)}
                      style={({ pressed }) => [
                        styles.netflixEpisodeRow,
                        isCurrentlyPausedEp && { backgroundColor: 'rgba(229, 9, 20, 0.06)', paddingHorizontal: 8, borderRadius: 10 },
                        pressed && { opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.04)' }
                      ]}
                    >
                      {/* Top Part: Thumbnail + Title + Play Button */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        {/* 16:9 Thumbnail with Play Overlay & Red Progress Bar */}
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
                            <View style={[styles.netflixDurationBadge, epProgressPct > 0 && { bottom: 6 }]}>
                              <REDText size={9} weight="bold" color="#fff">{ep.duration}</REDText>
                            </View>
                          )}
                          {epProgressPct > 0 && (
                            <View style={styles.episodeThumbProgressTrack}>
                              <View style={[styles.episodeThumbProgressFill, { width: `${epProgressPct}%` }]} />
                            </View>
                          )}
                        </View>

                        {/* Title & Duration */}
                        <View style={{ flex: 1 }}>
                          <REDText size={15} weight="bold" color="#fff" numberOfLines={1}>
                            {epNumber}. {epTitle}
                          </REDText>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <REDText size={12} color="rgba(255,255,255,0.5)">
                              {ep.duration ? `${ep.duration} • ` : ''}Episode {epNumber}
                            </REDText>
                            {isCurrentlyPausedEp && (
                              <View style={styles.resumeEpChip}>
                                <REDText size={10} weight="bold" color={THEME.colors.red}>
                                  RESUME • {savedShowProgress.remainingMinutes}m left
                                </REDText>
                              </View>
                            )}
                          </View>
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

                      {/* Full-Width Episode Red Progress Bar under watched episode row */}
                      {epProgressPct > 0 && (
                        <View style={styles.episodeRowProgressTrack}>
                          <View style={[styles.episodeRowProgressFill, { width: `${epProgressPct}%` }]} />
                        </View>
                      )}
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

      {/* Netflix-Style Season Selector Bottom Sheet */}
      <Modal
        visible={seasonModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSeasonModalVisible(false)}
      >
        <Pressable 
          style={styles.bottomSheetBackdrop}
          onPress={() => setSeasonModalVisible(false)}
        >
          <Pressable 
            style={styles.bottomSheetContent} 
            onPress={(e) => e.stopPropagation()}
          >
            {/* Grabber Handle */}
            <View style={styles.bottomSheetHandle} />

            {/* Header */}
            <View style={styles.bottomSheetHeader}>
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
                  styles.bottomSheetCloseIconBtn,
                  pressed && { opacity: 0.7, backgroundColor: 'rgba(255,255,255,0.2)' }
                ]}
              >
                <X size={18} color="#fff" />
              </Pressable>
            </View>

            {/* Season List */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {seasonsList.map((season: any, idx: number) => {
                const isSelected = idx === selectedSeasonIndex;
                const seasonNumber = season.seasonNumber || idx + 1;
                const seasonDisplayName = `Season ${seasonNumber}`;
                const seasonSubtext = season.title && season.title !== seasonDisplayName 
                  ? season.title 
                  : null;
                const epCount = season.episodeCount || season.episode_count || season.episodes?.length || 0;

                return (
                  <Pressable
                    key={season.seasonNumber || idx}
                    onPress={() => {
                      setSelectedSeasonIndex(idx);
                      setSeasonModalVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.bottomSheetSeasonItem,
                      isSelected && styles.bottomSheetSeasonItemSelected,
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <REDText 
                        size={16} 
                        weight={isSelected ? 'bold' : 'medium'} 
                        color={isSelected ? '#fff' : 'rgba(255,255,255,0.8)'}
                      >
                        {seasonDisplayName}
                      </REDText>
                      {seasonSubtext && (
                        <REDText size={12} color="rgba(255,255,255,0.45)" style={{ marginTop: 2 }} numberOfLines={1}>
                          {seasonSubtext}
                        </REDText>
                      )}
                      <REDText size={11} color="rgba(255,255,255,0.35)" style={{ marginTop: 2 }}>
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
                styles.bottomSheetCloseBtn,
                pressed && { opacity: 0.8 }
              ]}
            >
              <REDText size={14} weight="bold" color="rgba(255,255,255,0.85)">
                Close
              </REDText>
            </Pressable>
          </Pressable>
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
        onPlayNextEpisode={(next) => playEpisode(next, selectedSeasonNumber, 0)}
        initialStartSeconds={playerModal.initialStartSeconds}
        onProgressUpdate={handlePlayerProgressUpdate}
        seasons={seasonsList}
        selectedSeasonIndex={selectedSeasonIndex}
        onSelectSeasonIndex={setSelectedSeasonIndex}
        episodes={currentEpisodes}
        episodesLoading={seasonEpisodesLoading}
        activeEpisodeId={activeEpisode?.id}
        onSelectEpisode={(ep) => playEpisode(ep, selectedSeasonNumber, 0)}
        inWatchlist={inMyList}
        onToggleWatchlist={handleToggleList}
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
  resumeStatusContainer: {
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  resumeProgressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  resumeProgressFill: {
    height: '100%',
    backgroundColor: THEME.colors.red,
    borderRadius: 2,
  },
  episodeThumbProgressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  episodeThumbProgressFill: {
    height: '100%',
    backgroundColor: THEME.colors.red,
  },
  episodeRowProgressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginTop: 10,
    overflow: 'hidden',
  },
  episodeRowProgressFill: {
    height: '100%',
    backgroundColor: THEME.colors.red,
    borderRadius: 1.5,
  },
  resumeEpChip: {
    backgroundColor: 'rgba(229, 9, 20, 0.14)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.35)',
  },
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
  netflixSeasonPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    width: '100%',
    backgroundColor: '#16181f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 25,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  bottomSheetCloseIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetSeasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  bottomSheetSeasonItemSelected: {
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
  bottomSheetCloseBtn: {
    marginTop: 14,
    paddingVertical: 13,
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
