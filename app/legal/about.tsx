import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';
import { REDButton } from '../../src/components/ui/REDButton';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({pressed}) => [styles.backBtn, pressed && {opacity: 0.7}]}>
          <ChevronLeft color="#fff" size={28} />
        </Pressable>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.branding}>
          <Image 
            source={require('../../assets/images/red-logo.png')} 
            style={styles.logo}
            contentFit="contain"
          />
          <REDText size={20} weight="bold" color={THEME.colors.textSecondary} style={styles.subtitle}>
            Entertainment Discovery, Reimagined.
          </REDText>
        </View>

        <View style={styles.section}>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            RED is an entertainment discovery platform designed to make discovering movies and TV shows simpler, more visual, and more enjoyable.
          </REDText>
          <REDText color="rgba(255,255,255,0.8)" style={styles.paragraph}>
            Discover new movies and series, explore popular titles, watch trailers, and discover what to watch next.
          </REDText>
        </View>

        <View style={styles.noticeSection}>
          <REDText size={16} weight="bold" style={{ marginBottom: 12, color: THEME.colors.textPrimary }}>
            RED is not a streaming service.
          </REDText>
          <REDText color="rgba(255,255,255,0.6)" style={styles.noticeText}>
            RED does not stream or host movies or TV shows. RED provides an entertainment discovery and trailer discovery experience.
          </REDText>
        </View>

        <View style={styles.webSection}>
          <REDText size={18} weight="bold" style={{ marginBottom: 12, textAlign: 'center' }}>
            Explore RED on the Web
          </REDText>
          <REDText color="rgba(255,255,255,0.6)" style={styles.webDescription}>
            Discover more features, detailed movie and TV experiences, and the full RED platform on the web.
          </REDText>
          <REDButton 
            title="Visit RED Website" 
            variant="primary" 
            style={styles.webButton}
            onPress={() => Linking.openURL('https://reddiscovery.com')}
          />
        </View>

        <View style={styles.footer}>
          <REDText size={16} weight="bold" style={styles.footerTitle}>RED App</REDText>
          <REDText size={14} color={THEME.colors.textSecondary}>Beta</REDText>
          <View style={{ height: 24 }} />
          <REDText size={14} color="rgba(255,255,255,0.4)">Made by RED</REDText>
          <REDText size={14} color="rgba(255,255,255,0.4)">© 2026 RED</REDText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  content: { padding: 24, paddingBottom: 60, alignItems: 'center' },
  branding: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  subtitle: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  section: { 
    marginBottom: 48,
    width: '100%',
  },
  paragraph: { 
    lineHeight: 26, 
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  noticeSection: {
    width: '100%',
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    marginBottom: 48,
  },
  noticeText: {
    lineHeight: 22,
    fontSize: 14,
    marginBottom: 0,
  },
  webSection: {
    width: '100%',
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    marginBottom: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  webDescription: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
    marginBottom: 24,
  },
  webButton: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    opacity: 0.8,
  },
  footerTitle: {
    marginBottom: 4,
    letterSpacing: 1,
  }
});
