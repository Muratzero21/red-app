import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';

export default function TermsOfUseScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({pressed}) => [styles.backBtn, pressed && {opacity: 0.7}]}>
          <ChevronLeft color="#fff" size={28} />
        </Pressable>
        <REDText size={20} weight="bold">Terms of Use</REDText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <REDText size={28} weight="bold" style={styles.title}>Terms of Use</REDText>
        <REDText color={THEME.colors.textSecondary} style={styles.lastUpdated}>Last Updated: October 2026</REDText>

        <View style={styles.section}>
          <REDText size={18} weight="bold" style={styles.heading}>1. Nature of the Service</REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            RED App is an entertainment discovery and trailer viewing application. It is designed to help users explore trending movies, popular series, and cast information.
          </REDText>
        </View>

        <View style={styles.section}>
          <REDText size={18} weight="bold" style={styles.heading}>2. Not a Streaming Platform</REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            RED is NOT a streaming service. We do not host, distribute, or stream full-length movies, TV episodes, or copyrighted media. The "Play" button functionality serves to redirect users to official streaming providers or to play publicly available promotional trailers on YouTube.
          </REDText>
        </View>

        <View style={styles.section}>
          <REDText size={18} weight="bold" style={styles.heading}>3. Intellectual Property and Data Source</REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            All movie data, posters, backdrops, cast photos, and overviews are provided by TMDB (The Movie Database). RED App claims no ownership over these materials. Our application uses the TMDB API but is not endorsed or certified by TMDB.
          </REDText>
        </View>

        <View style={styles.section}>
          <REDText size={18} weight="bold" style={styles.heading}>4. User Conduct</REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            By using RED App, you agree to use the application for personal, non-commercial entertainment purposes. You agree not to reverse-engineer the application or use automated systems to excessively poll the integrated APIs.
          </REDText>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  content: { padding: 24, paddingBottom: 60 },
  title: { marginBottom: 8 },
  lastUpdated: { marginBottom: 32, fontSize: 14 },
  section: { marginBottom: 28 },
  heading: { marginBottom: 12, color: THEME.colors.red, letterSpacing: 0.5 },
  paragraph: { lineHeight: 24, fontSize: 15 }
});
