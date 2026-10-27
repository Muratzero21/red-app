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
import { ChevronLeft, Radio, Play, Users } from 'lucide-react-native';
import { REDText } from '../src/components/ui/REDText';
import { THEME } from '../src/constants/theme';
import {
  LIVE_CHANNELS,
  LiveChannel,
  getLiveChannelById,
} from '../src/constants/liveChannels';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = Math.round(width * (9 / 16));

const CATEGORIES = [
  { key: 'all', label: 'All Channels' },
  { key: 'sports', label: '🏎️ F1 & Sports' },
  { key: 'kids', label: 'Kids & Animation' },
  { key: 'space_science', label: 'Space & Science' },
  { key: 'news', label: 'World News' },
  { key: 'music', label: '24/7 Music' },
] as const;

export default function LiveTvScreen() {
  const insets = useSafeAreaInsets();
  const { channelId } = useLocalSearchParams<{ channelId?: string }>();

  const initialChannel = useMemo(
    () => getLiveChannelById(Array.isArray(channelId) ? channelId[0] : channelId),
    [channelId]
  );

  const [activeChannel, setActiveChannel] = useState<LiveChannel>(initialChannel);
  const [fallbackIndex, setFallbackIndex] = useState<number>(-1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playing, setPlaying] = useState<boolean>(true);

  const currentVideoId = useMemo(() => {
    if (fallbackIndex < 0) return activeChannel.youtubeId;
    return (
      activeChannel.backupYoutubeIds[fallbackIndex] ||
      activeChannel.backupYoutubeIds[0] ||
      activeChannel.youtubeId
    );
  }, [activeChannel, fallbackIndex]);

  const handleSelectChannel = useCallback((channel: LiveChannel) => {
    setActiveChannel(channel);
    setFallbackIndex(-1);
    setPlaying(true);
  }, []);

  const handlePlayerError = useCallback(() => {
    // Automatically switch to backup live stream ID if primary ID is rotated or restricted
    setFallbackIndex((prev) => {
      const nextIdx = prev + 1;
      if (nextIdx < activeChannel.backupYoutubeIds.length) {
        return nextIdx;
      }
      return prev;
    });
  }, [activeChannel]);

  const filteredChannels = useMemo(() => {
    if (selectedCategory === 'all') return LIVE_CHANNELS;
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
          <ChevronLeft size={24} color="#fff" />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.liveHeaderPill}>
            <View style={styles.liveDot} />
            <REDText size={12} weight="bold" color="#fff" style={{ letterSpacing: 0.8 }}>
              LIVE TV
            </REDText>
          </View>
          <REDText size={11} color="rgba(255,255,255,0.5)" style={{ marginLeft: 8 }}>
            24/7 Global Channels
          </REDText>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Pinned 16:9 Live Broadcast Frame */}
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

      {/* Active Broadcast Info Banner */}
      <View style={styles.activeChannelBanner}>
        <View style={styles.activeBannerTopRow}>
          <View style={styles.onAirBadge}>
            <View style={styles.onAirDot} />
            <REDText size={10} weight="bold" color="#fff">
              ON AIR
            </REDText>
          </View>
          <View style={styles.categoryTag}>
            <REDText size={10} weight="semibold" color="rgba(255,255,255,0.8)">
              {activeChannel.categoryLabel}
            </REDText>
          </View>
          {activeChannel.telemetryTag && (
            <View style={styles.telemetryTag}>
              <REDText size={10} weight="bold" color="#fff">
                {activeChannel.telemetryTag}
              </REDText>
            </View>
          )}
          <View style={styles.viewersBadge}>
            <Users size={11} color="rgba(255,255,255,0.6)" />
            <REDText size={11} color="rgba(255,255,255,0.6)" style={{ marginLeft: 4 }}>
              {activeChannel.viewersLabel}
            </REDText>
          </View>
        </View>

        <REDText size={18} weight="bold" color="#fff" style={{ marginTop: 6 }}>
          {activeChannel.name}
        </REDText>
        <REDText size={13} weight="semibold" color="rgba(255,255,255,0.75)" style={{ marginTop: 2 }}>
          {activeChannel.currentProgram}
        </REDText>
      </View>

      {/* Category Filter Pills */}
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
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillActive,
                ]}
              >
                <REDText
                  size={12}
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

      {/* Live Guide Channel List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
      >
        <REDText
          size={13}
          weight="bold"
          color="rgba(255,255,255,0.45)"
          style={{ marginBottom: 10, letterSpacing: 0.6 }}
        >
          LIVE CHANNELS ({filteredChannels.length})
        </REDText>

        {filteredChannels.map((channel) => {
          const isCurrent = channel.id === activeChannel.id;
          return (
            <Pressable
              key={channel.id}
              onPress={() => handleSelectChannel(channel)}
              style={({ pressed }) => [
                styles.channelRow,
                isCurrent && styles.channelRowActive,
                pressed && { opacity: 0.82 },
              ]}
            >
              {/* 16:9 Channel Preview Thumbnail */}
              <View style={styles.channelThumbBox}>
                <RNImage
                  source={{ uri: channel.thumbnail }}
                  style={styles.channelThumbImg}
                  resizeMode="cover"
                />
                <View style={styles.channelThumbOverlay}>
                  {isCurrent ? (
                    <View style={styles.playingIndicatorBadge}>
                      <Radio size={12} color="#fff" />
                      <REDText size={9} weight="bold" color="#fff" style={{ marginLeft: 3 }}>
                        LIVE
                      </REDText>
                    </View>
                  ) : (
                    <View style={styles.thumbPlayCircle}>
                      <Play fill="#fff" color="#fff" size={12} style={{ marginLeft: 1 }} />
                    </View>
                  )}
                </View>
              </View>

              {/* Channel Metadata */}
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <REDText
                    size={15}
                    weight="bold"
                    color={isCurrent ? THEME.colors.red : '#fff'}
                    numberOfLines={1}
                  >
                    {channel.name}
                  </REDText>
                </View>

                <REDText
                  size={12}
                  color="rgba(255,255,255,0.75)"
                  numberOfLines={1}
                  style={{ marginTop: 3 }}
                >
                  {channel.currentProgram}
                </REDText>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <REDText size={11} color="rgba(255,255,255,0.45)">
                    {channel.categoryLabel}
                  </REDText>
                  <REDText size={11} color="rgba(255,255,255,0.3)">•</REDText>
                  <REDText size={11} color="rgba(255,255,255,0.45)">
                    {channel.viewersLabel}
                  </REDText>
                </View>
              </View>

              {/* Right Status Pill */}
              <View style={[styles.watchBtn, isCurrent && styles.watchBtnActive]}>
                <REDText size={11} weight="bold" color="#fff">
                  {isCurrent ? 'WATCHING' : 'WATCH'}
                </REDText>
              </View>
            </Pressable>
          );
        })}
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
    paddingBottom: 12,
    backgroundColor: '#0b0c10',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.red,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
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
  activeChannelBanner: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#13151d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  activeBannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onAirBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.6)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onAirDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: THEME.colors.red,
    marginRight: 5,
  },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  telemetryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterPillActive: {
    backgroundColor: THEME.colors.red,
    borderColor: THEME.colors.red,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#14161f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  channelRowActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderColor: 'rgba(229, 9, 20, 0.45)',
  },
  channelThumbBox: {
    width: 104,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  channelThumbImg: {
    width: '100%',
    height: '100%',
  },
  channelThumbOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.red,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  thumbPlayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  watchBtnActive: {
    backgroundColor: THEME.colors.red,
  },
});
