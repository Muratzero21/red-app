import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Search as SearchIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { REDText } from '../../src/components/ui/REDText';
import { THEME } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' }
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(25, 0, 5, 0.4)', THEME.colors.background]}
        locations={[0, 0.3]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) }]}>
        <REDText weight="bold" size={32}>Discover</REDText>
        <Pressable style={styles.searchIcon}>
          <SearchIcon color="#fff" size={24} />
        </Pressable>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
      >
        <REDText weight="semibold" size={16} color={THEME.colors.textSecondary} style={styles.sectionTitle}>
          Genres
        </REDText>
        
        {GENRES.map((genre, index) => (
          <Pressable
            key={genre.id}
            style={({ pressed }) => [
              styles.genreRow,
              pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }
            ]}
            onPress={() => router.push({ pathname: '/genre/[id]', params: { id: genre.id, name: genre.name } })}
          >
            <REDText size={18} weight="semibold">{genre.name}</REDText>
            <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  searchIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  genreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  }
});