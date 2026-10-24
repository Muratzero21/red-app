import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Modal, Dimensions, Pressable, StatusBar, ScrollView } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { X, Sparkles, Volume2, ShieldCheck, Film } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { REDText } from './REDText';
import { THEME } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface YouTubePlayerModalProps {
  visible: boolean;
  videoId: string | null;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const PLAYER_WIDTH = width - 32;
const VIDEO_HEIGHT = Math.round(PLAYER_WIDTH * (9 / 16));

export const YouTubePlayerModal: React.FC<YouTubePlayerModalProps> = ({
  visible,
  videoId,
  title,
  subtitle,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [playing, setPlaying] = useState(true);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  if (!visible || !videoId) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <StatusBar hidden={false} barStyle="light-content" />

        {/* Ambient Top Glow */}
        <LinearGradient
          colors={['rgba(229, 9, 20, 0.25)', 'transparent']}
          style={styles.ambientGlow}
        />

        {/* Top Navigation Bar */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <View style={styles.liveIndicator} />
              <REDText size={11} weight="bold" color={THEME.colors.red} style={{ letterSpacing: 1.5 }}>
                RED CINEMA THEATER
              </REDText>
            </View>
            {title ? (
              <REDText size={17} weight="bold" color="#fff" numberOfLines={1}>
                {title}
              </REDText>
            ) : null}
          </View>

          {/* Premium Glass Close Button */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] }]}
          >
            <X color="#fff" size={20} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Cinema Floating Display Screen */}
          <View style={styles.screenOuter}>
            <View style={styles.screenInner}>
              <YoutubePlayer
                width={PLAYER_WIDTH}
                height={VIDEO_HEIGHT}
                play={playing}
                videoId={videoId}
                onChangeState={onStateChange}
                webViewProps={{
                  androidLayerType: 'hardware',
                  allowsFullscreenVideo: true,
                }}
                initialPlayerParams={{
                  preventFullScreen: false,
                  controls: true,
                  modestbranding: true,
                  rel: false,
                }}
              />
            </View>
          </View>

          {/* Luxury Information Glass Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={styles.statusPill}>
                <Film size={12} color={THEME.colors.red} style={{ marginRight: 6 }} />
                <REDText size={11} weight="bold" color="#fff">OFFICIAL FULL STREAM</REDText>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={styles.tagBadge}>
                  <REDText size={10} weight="bold" color="rgba(255,255,255,0.9)">4K ULTRA HD</REDText>
                </View>
                <View style={[styles.tagBadge, { borderColor: 'rgba(229,9,20,0.5)', backgroundColor: 'rgba(229,9,20,0.12)' }]}>
                  <REDText size={10} weight="bold" color={THEME.colors.red}>RED EXCLUSIVE</REDText>
                </View>
              </View>
            </View>

            {title ? (
              <REDText size={18} weight="bold" color="#fff" style={{ marginBottom: 8, marginTop: 4 }}>
                {title}
              </REDText>
            ) : null}

            {subtitle ? (
              <REDText size={14} color="rgba(255,255,255,0.7)" style={{ lineHeight: 22 }}>
                {subtitle}
              </REDText>
            ) : null}

            {/* Bottom Spec Footer */}
            <View style={styles.specFooter}>
              <View style={styles.specItem}>
                <ShieldCheck size={14} color={THEME.colors.red} />
                <REDText size={12} weight="semibold" color="rgba(255,255,255,0.6)">Licensed Player</REDText>
              </View>
              <View style={styles.specItem}>
                <Volume2 size={14} color="rgba(255,255,255,0.7)" />
                <REDText size={12} weight="semibold" color="rgba(255,255,255,0.6)">Stereo Surround</REDText>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C', // 100% Solid Dark OLED Background (Zero leak from behind)
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.red,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  screenOuter: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 9, 20, 0.35)',
    backgroundColor: '#000',
    overflow: 'hidden',
    shadowColor: THEME.colors.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  screenInner: {
    width: PLAYER_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.25)',
  },
  tagBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  specFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
