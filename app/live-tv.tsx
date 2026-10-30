import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  Image as RNImage,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, X } from 'lucide-react-native';
import { REDText } from '../src/components/ui/REDText';
import { THEME } from '../src/constants/theme';
import {
  LIVE_CHANNELS,
  LiveChannel,
  getLiveChannelById,
} from '../src/constants/liveChannels';
import { resolveActiveLiveStreamId } from '../src/services/liveStreamResolver';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 12;
const CARD_WIDTH = Math.floor((width - GRID_PADDING * 2 - GRID_GAP) / 2);
const THUMB_HEIGHT = Math.round(CARD_WIDTH * (9 / 16));
const VIDEO_HEIGHT = Math.round(width * (9 / 16));

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'movies', label: 'Movies & Cinema' },
  { key: 'sports', label: 'Motorsport' },
  { key: 'kids', label: 'Animation' },
  { key: 'news', label: 'News' },
  { key: 'music_ambience', label: 'Music & Ambience' },
] as const;

export default function LiveTvScreen() {
  const insets = useSafeAreaInsets();
  const { channelId } = useLocalSearchParams<{ channelId?: string }>();

  const initialChannel = useMemo(() => {
    const rawId = Array.isArray(channelId) ? channelId[0] : channelId;
    if (!rawId) return null;
    return getLiveChannelById(rawId);
  }, [channelId]);

  const [activeChannel, setActiveChannel] = useState<LiveChannel | null>(initialChannel);
  const [dynamicLiveId, setDynamicLiveId] = useState<string | null>(null);
  const [fallbackIndex, setFallbackIndex] = useState<number>(-1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playing, setPlaying] = useState<boolean>(true);

  const currentVideoId = useMemo(() => {
    if (!activeChannel) return '';
    if (dynamicLiveId) return dynamicLiveId;
    if (fallbackIndex < 0) return activeChannel.youtubeId;
    return (
      activeChannel.backupYoutubeIds[fallbackIndex] ||
      activeChannel.backupYoutubeIds[0] ||
      activeChannel.youtubeId
    );
  }, [activeChannel, fallbackIndex, dynamicLiveId]);

  const handleSelectChannel = useCallback((channel: LiveChannel) => {
    setActiveChannel(channel);
    setDynamicLiveId(null);
    setFallbackIndex(-1);
    setPlaying(true);
  }, []);

  const handlePlayerError = useCallback(async () => {
    if (!activeChannel) return;
    try {
      const liveId = await resolveActiveLiveStreamId(activeChannel);
      if (liveId && liveId !== currentVideoId) {
        setDynamicLiveId(liveId);
        return;
      }
    } catch {
      // ignore
    }
    setFallbackIndex((prev) => {
      const nextIdx = prev + 1;
      if (nextIdx < activeChannel.backupYoutubeIds.length) {
        return nextIdx;
      }
      return prev;
    });
  }, [activeChannel, currentVideoId]);

  const filteredChannels = useMemo(() => {
    if (selectedCategory === 'all') return LIVE_CHANNELS;
    if (selectedCategory === 'music_ambience') {
      return LIVE_CHANNELS.filter(
        (c) => c.category === 'music' || c.category === 'space_science'
      );
    }
    return LIVE_CHANNELS.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 18) + 6 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <ChevronLeft size={22} color="#fff" />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.headerLiveDot} />
          <REDText size={18} weight="bold" color="#fff" style={{ letterSpacing: 0.3 }}>
            Live Channels
          </REDText>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Active Live Stream Player (Shown when a channel is tapped) */}
      {activeChannel && (
        <View style={styles.activePlayerSection}>
          <View style={styles.playerWrapper}>
            <View style={[StyleSheet.absoluteFill, styles.loaderBox]}>
              <ActivityIndicator size="small" color={THEME.colors.red} />
            </View>
            <YoutubePlayer
              width={width}
              height={VIDEO_HEIGHT}
              play={playing}
              videoId={currentVideoId}
              onError={handlePlayerError}
              onChangeState={(state: string) => {
                if (state === 'playing') setPlaying(true);
              }}
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

          <View style={styles.nowPlayingBar}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={styles.nowPlayingBadge}>
                  <View style={styles.badgeLiveDot} />
                  <REDText size={9} weight="bold" color="#fff" style={{ letterSpacing: 0.5 }}>
                    LIVE
                  </REDText>
                </View>
                <REDText size={14} weight="bold" color="#fff" numberOfLines={1} style={{ flex: 1 }}>
                  {activeChannel.name}
                </REDText>
              </View>
              <REDText
                size={12}
                color="rgba(255,255,255,0.6)"
                numberOfLines={1}
                style={{ marginTop: 3 }}
              >
                {activeChannel.currentProgram}
              </REDText>
            </View>

            <Pressable
              onPress={() => setActiveChannel(null)}
              hitSlop={10}
              style={({ pressed }) => [styles.closePlayerBtn, pressed && { opacity: 0.7 }]}
            >
              <X size={16} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Horizontal Scrollable Category Chips */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <REDText
                  size={13}
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? '#fff' : 'rgba(255,255,255,0.65)'}
                >
                  {cat.label}
                </REDText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 2-Column Vertical Grid of Live Channels */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridScrollContent}
      >
        <View style={styles.gridContainer}>
          {filteredChannels.map((channel) => {
            const isCurrent = activeChannel?.id === channel.id;
            return (
              <Pressable
                key={channel.id}
                onPress={() => handleSelectChannel(channel)}
                style={({ pressed }) => [
                  styles.gridCard,
                  pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] },
                ]}
              >
                {/* 16:9 Clean Thumbnail with ONLY small top-left • LIVE badge */}
                <View
                  style={[
                    styles.cardThumbWrapper,
                    isCurrent && styles.cardThumbWrapperActive,
                  ]}
                >
                  <RNImage
                    source={{ uri: channel.thumbnail }}
                    style={styles.cardThumbImage}
                    resizeMode="cover"
                  />

                  <View style={styles.cardLiveBadge}>
                    <View style={styles.badgeLiveDot} />
                    <REDText
                      size={9}
                      weight="bold"
                      color="#fff"
                      style={{ letterSpacing: 0.5 }}
                    >
                      LIVE
                    </REDText>
                  </View>
                </View>

                {/* Clean Typography Below Thumbnail: Channel Name + Broadcast Title */}
                <View style={styles.cardMeta}>
                  <REDText
                    size={13.5}
                    weight="bold"
                    color={isCurrent ? THEME.colors.red : '#fff'}
                    numberOfLines={1}
                  >
                    {channel.name}
                  </REDText>
                  <REDText
                    size={11.5}
                    color="rgba(255,255,255,0.55)"
                    numberOfLines={1}
                    style={{ marginTop: 2 }}
                  >
                    {channel.currentProgram}
                  </REDText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#0b0c10',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.red,
  },
  activePlayerSection: {
    backgroundColor: '#11131a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  playerWrapper: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  loaderBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  nowPlayingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.red,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closePlayerBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    paddingVertical: 12,
    backgroundColor: '#0b0c10',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  filterPillActive: {
    backgroundColor: THEME.colors.red,
    borderColor: THEME.colors.red,
  },
  gridScrollContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 4,
    paddingBottom: 48,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
  gridCard: {
    width: CARD_WIDTH,
  },
  cardThumbWrapper: {
    width: CARD_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#161822',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardThumbWrapperActive: {
    borderColor: THEME.colors.red,
    borderWidth: 1.5,
  },
  cardThumbImage: {
    width: '100%',
    height: '100%',
  },
  cardLiveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  badgeLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  cardMeta: {
    paddingTop: 8,
    paddingHorizontal: 2,
  },
});
