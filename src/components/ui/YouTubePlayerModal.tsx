import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Modal, Dimensions, Pressable, StatusBar, ScrollView, Image as RNImage } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { X, Volume2, ShieldCheck, Film, Play, FastForward } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { REDText } from './REDText';
import { THEME } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface NextEpisodeInfo {
  id: string;
  episodeNumber?: number;
  title: string;
  youtubeId: string;
  overview?: string;
  duration?: string;
  thumbnail?: string;
}

interface YouTubePlayerModalProps {
  visible: boolean;
  videoId: string | null;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  nextEpisode?: NextEpisodeInfo | null;
  onPlayNextEpisode?: (ep: NextEpisodeInfo) => void;
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
  nextEpisode,
  onPlayNextEpisode,
}) => {
  const insets = useSafeAreaInsets();
  const playerRef = useRef<YoutubeIframeRef>(null);

  const [playing, setPlaying] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);

  // Reset state when video changes
  useEffect(() => {
    setShowPrompt(false);
    setDismissedPrompt(false);
    setCountdown(5);
    setPlaying(true);
  }, [videoId]);

  const handlePlayNext = useCallback(() => {
    if (!nextEpisode) return;
    setShowPrompt(false);
    setDismissedPrompt(false);
    setCountdown(5);
    onPlayNextEpisode?.(nextEpisode);
  }, [nextEpisode, onPlayNextEpisode]);

  // Handle ENDED state: automatically play next episode immediately
  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
      if (nextEpisode) {
        handlePlayNext();
      }
    } else if (state === 'playing') {
      setPlaying(true);
    }
  }, [nextEpisode, handlePlayNext]);

  // Check remaining time: 15 seconds before ending, trigger the Next Episode prompt
  useEffect(() => {
    let interval: any = null;
    if (visible && playing && nextEpisode && !showPrompt && !dismissedPrompt) {
      interval = setInterval(async () => {
        try {
          if (playerRef.current) {
            const [currentTime, duration] = await Promise.all([
              playerRef.current.getCurrentTime(),
              playerRef.current.getDuration(),
            ]);
            if (duration > 0 && currentTime > 0) {
              const remaining = duration - currentTime;
              if (remaining <= 15) {
                setShowPrompt(true);
                setCountdown(5);
              }
            }
          }
        } catch {
          // ignore
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, playing, nextEpisode, showPrompt, dismissedPrompt]);

  // Countdown timer for 5s auto-start
  useEffect(() => {
    let timer: any = null;
    if (showPrompt && nextEpisode) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePlayNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showPrompt, nextEpisode, handlePlayNext]);

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
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Cinema Floating Display Screen */}
          <View style={styles.screenOuter}>
            <View style={styles.screenInner}>
              <YoutubePlayer
                ref={playerRef}
                width={PLAYER_WIDTH}
                height={VIDEO_HEIGHT}
                play={playing}
                videoId={videoId}
                onChangeState={onStateChange}
                webViewProps={{
                  androidLayerType: 'hardware',
                  allowsFullscreenVideo: true,
                  mediaPlaybackRequiresUserAction: false,
                }}
                initialPlayerParams={{
                  preventFullScreen: false,
                  controls: true,
                  modestbranding: true,
                  rel: false,
                  iv_load_policy: 3,
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
                <REDText size={12} weight="semibold" color="rgba(255,255,255,0.6)">Licensed Stream</REDText>
              </View>
              <View style={styles.specItem}>
                <Volume2 size={14} color="rgba(255,255,255,0.7)" />
                <REDText size={12} weight="semibold" color="rgba(255,255,255,0.6)">Stereo Surround</REDText>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Netflix-Style Floating "Next Episode" Prompt */}
        {showPrompt && nextEpisode && (
          <View style={[styles.nextPromptCard, { bottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.nextPromptHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <FastForward size={14} color={THEME.colors.red} />
                <REDText size={13} weight="bold" color="#fff">
                  Sonraki Bölüm ({countdown} sn içinde başlıyor)
                </REDText>
              </View>
              <Pressable 
                onPress={() => { setShowPrompt(false); setDismissedPrompt(true); }}
                hitSlop={8}
                style={{ padding: 4 }}
              >
                <X size={16} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
              {nextEpisode.thumbnail ? (
                <RNImage 
                  source={{ uri: nextEpisode.thumbnail }} 
                  style={{ width: 68, height: 40, borderRadius: 6, backgroundColor: '#1a1d24' }} 
                  resizeMode="cover"
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <REDText size={13} weight="bold" color="#fff" numberOfLines={1}>
                  {nextEpisode.episodeNumber ? `${nextEpisode.episodeNumber}. ` : ''}{nextEpisode.title}
                </REDText>
                {nextEpisode.duration ? (
                  <REDText size={11} color="rgba(255,255,255,0.5)" style={{ marginTop: 2 }}>{nextEpisode.duration}</REDText>
                ) : null}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Pressable 
                onPress={handlePlayNext} 
                style={({ pressed }) => [styles.nextPromptPlayBtn, pressed && { opacity: 0.8 }]}
              >
                <Play fill="#fff" color="#fff" size={13} style={{ marginRight: 6 }} />
                <REDText size={12} weight="bold" color="#fff">Şimdi Oynat</REDText>
              </Pressable>

              <Pressable 
                onPress={() => { setShowPrompt(false); setDismissedPrompt(true); }}
                style={({ pressed }) => [styles.nextPromptCancelBtn, pressed && { opacity: 0.8 }]}
              >
                <REDText size={12} weight="semibold" color="rgba(255,255,255,0.7)">İptal</REDText>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
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
  nextPromptCard: {
    position: 'absolute',
    right: 16,
    left: 16,
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: 'rgba(12, 14, 20, 0.96)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 9, 20, 0.55)',
    shadowColor: THEME.colors.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 14,
  },
  nextPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextPromptPlayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.red,
    paddingVertical: 10,
    borderRadius: 12,
  },
  nextPromptCancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
