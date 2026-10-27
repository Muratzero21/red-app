import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { UnifiedHero } from '../../src/components/features/UnifiedHero';
import { ContentRow } from '../../src/components/features/ContentRow';
import { ContinueWatchingRow } from '../../src/components/features/ContinueWatchingRow';
import { tmdbAPI, getImageUrl } from '../../src/services/tmdb';
import { getAllCartoons, getStreamShowsByCategory } from '../../src/constants/streams';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';
import { TopNavBar } from '../../src/components/ui/TopNavBar';
import { CategoriesBar } from '../../src/components/features/CategoriesBar';
import { router } from 'expo-router';

export default function Home() {
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const { data: trending, isLoading: trendingLoading } = useQuery({ queryKey: ['trending'], queryFn: () => tmdbAPI.getTrendingWorldwide() });
  const { data: popularMovies, isLoading: popularMoviesLoading } = useQuery({ queryKey: ['popularMovies'], queryFn: () => tmdbAPI.getPopularMovies() });
  const { data: popularSeries, isLoading: popularSeriesLoading } = useQuery({ queryKey: ['popularSeries'], queryFn: () => tmdbAPI.getPopularSeries() });
  const { data: streamingSeries, isLoading: streamingSeriesLoading } = useQuery({ queryKey: ['streamingSeries'], queryFn: () => tmdbAPI.getStreamingSeries() });
  const { data: topRated, isLoading: topRatedLoading } = useQuery({ queryKey: ['topRated'], queryFn: () => tmdbAPI.getTopRated() });
  const { data: trendingPeople, isLoading: trendingPeopleLoading } = useQuery({ queryKey: ['trendingPeople'], queryFn: () => tmdbAPI.getTrendingPeople() });
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { data: heroMix } = useQuery({ 
    queryKey: ['heroMix', todayStr], 
    queryFn: () => tmdbAPI.getHeroMix(),
    staleTime: 1000 * 60 * 60 * 12
  });

  const kidsList = useMemo(() => {
    return getAllCartoons().map((c) => ({
      id: c.id,
      title: c.title,
      name: c.name,
      posterUrl: c.posterUrl,
      backdropUrl: c.backdropUrl,
      overview: c.overview,
      releaseDate: c.releaseDate,
      voteAverage: c.voteAverage,
      mediaType: 'cartoon' as const,
      logoUrl: c.logoUrl,
    }));
  }, []);

  const turkishClassicsList = useMemo(() => {
    return getStreamShowsByCategory('turkish_classics').map((c) => ({
      id: c.id,
      title: c.title,
      name: c.name,
      posterUrl: c.posterUrl,
      backdropUrl: c.backdropUrl,
      overview: c.overview,
      releaseDate: c.releaseDate,
      voteAverage: c.voteAverage,
      mediaType: 'stream' as const,
      logoUrl: c.logoUrl,
    }));
  }, []);

  const indieWebList = useMemo(() => {
    return getStreamShowsByCategory('indie_web').map((c) => ({
      id: c.id,
      title: c.title,
      name: c.name,
      posterUrl: c.posterUrl,
      backdropUrl: c.backdropUrl,
      overview: c.overview,
      releaseDate: c.releaseDate,
      voteAverage: c.voteAverage,
      mediaType: 'stream' as const,
      logoUrl: c.logoUrl,
    }));
  }, []);

  const mapData = (data: any, logPrefix = '') => {
    if (!data?.results) return [];
    
    // Filter out items missing images
    const validItems = data.results.filter((item: any) => item.poster_path || item.profile_path);

    return validItems.map((item: any, index: number) => {
      const posterUrl = getImageUrl(item.poster_path, 'w500');
      const backdropUrl = getImageUrl(item.backdrop_path, 'original');
      const profileUrl = getImageUrl(item.profile_path, 'w500');
      
      const title = item.title || item.name;
      const mediaType = item.media_type || (item.title ? 'movie' : 'tv');

      return {
        id: item.id.toString(),
        title,
        name: title,
        posterUrl,
        profileUrl,
        backdropUrl,
        overview: item.overview,
        releaseDate: item.release_date || item.first_air_date,
        voteAverage: item.vote_average,
        mediaType,
        logoUrl: item.logoUrl
      };
    });
  };

  const trendingList = mapData(trending, 'TRENDING');
  const moviesList = mapData(popularMovies, 'MOVIE');
  const seriesList = mapData(popularSeries, 'TV');
  const streamingList = mapData(streamingSeries, 'TV');
  const topRatedList = mapData(topRated);
  const peopleList = mapData(trendingPeople);
  
  const heroList = mapData(heroMix, 'HERO_MIX');

  const [heroIndex, setHeroIndex] = useState(0);

  const heroItems = useMemo(() => {
    const valid = heroList.filter((item: any) => item.backdropUrl);
    if (valid.length === 0) return [];

    // Daily deterministic rotation so lead spotlight changes every 24 hours
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const offset = dayOfYear % valid.length;
    const rotated = [...valid.slice(offset), ...valid.slice(0, offset)].slice(0, 10);

    // Feature top animation in the Hero bar rotation
    if (kidsList.length > 0) {
      rotated.splice(2, 0, kidsList[0] as any);
    }

    return rotated;
  }, [heroList, kidsList]);

  const heroItem = heroItems[heroIndex] || null;

  useEffect(() => {
    if (heroItems.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroItems.length]);

  const { data: heroDetail } = useQuery({
    queryKey: ['heroDetail', heroItem?.id, heroItem?.mediaType],
    queryFn: () => (heroItem && heroItem.mediaType !== 'cartoon') ? tmdbAPI.getDetails(heroItem.id, heroItem.mediaType as any) : null,
    enabled: !!heroItem && heroItem.mediaType !== 'cartoon'
  });

  const logos = heroDetail?.images?.logos;
  const logoObj = logos?.find((l: any) => l.iso_639_1 === 'en') || logos?.[0];
  const heroLogoUrl = heroItem?.logoUrl || (logoObj ? getImageUrl(logoObj.file_path, 'w780') : undefined);

  let heroTrailerId = undefined;
  if (heroItem?.mediaType === 'cartoon') {
    const cartoon = getAllCartoons().find(c => c.id === heroItem.id);
    heroTrailerId = cartoon?.seasons?.[0]?.episodes?.[0]?.youtubeId || 'TpaoJCQxF1M';
  } else if (heroDetail?.videos?.results) {
    const ytVideos = heroDetail.videos.results.filter((v: any) => v.site === 'YouTube');
    const trailer = ytVideos.find((v: any) => v.type === 'Trailer') || ytVideos[0];
    if (trailer) {
      heroTrailerId = trailer.key;
    }
  }

  if (trendingLoading || popularMoviesLoading || popularSeriesLoading || topRatedLoading || trendingPeopleLoading) {
    return (
      <View style={styles.container}>
        <TopNavBar scrollY={scrollY} />
        <View style={{ width: '100%', height: '75%', backgroundColor: '#11131a' }} />
      </View>
    );
  }

  const navigateToDetail = (id: string, mediaType: string) => {
    router.push(`/detail/${mediaType}/${id}`);
  };

  return (
    <View style={styles.container}>
      <TopNavBar scrollY={scrollY} />
      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {heroItem && (
          <UnifiedHero 
            scrollY={scrollY}
            id={heroItem.id}
            type={heroItem.mediaType}
            title={heroItem.title}
            metadata={`${heroItem.releaseDate?.split('-')[0] || ''} • ${heroItem.mediaType === 'cartoon' ? 'Animation' : (heroItem.mediaType === 'movie' ? 'Movie' : 'Series')}`}
            rating={heroItem.voteAverage}
            description={heroItem.overview}
            imageUrl={heroItem.backdropUrl || heroItem.posterUrl}
            logoUrl={heroLogoUrl}
            trailerId={heroTrailerId}
          />
        )}
        
        <View style={styles.rowsContainer}>
          {/* Netflix Continue Watching Row (Right Below Hero) */}
          <ContinueWatchingRow
            onResumePress={(item) =>
              router.push(`/detail/${item.mediaType}/${item.showId}?autoResume=1`)
            }
            onInfoPress={(item) =>
              router.push(`/detail/${item.mediaType}/${item.showId}`)
            }
          />

          <ContentRow title="Trending Now" data={trendingList.slice(1)} onItemPress={(id) => navigateToDetail(id, trendingList.find((i: any) => i.id === id)?.mediaType || 'movie')} />

          {/* Kids & Animation Row */}
          <ContentRow 
            title="Kids & Animation" 
            data={kidsList} 
            onItemPress={(id) => navigateToDetail(id, 'cartoon')} 
          />

          {/* Turkish Series Row */}
          <ContentRow 
            title="Turkish Series" 
            data={turkishClassicsList} 
            onItemPress={(id) => navigateToDetail(id, 'stream')} 
          />

          {/* Viral Web Series */}
          <ContentRow 
            title="Viral Web Series" 
            data={indieWebList} 
            onItemPress={(id) => navigateToDetail(id, 'stream')} 
          />

          <ContentRow title="Popular Movies" data={moviesList} onItemPress={(id) => navigateToDetail(id, 'movie')} />
          <ContentRow title="Popular Series" data={seriesList} onItemPress={(id) => navigateToDetail(id, 'tv')} />
          <ContentRow title="Premium TV Shows" data={streamingList} onItemPress={(id) => navigateToDetail(id, 'tv')} />
          <ContentRow title="Because You Watched..." data={moviesList.slice(5).concat(moviesList.slice(0, 5))} onItemPress={(id) => navigateToDetail(id, 'movie')} />
          <ContentRow title="Top Rated" data={topRatedList} onItemPress={(id) => navigateToDetail(id, 'movie')} />
          <ContentRow title="More Like This" data={trendingList.slice(5).concat(trendingList.slice(0, 5))} onItemPress={(id) => navigateToDetail(id, trendingList.find((i: any) => i.id === id)?.mediaType || 'movie')} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // padding for bottom tabs
  },
  rowsContainer: {
    paddingTop: 0, 
    marginTop: -32, // Pull the rows up to overlap the hero gradient like Netflix
    zIndex: 10,
    backgroundColor: THEME.colors.background,
  }
});
