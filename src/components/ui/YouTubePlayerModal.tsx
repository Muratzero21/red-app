import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Modal, Dimensions, Pressable, StatusBar, ScrollView, Image as RNImage, ActivityIndicator } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { X, Play, FastForward } from 'lucide-react-native';
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

export interface YouTubePlayerModalProps {
  visible: boolean;
  videoId: string | null;
  title?: string;
  subtitle?: string;
  year?: string | number;
  genre?: string;
  onClose: () => void;
  nextEpisode?: NextEpisodeInfo | null;
  onPlayNextEpisode?: (ep: NextEpisodeInfo) => void;
  initialStartSeconds?: number;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
}

const { width } = Dimensions.get('window');
const PLAYER_WIDTH = width - 32;
const VIDEO_HEIGHT = Math.round(PLAYER_WIDTH * (9 / 16));

export const YouTubePlayerModal: React.FC<YouTubePlayerModalProps> = ({
  visible,
  videoId,
  title,
  subtitle,
  year,
  genre,
  onClose,
  nextEpisode,
  onPlayNextEpisode,
  initialStartSeconds,
  onProgressUpdate,
}) => {
  const insets = useSafeAreaInsets();
  const playerRef = useRef<YoutubeIframeRef>(null);
  const hasSeekedRef = useRef(false);

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
    hasSeekedRef.current = false;
  }, [videoId]);

  const handlePlayNext = useCallback(() => {
    if (!nextEpisode) return;
    setShowPrompt(false);
    setDismissedPrompt(false);
    setCountdown(5);
    onPlayNextEpisode?.(nextEpisode);
  }, [nextEpisode, onPlayNextEpisode]);

  // Handle ENDED state: automatically play next episode immediately
  const onStateChange = useCallback(async (state: string) => {
    if (state === 'ended') {
      setPlaying(false);
      if (nextEpisode) {
        handlePlayNext();
      }
    } else if (state === 'playing') {
      setPlaying(true);
      if (initialStartSeconds && initialStartSeconds > 5 && !hasSeekedRef.current) {
        hasSeekedRef.current = true;
        try {
          playerRef.current?.seekTo(initialStartSeconds, true);
        } catch {
          // ignore
        }
      }
    } else if (state === 'paused') {
      try {
        if (playerRef.current && onProgressUpdate) {
          const [currentTime, duration] = await Promise.all([
            playerRef.current.getCurrentTime(),
            playerRef.current.getDuration(),
          ]);
          if (currentTime > 0) {
            onProgressUpdate(currentTime, duration);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [nextEpisode, handlePlayNext, initialStartSeconds, onProgressUpdate]);

  // Check remaining time (15s before ending triggers Next Episode prompt) AND persist playback progress
  useEffect(() => {
    let interval: any = null;
    if (visible && playing) {
      interval = setInterval(async () => {
        try {
          if (playerRef.current) {
            const [currentTime, duration] = await Promise.all([
              playerRef.current.getCurrentTime(),
              playerRef.current.getDuration(),
            ]);
            if (currentTime > 0) {
              onProgressUpdate?.(currentTime, duration);
            }
            if (duration > 0 && currentTime > 0 && nextEpisode && !showPrompt && !dismissedPrompt) {
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
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, playing, nextEpisode, showPrompt, dismissedPrompt, onProgressUpdate]);

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

        {/* Minimalist Top Navigation Header (Pure Netflix Style) */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
          <View style={{ flex: 1, marginRight: 16 }}>
            {title ? (
              <REDText size={16} weight="semibold" color="#fff" numberOfLines={1}>
                {title}
              </REDText>
            ) : null}
          </View>

          {/* Minimalist Close Button */}
          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] }]}
          >
            <X color="#fff" size={20} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Netflix Clean Player Frame - No Artificial Red Glow / Borders */}
          <View style={styles.screenOuter}>
            <View style={styles.screenInner}>
              <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="small" color={THEME.colors.red} />
              </View>
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

          {/* Clean Netflix Detail Info Section */}
          <View style={styles.infoCard}>
            {title ? (
              <REDText size={20} weight="bold" color="#fff" style={{ marginBottom: 6 }}>
                {title}
              </REDText>
            ) : null}

            {/* Netflix Metadata Row: Year • Genre • HD */}
            <View style={styles.metaRow}>
              {year ? (
                <REDText size={13} weight="semibold" color="rgba(255, 255, 255, 0.65)">
                  {year}
                </REDText>
              ) : null}

              {year && genre ? (
                <REDText size={13} color="rgba(255, 255, 255, 0.3)">•</REDText>
              ) : null}

              {genre ? (
                <REDText size={13} weight="semibold" color="rgba(255, 255, 255, 0.65)">
                  {genre}
                </REDText>
              ) : null}

              <View style={styles.netflixBadge}>
                <REDText size={10} weight="bold" color="rgba(255, 255, 255, 0.8)">HD</REDText>
              </View>
            </View>

            {/* Synopsis / Description */}
            {subtitle ? (
              <REDText size={14} color="rgba(255,255,255,0.7)" style={{ lineHeight: 22, marginTop: 14 }}>
                {subtitle}
              </REDText>
            ) : null}
          </View>
        </ScrollView>

        {/* Netflix-Style Floating "Next Episode" Prompt */}
        {showPrompt && nextEpisode && (
          <View style={[styles.nextPromptCard, { bottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.nextPromptHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <FastForward size={14} color={THEME.colors.red} />
                <REDText size={13} weight="bold" color="#fff">
                  Next Episode (Starts in {countdown}s)
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
                <REDText size={12} weight="bold" color="#fff">Play Now</REDText>
              </Pressable>

              <Pressable 
                onPress={() => { setShowPrompt(false); setDismissedPrompt(true); }}
                style={({ pressed }) => [styles.nextPromptCancelBtn, pressed && { opacity: 0.8 }]}
              >
                <REDText size={12} weight="semibold" color="rgba(255,255,255,0.7)">Cancel</REDText>
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
    backgroundColor: '#0a0a0c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenOuter: {
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#000',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  screenInner: {
    width: PLAYER_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  netflixBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  nextPromptCard: {
    position: 'absolute',
    right: 16,
    left: 16,
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#12141a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
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
    borderRadius: 10,
  },
  nextPromptCancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
