import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Search as SearchIcon, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { THEME } from '../src/constants/theme';
import { REDText } from '../src/components/ui/REDText';
import { tmdbAPI, getImageUrl } from '../src/services/tmdb';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function SearchEngine() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => tmdbAPI.searchMulti(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const results = data?.results?.filter((item: any) => 
    (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
  ) || [];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Pressable onPress={() => router.back()} style={({pressed}) => [styles.backBtn, pressed && {opacity: 0.7}]}>
          <ChevronLeft color="#fff" size={28} />
        </Pressable>
        <View style={styles.inputContainer}>
          <SearchIcon color="rgba(255,255,255,0.5)" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Movies, Series, or People..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={query}
            onChangeText={setQuery}
            autoFocus
            cursorColor={THEME.colors.red}
            selectionColor={THEME.colors.red}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <X color="rgba(255,255,255,0.5)" size={20} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={THEME.colors.red} />
          </View>
        ) : debouncedQuery.length > 2 && results.length === 0 ? (
          <Animated.View entering={FadeIn} style={styles.center}>
            <SearchIcon color="rgba(255,255,255,0.1)" size={64} style={{ marginBottom: 16 }} />
            <REDText size={18} color="rgba(255,255,255,0.5)">No results found for "{debouncedQuery}"</REDText>
          </Animated.View>
        ) : debouncedQuery.length <= 2 ? (
          <View style={styles.center}>
            <SearchIcon color="rgba(255,255,255,0.05)" size={80} style={{ marginBottom: 16 }} />
            <REDText size={18} color="rgba(255,255,255,0.2)" weight="bold">Find what to watch next.</REDText>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={({ item }) => (
              <Animated.View entering={FadeIn}>
                <Pressable 
                  style={({pressed}) => [styles.resultCard, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push(`/detail/${item.media_type}/${item.id}`)}
                >
                  <Image 
                    source={{ uri: getImageUrl(item.poster_path, 'w92') }} 
                    style={styles.poster}
                    contentFit="cover"
                  />
                  <View style={styles.resultInfo}>
                    <REDText weight="bold" size={16} numberOfLines={2}>{item.title || item.name}</REDText>
                    <REDText size={13} color={THEME.colors.textSecondary} style={{ marginTop: 4 }}>
                      {item.media_type === 'movie' ? 'Movie' : 'Series'} • {(item.release_date || item.first_air_date || '').split('-')[0]}
                    </REDText>
                  </View>
                  <ChevronLeft color="rgba(255,255,255,0.2)" size={24} style={{ transform: [{ rotate: '180deg' }] }} />
                </Pressable>
              </Animated.View>
            )}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Titillium Web',
  },
  clearBtn: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 12,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#1a1d24',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  }
});
