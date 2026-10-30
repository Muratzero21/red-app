import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  Pressable,
  StatusBar,
  ScrollView,
  Image as RNImage,
  ActivityIndicator,
  Share,
} from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import {
  X,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  RotateCw,
  Plus,
  Check,
  ThumbsUp,
  Share2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
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
  // Series Seasons & Episodes for Player Detail Screen
  seasons?: any[];
  selectedSeasonIndex?: number;
  onSelectSeasonIndex?: (index: number) => void;
  episodes?: any[];
  episodesLoading?: boolean;
  activeEpisodeId?: string | number;
  onSelectEpisode?: (ep: any) => void;
  // Watchlist integration
  inWatchlist?: boolean;
  onToggleWatchlist?: () => void;
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
  seasons = [],
  selectedSeasonIndex = 0,
  onSelectSeasonIndex,
  episodes = [],
  episodesLoading = false,
  activeEpisodeId,
  onSelectEpisode,
  inWatchlist = false,
  onToggleWatchlist,
}) => {
  const insets = useSafeAreaInsets();
  const playerRef = useRef<YoutubeIframeRef>(null);
  const hasSeekedRef = useRef(false);
  const controlsTimerRef = useRef<any>(null);

  const [playing, setPlaying] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [liked, setLiked] = useState(false);
  const [localWatchlist, setLocalWatchlist] = useState(inWatchlist);

  const [showPrompt, setShowPrompt] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);

  useEffect(() => {
    setLocalWatchlist(inWatchlist);
  }, [inWatchlist]);

  // Auto-hide custom player controls 3 seconds after showing
  const triggerControlsOverlay = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

  // Reset state when video changes
  useEffect(() => {
    setShowPrompt(false);
    setDismissedPrompt(false);
    setCountdown(5);
    setPlaying(true);
    setControlsVisible(false);
    hasSeekedRef.current = false;
  }, [videoId]);

  const handleSeekBy = useCallback(
    async (deltaSeconds: number) => {
      triggerControlsOverlay();
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {
        // ignore
      }
      try {
        if (playerRef.current) {
          const current = await playerRef.current.getCurrentTime();
          const target = Math.max(0, (current || 0) + deltaSeconds);
          playerRef.current.seekTo(target, true);
        }
      } catch {
        // ignore
      }
    },
    [triggerControlsOverlay]
  );

  const handleTogglePlayPause = useCallback(() => {
    triggerControlsOverlay();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // ignore
    }
    setPlaying((prev) => !prev);
  }, [triggerControlsOverlay]);

  const handlePlayNext = useCallback(() => {
    if (!nextEpisode) return;
    setShowPrompt(false);
    setDismissedPrompt(false);
    setCountdown(5);
    onPlayNextEpisode?.(nextEpisode);
  }, [nextEpisode, onPlayNextEpisode]);

  // Handle ENDED state: automatically play next episode immediately
  const onStateChange = useCallback(
    async (state: string) => {
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
        setPlaying(false);
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
    },
    [nextEpisode, handlePlayNext, initialStartSeconds, onProgressUpdate]
  );

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
            if (
              duration > 0 &&
              currentTime > 0 &&
              nextEpisode &&
              !showPrompt &&
              !dismissedPrompt
            ) {
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

  const handleWatchlistPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // ignore
    }
    if (onToggleWatchlist) {
      onToggleWatchlist();
    } else {
      setLocalWatchlist((prev) => !prev);
    }
  };

  const handleLikePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {
      // ignore
    }
    setLiked((prev) => !prev);
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `Watching "${title || 'this show'}" on RED!`,
      });
    } catch {
      // ignore
    }
  };

  if (!visible || !videoId) return null;

  const isSaved = onToggleWatchlist ? inWatchlist : localWatchlist;

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

        {/* Top Navigation Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
          <View style={{ flex: 1, marginRight: 16 }}>
            {title ? (
              <REDText size={16} weight="semibold" color="#fff" numberOfLines={1}>
                {title}
              </REDText>
            ) : null}
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] },
            ]}
          >
            <X color="#fff" size={20} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {/* Video Player Frame with Touch-Activated 3s Auto-Hide Controls Overlay */}
          <View style={styles.screenOuter}>
            <View style={styles.screenInner}>
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { justifyContent: 'center', alignItems: 'center' },
                ]}
              >
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

              {/* Tap Catcher / Translucent Dark Controls Overlay (Auto-hides after 3s) */}
              {!controlsVisible ? (
                <Pressable
                  onPress={triggerControlsOverlay}
                  style={styles.tapActivationZone}
                />
              ) : (
                <Pressable
                  onPress={() => setControlsVisible(false)}
                  style={styles.controlsOverlay}
                >
                  <View style={styles.controlsCenterRow}>
                    {/* 10s Rewind Button */}
                    <Pressable
                      onPress={() => handleSeekBy(-10)}
                      hitSlop={12}
                      style={({ pressed }) => [
                        styles.seekCircleBtn,
                        pressed && { opacity: 0.75, transform: [{ scale: 0.92 }] },
                      ]}
                    >
                      <RotateCcw size={22} color="#fff" />
                      <REDText size={10} weight="bold" color="#fff" style={{ marginTop: 2 }}>
                        -10s
                      </REDText>
                    </Pressable>

                    {/* Center Play / Pause Button */}
                    <Pressable
                      onPress={handleTogglePlayPause}
                      hitSlop={12}
                      style={({ pressed }) => [
                        styles.playPauseMainBtn,
                        pressed && { opacity: 0.85, transform: [{ scale: 0.93 }] },
                      ]}
                    >
                      {playing ? (
                        <Pause size={26} color="#fff" fill="#fff" />
                      ) : (
                        <Play size={26} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
                      )}
                    </Pressable>

                    {/* 10s Fast-Forward Button */}
                    <Pressable
                      onPress={() => handleSeekBy(10)}
                      hitSlop={12}
                      style={({ pressed }) => [
                        styles.seekCircleBtn,
                        pressed && { opacity: 0.75, transform: [{ scale: 0.92 }] },
                      ]}
                    >
                      <RotateCw size={22} color="#fff" />
                      <REDText size={10} weight="bold" color="#fff" style={{ marginTop: 2 }}>
                        +10s
                      </REDText>
                    </Pressable>
                  </View>
                </Pressable>
              )}
            </View>
          </View>

          {/* Detail Info + Meta Badges + Action Bar */}
          <View style={styles.infoCard}>
            {title ? (
              <REDText size={19} weight="bold" color="#fff" style={{ marginBottom: 8 }}>
                {title}
              </REDText>
            ) : null}

            {/* Metadata Row: Year • Category • HD • TR Dublaj / Altyazı • 7+ */}
            <View style={styles.metaRow}>
              {year ? (
                <REDText size={13} weight="semibold" color="rgba(255, 255, 255, 0.7)">
                  {year}
                </REDText>
              ) : null}

              {year && genre ? (
                <REDText size={13} color="rgba(255, 255, 255, 0.35)">
                  •
                </REDText>
              ) : null}

              {genre ? (
                <REDText size={13} weight="semibold" color="rgba(255, 255, 255, 0.7)">
                  {genre}
                </REDText>
              ) : null}

              <View style={styles.metaBadge}>
                <REDText size={10} weight="bold" color="rgba(255, 255, 255, 0.85)">
                  HD
                </REDText>
              </View>

              <View style={styles.metaBadgeAccent}>
                <REDText size={10} weight="bold" color="#fff">
                  TR Dublaj / Altyazı
                </REDText>
              </View>

              <View style={styles.ageBadge}>
                <REDText size={10} weight="bold" color="#fff">
                  7+
                </REDText>
              </View>
            </View>

            {/* Synopsis / Description */}
            {subtitle ? (
              <REDText
                size={13.5}
                color="rgba(255,255,255,0.72)"
                style={{ lineHeight: 21, marginTop: 12 }}
              >
                {subtitle}
              </REDText>
            ) : null}

            {/* Horizontal Action Bar: + Listem | Beğen | Paylaş */}
            <View style={styles.actionBarRow}>
              <Pressable
                onPress={handleWatchlistPress}
                style={({ pressed }) => [
                  styles.actionBarItem,
                  isSaved && styles.actionBarItemActive,
                  pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] },
                ]}
              >
                {isSaved ? (
                  <Check size={18} color={THEME.colors.red} />
                ) : (
                  <Plus size={18} color="#fff" />
                )}
                <REDText
                  size={12}
                  weight="semibold"
                  color={isSaved ? THEME.colors.red : 'rgba(255,255,255,0.85)'}
                >
                  {isSaved ? 'Listemde' : '+ Listem'}
                </REDText>
              </Pressable>

              <Pressable
                onPress={handleLikePress}
                style={({ pressed }) => [
                  styles.actionBarItem,
                  liked && styles.actionBarItemActive,
                  pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] },
                ]}
              >
                <ThumbsUp
                  size={17}
                  color={liked ? THEME.colors.red : '#fff'}
                  fill={liked ? THEME.colors.red : 'none'}
                />
                <REDText
                  size={12}
                  weight="semibold"
                  color={liked ? THEME.colors.red : 'rgba(255,255,255,0.85)'}
                >
                  Beğen
                </REDText>
              </Pressable>

              <Pressable
                onPress={handleSharePress}
                style={({ pressed }) => [
                  styles.actionBarItem,
                  pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] },
                ]}
              >
                <Share2 size={17} color="#fff" />
                <REDText size={12} weight="semibold" color="rgba(255,255,255,0.85)">
                  Paylaş
                </REDText>
              </Pressable>
            </View>
          </View>

          {/* EPISODE LIST SECTION (Season Tabs + Mini Episode Cards) */}
          {(seasons.length > 0 || episodes.length > 0) && (
            <View style={styles.episodesSection}>
              <View style={styles.episodesHeaderRow}>
                <REDText size={17} weight="bold" color="#fff">
                  Episodes {episodes.length > 0 ? `(${episodes.length})` : ''}
                </REDText>
                {episodesLoading && (
                  <ActivityIndicator size="small" color={THEME.colors.red} />
                )}
              </View>

              {/* Horizontal Season Selector Tabs */}
              {seasons.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.seasonTabsScroll}
                >
                  {seasons.map((season: any, idx: number) => {
                    const sNum = season.seasonNumber || idx + 1;
                    const isSelected = idx === selectedSeasonIndex;
                    return (
                      <Pressable
                        key={sNum}
                        onPress={() => onSelectSeasonIndex?.(idx)}
                        style={[
                          styles.seasonTabPill,
                          isSelected && styles.seasonTabPillActive,
                        ]}
                      >
                        <REDText
                          size={12.5}
                          weight={isSelected ? 'bold' : 'medium'}
                          color={isSelected ? '#fff' : 'rgba(255,255,255,0.6)'}
                        >
                          Season {sNum}
                        </REDText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Vertical Mini Episode Cards (Thumbnail + Episode Title + Duration) */}
              <View style={styles.miniEpisodesList}>
                {episodes.map((ep: any, epIdx: number) => {
                  const epNum = ep.episodeNumber || ep.episode_number || epIdx + 1;
                  const epTitle = ep.title || ep.name || `Episode ${epNum}`;
                  const epDuration = ep.duration || '22m';
                  const epThumb =
                    ep.thumbnail ||
                    ep.thumbnailUrl ||
                    (ep.youtubeId
                      ? `https://img.youtube.com/vi/${ep.youtubeId}/mqdefault.jpg`
                      : null);
                  const isPlayingEp =
                    (activeEpisodeId && String(ep.id) === String(activeEpisodeId)) ||
                    (ep.youtubeId && ep.youtubeId === videoId && epIdx === 0);

                  return (
                    <Pressable
                      key={ep.id || epIdx}
                      onPress={() => onSelectEpisode?.(ep)}
                      style={({ pressed }) => [
                        styles.miniEpCard,
                        isPlayingEp && styles.miniEpCardActive,
                        pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
                      ]}
                    >
                      {/* Mini 16:9 Thumbnail */}
                      <View style={styles.miniThumbBox}>
                        {epThumb ? (
                          <RNImage
                            source={{ uri: epThumb }}
                            style={styles.miniThumbImg}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.miniThumbImg,
                              {
                                backgroundColor: '#1b1e28',
                                justifyContent: 'center',
                                alignItems: 'center',
                              },
                            ]}
                          >
                            <Play size={16} color="rgba(255,255,255,0.4)" />
                          </View>
                        )}
                        <View style={styles.miniThumbOverlay}>
                          <View
                            style={[
                              styles.miniPlayCircle,
                              isPlayingEp && { backgroundColor: THEME.colors.red, borderColor: THEME.colors.red },
                            ]}
                          >
                            <Play
                              size={11}
                              color="#fff"
                              fill="#fff"
                              style={{ marginLeft: 1 }}
                            />
                          </View>
                        </View>
                      </View>

                      {/* Episode Title & Duration */}
                      <View style={styles.miniEpMeta}>
                        <REDText
                          size={14}
                          weight="bold"
                          color={isPlayingEp ? THEME.colors.red : '#fff'}
                          numberOfLines={1}
                        >
                          {epNum}. {epTitle}
                        </REDText>
                        <View style={styles.miniEpSubRow}>
                          <REDText size={11.5} weight="semibold" color="rgba(255,255,255,0.5)">
                            {epDuration}
                          </REDText>
                          {isPlayingEp && (
                            <View style={styles.nowPlayingPill}>
                              <REDText size={9.5} weight="bold" color={THEME.colors.red}>
                                NOW PLAYING
                              </REDText>
                            </View>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
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
                onPress={() => {
                  setShowPrompt(false);
                  setDismissedPrompt(true);
                }}
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
                  style={{
                    width: 68,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: '#1a1d24',
                  }}
                  resizeMode="cover"
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <REDText size={13} weight="bold" color="#fff" numberOfLines={1}>
                  {nextEpisode.episodeNumber ? `${nextEpisode.episodeNumber}. ` : ''}
                  {nextEpisode.title}
                </REDText>
                {nextEpisode.duration ? (
                  <REDText
                    size={11}
                    color="rgba(255,255,255,0.5)"
                    style={{ marginTop: 2 }}
                  >
                    {nextEpisode.duration}
                  </REDText>
                ) : null}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Pressable
                onPress={handlePlayNext}
                style={({ pressed }) => [styles.nextPromptPlayBtn, pressed && { opacity: 0.8 }]}
              >
                <Play fill="#fff" color="#fff" size={13} style={{ marginRight: 6 }} />
                <REDText size={12} weight="bold" color="#fff">
                  Play Now
                </REDText>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowPrompt(false);
                  setDismissedPrompt(true);
                }}
                style={({ pressed }) => [
                  styles.nextPromptCancelBtn,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <REDText size={12} weight="semibold" color="rgba(255,255,255,0.7)">
                  Cancel
                </REDText>
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
    position: 'relative',
  },
  tapActivationZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 42, // Leave bottom YouTube scrub bar accessible when overlay is hidden
    backgroundColor: 'transparent',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.56)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 34,
  },
  seekCircleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseMainBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(229, 9, 20, 0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 7,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  metaBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  metaBadgeAccent: {
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.45)',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(229, 9, 20, 0.16)',
  },
  ageBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
  },
  actionBarItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  actionBarItemActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.14)',
    borderColor: 'rgba(229, 9, 20, 0.45)',
  },
  episodesSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  episodesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seasonTabsScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  seasonTabPill: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  seasonTabPillActive: {
    backgroundColor: THEME.colors.red,
    borderColor: THEME.colors.red,
  },
  miniEpisodesList: {
    gap: 10,
  },
  miniEpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  miniEpCardActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.09)',
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  miniThumbBox: {
    width: 112,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#141720',
    position: 'relative',
  },
  miniThumbImg: {
    width: '100%',
    height: '100%',
  },
  miniThumbOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniEpMeta: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 4,
  },
  miniEpSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  nowPlayingPill: {
    backgroundColor: 'rgba(229, 9, 20, 0.16)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
