import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({pressed}) => [styles.backBtn, pressed && {opacity: 0.7}]}>
          <ChevronLeft color="#fff" size={28} />
        </Pressable>
        <REDText size={20} weight="bold">Privacy Policy</REDText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <REDText size={28} weight="bold" style={styles.title}>Privacy Policy</REDText>
        <REDText color={THEME.colors.textSecondary} style={styles.lastUpdated}>Last Updated: October 2026</REDText>

        <View style={styles.section}>
          <REDText size={18} weight="bold" style={styles.heading}>1. No Personal Data Collection</REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            RED App is designed with privacy at its core. We do not require you to create an account, log in, or provide any personal information. We do not collect your name, email address, or any other identifying data.
          </REDText>
        </View>

        <View style={styles.section}>
          <REDText size={18} weight="bold" style={styles.heading}>2. Local Device Storage</REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            Your preferences (such as Notification toggles, Auto-play settings, and Wi-Fi Only mode) are stored locally on your device. This data never leaves your device and is not transmitted to our servers.
          </REDText>
        </View>

        <View style={styles.section}>
          <REDText size={18} weight="bold" style={styles.heading}>3. Third-Party Services (TMDB)</REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            RED App relies on the TMDB (The Movie Database) API to fetch movie and TV show information, posters, and trailers. When you use RED App, standard network requests are made to TMDB to retrieve this content. TMDB's own privacy practices apply to those requests.
          </REDText>
        </View>

        <View style={styles.section}>
          <REDText size={18} weight="bold" style={styles.heading}>4. Usage Analytics</REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            Currently, RED App does not integrate any tracking SDKs, analytics, or crash reporting tools. Your browsing behavior within the app remains entirely private and is not monitored by us.
          </REDText>
        </View>

        <View style={styles.section}>
          <REDText size={18} weight="bold" style={styles.heading}>5. Changes to this Policy</REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            We may update this Privacy Policy from time to time if we introduce new features (such as user accounts). Any changes will be reflected directly in this section of the app.
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
