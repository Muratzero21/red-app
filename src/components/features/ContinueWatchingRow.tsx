import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, X, Info } from 'lucide-react-native';
import { REDText } from '../ui/REDText';
import { THEME } from '../../constants/theme';
import { ContinueWatchingItem, useWatchProgressStore } from '../../store/useWatchProgressStore';

interface ContinueWatchingRowProps {
  onResumePress: (item: ContinueWatchingItem) => void;
  onInfoPress: (item: ContinueWatchingItem) => void;
}

const CARD_WIDTH = 216;
const THUMB_HEIGHT = 122;

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  onResumePress,
  onInfoPress,
}) => {
  const continueWatching = useWatchProgressStore((state) => state.continueWatching);
  const removeFromContinueWatching = useWatchProgressStore(
    (state) => state.removeFromContinueWatching
  );

  if (!continueWatching || continueWatching.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <REDText size={19} weight="bold" color="#fff" style={{ letterSpacing: 0.3 }}>
          Continue Watching
        </REDText>
      </View>

      <FlatList
        data={continueWatching}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `${item.showId}-s${item.seasonNumber}-e${item.episodeNumber}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const thumbUri =
            item.thumbnail ||
            item.backdropUrl ||
            (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : null) ||
            item.posterUrl;
          const progressPct = Math.round(Math.max(6, Math.min(98, (item.progress || 0.12) * 100)));

          return (
            <View style={styles.card}>
              {/* Top 16:9 Thumbnail Area (Tapping resumes episode immediately) */}
              <Pressable
                onPress={() => onResumePress(item)}
                style={({ pressed }) => [
                  styles.thumbWrapper,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
              >
                {thumbUri ? (
                  <Image
                    source={{ uri: thumbUri }}
                    style={styles.thumbImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    allowDownscaling={false}
                  />
                ) : (
                  <View style={[styles.thumbImage, { backgroundColor: '#1a1d24' }]} />
                )}

                <LinearGradient
                  colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.35)', 'rgba(10,11,15,0.92)']}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFill}
                />

                {/* Top-Right Remove Button */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    removeFromContinueWatching(item.showId);
                  }}
                  hitSlop={10}
                  style={styles.removeBtn}
                >
                  <X size={13} color="rgba(255,255,255,0.85)" />
                </Pressable>

                {/* Center Play Circle */}
                <View style={styles.playOverlay}>
                  <View style={styles.playCircle}>
                    <Play fill="#fff" color="#fff" size={18} style={{ marginLeft: 2 }} />
                  </View>
                </View>

                {/* Episode Tag inside bottom-left of thumbnail */}
                <View style={styles.thumbBadgeRow}>
                  <View style={styles.seBadge}>
                    <REDText size={10} weight="bold" color="#fff">
                      S{item.seasonNumber}:E{item.episodeNumber}
                    </REDText>
                  </View>
                  <REDText size={11} weight="semibold" color="rgba(255,255,255,0.8)" numberOfLines={1}>
                    {item.remainingMinutes}m left
                  </REDText>
                </View>

                {/* Netflix Red Progress Bar at the bottom of the thumbnail */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
              </Pressable>

              {/* Bottom Info Bar */}
              <Pressable
                onPress={() => onInfoPress(item)}
                style={({ pressed }) => [
                  styles.infoBar,
                  pressed && { backgroundColor: 'rgba(255,255,255,0.08)' },
                ]}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <REDText size={13} weight="bold" color="#fff" numberOfLines={1}>
                    {item.showTitle}
                  </REDText>
                  <REDText
                    size={11}
                    color="rgba(255,255,255,0.55)"
                    numberOfLines={1}
                    style={{ marginTop: 2 }}
                  >
                    {item.episodeTitle}
                  </REDText>
                </View>
                <View style={styles.infoIconBtn}>
                  <Info size={16} color="rgba(255,255,255,0.75)" />
                </View>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 10,
    backgroundColor: '#161821',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  thumbWrapper: {
    width: CARD_WIDTH,
    height: THUMB_HEIGHT,
    position: 'relative',
    backgroundColor: '#12141c',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbBadgeRow: {
    position: 'absolute',
    bottom: 9,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.red,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#161821',
  },
  infoIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
