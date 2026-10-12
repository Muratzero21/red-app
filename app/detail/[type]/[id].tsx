import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Image as RNImage, Linking, Pressable, Alert, Share } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { ChevronLeft, Play, Plus, Download, Check, MessageSquare, Star, Share2 } from 'lucide-react-native';
import { tmdbAPI, getImageUrl } from '../../../src/services/tmdb';
import { THEME } from '../../../src/constants/theme';
import { REDText } from '../../../src/components/ui/REDText';
import { REDButton } from '../../../src/components/ui/REDButton';
import YoutubePlayer from "react-native-youtube-iframe";

import { useWatchlistStore } from '../../../src/store/useWatchlistStore';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.55;

// Pseudo-random tint color based on TMDB ID
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
  const inMyList = watchlist.some(w => String(w.id) === stringId);
  const dominantColor = getDominantColor(stringId);

  const { data, isLoading } = useQuery({
    queryKey: ['detail', type, id],
    queryFn: () => tmdbAPI.getDetails(id as string, type as 'movie' | 'tv')
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
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : '';
  const metadata = [releaseYear, runtime].filter(Boolean).join(' • ');

  let trailerId = null;
  if (data?.videos?.results) {
    const ytVideos = data.videos.results.filter((v: any) => v.site === 'YouTube');
    const trailer = ytVideos.find((v: any) => v.type === 'Trailer') || ytVideos[0];
    if (trailer) {
      trailerId = trailer.key;
    }
  }

  const logos = data?.images?.logos;
  const logoObj = logos?.find((l: any) => l.iso_639_1 === 'en') || logos?.[0];
  const logoUrl = logoObj ? getImageUrl(logoObj.file_path, 'w500') : null;

  const watchProviders = data?.['watch/providers']?.results?.TR || data?.['watch/providers']?.results?.US;
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
        posterUrl: getImageUrl(data.poster_path, 'w500')
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
              source={{ uri: getImageUrl(data.backdrop_path || data.poster_path, 'original') }}
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
              <REDText weight="bold" size={36} style={{ marginBottom: 12 }}>{title}</REDText>
            )}
            
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <REDText color={THEME.colors.textSecondary} size={15} weight="semibold">{metadata}</REDText>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(Number(releaseYear) >= 2018 ? ['4K', 'VISION', 'ATMOS'] : ['HD', '5.1']).map((badge) => (
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
              title={providerName ? `Play on ${providerName}` : "Play Trailer"} 
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
                if (providerName) {
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
                } else if (trailerId) {
                  Linking.openURL(`vnd.youtube://${trailerId}`).catch(() => {
                    Linking.openURL(`https://www.youtube.com/watch?v=${trailerId}`);
                  });
                } else {
                  Alert.alert("Play Not Available", "There are no streaming providers or trailers available for this title.");
                }
              }}
            />
            <Pressable 
              onPress={handleToggleList}
              style={({ pressed }) => [
                styles.watchlistButton, 
                inMyList && { backgroundColor: 'rgba(229, 9, 20, 0.2)', borderColor: THEME.colors.red },
                pressed && { opacity: 0.7 }
              ]}
            >
              {inMyList ? <Check color={THEME.colors.red} size={20} /> : <Plus color="#fff" size={20} />}
              <REDText size={14} weight="bold" color={inMyList ? THEME.colors.red : '#fff'} style={{ marginLeft: 6 }}>
                {inMyList ? 'In My RED' : 'My RED'}
              </REDText>
            </Pressable>
          </View>

          <REDText color="rgba(255,255,255,0.7)" size={15} style={{ lineHeight: 24, marginBottom: 32 }}>
            {data.overview}
          </REDText>

          {/* Official Poster */}
        {data.poster_path && (
          <View style={styles.section}>
            <REDText weight="bold" size={18} style={styles.sectionTitle}>Official Poster</REDText>
            <Pressable 
              onPress={() => Linking.openURL(getImageUrl(data.poster_path, 'original'))}
              style={({ pressed }) => [{ width: 140, height: 210, borderRadius: 12, overflow: 'hidden' }, pressed && { opacity: 0.8 }]}
            >
              <RNImage source={{ uri: getImageUrl(data.poster_path, 'w500') }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }]}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                  <Download color="#fff" size={20} />
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* RED Community Reviews */}
        {data?.reviews?.results && data.reviews.results.length > 0 && (
          <View style={{ marginTop: 24, marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <REDText weight="bold" size={18} color="#fff">RED Community</REDText>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                <MessageSquare color="#fff" size={14} style={{ marginRight: 6 }} />
                <REDText size={13} weight="semibold">Write Review</REDText>
              </Pressable>
            </View>

            {data.reviews.results.slice(0, 3).map((review: any) => {
              const avatarPath = review.author_details?.avatar_path;
              let avatar = `https://i.pravatar.cc/100?u=${review.author}`;
              if (avatarPath) {
                if (avatarPath.startsWith('/http')) {
                  avatar = avatarPath.slice(1);
                } else {
                  avatar = getImageUrl(avatarPath, 'w185');
                }
              }
              
              const rating = review.author_details?.rating ? Math.round(review.author_details.rating / 2) : null;
              const date = new Date(review.created_at).toLocaleDateString('tr-TR');

              return (
                <View key={review.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <RNImage source={{ uri: avatar }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#333' }} />
                    <View style={{ flex: 1 }}>
                      <REDText weight="bold" size={14} color="#fff">{review.author}</REDText>
                      <REDText size={12} color="rgba(255,255,255,0.5)">{date}</REDText>
                    </View>
                    {rating !== null && (
                      <View style={{ flexDirection: 'row' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} color={i < rating ? THEME.colors.red : 'rgba(255,255,255,0.2)'} fill={i < rating ? THEME.colors.red : 'transparent'} size={14} style={{ marginLeft: 2 }} />
                        ))}
                      </View>
                    )}
                  </View>
                  <REDText size={14} color="rgba(255,255,255,0.8)" style={{ lineHeight: 22 }} numberOfLines={6}>
                    {review.content}
                  </REDText>
                </View>
              );
            })}
          </View>
        )}

        {/* Cast */}
          {data?.credits?.cast && data.credits.cast.length > 0 && (
            <View style={styles.section}>
              <REDText weight="bold" size={18} style={styles.sectionTitle}>Cast</REDText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24, gap: 16 }}>
                {data.credits.cast.slice(0, 10).map((person: any) => (
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

          {/* Trailer */}
          {trailerId && (
            <View style={styles.section}>
              <REDText weight="bold" size={18} style={styles.sectionTitle}>Trailer</REDText>
              <View style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
                <YoutubePlayer height={220} play={false} videoId={trailerId} initialPlayerParams={{ controls: true, modestbranding: true, rel: false }} />
              </View>
            </View>
          )}

          {/* More Like This */}
          {data?.similar?.results && data.similar.results.length > 0 && (
            <View style={styles.section}>
              <REDText weight="bold" size={18} style={styles.sectionTitle}>More Like This</REDText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24, gap: 12 }}>
                {data.similar.results.slice(0, 10).map((similarItem: any) => (
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
  iconButton: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center' },
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
  castImage: { width: 70, height: 70, borderRadius: 35, marginBottom: 8 },
  similarImage: { width: 120, height: 180, borderRadius: 8, marginBottom: 8 }
});
