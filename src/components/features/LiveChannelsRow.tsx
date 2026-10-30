import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ChevronRight } from 'lucide-react-native';
import { REDText } from '../ui/REDText';
import { THEME } from '../../constants/theme';
import { LIVE_CHANNELS, LiveChannel } from '../../constants/liveChannels';

interface LiveChannelsRowProps {
  onChannelPress: (channel: LiveChannel) => void;
  onSeeAllPress: () => void;
}

const CARD_WIDTH = 224;
const CARD_HEIGHT = 128;

export const LiveChannelsRow: React.FC<LiveChannelsRowProps> = ({
  onChannelPress,
  onSeeAllPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.livePulseDot} />
          <REDText size={19} weight="bold" color="#fff" style={{ letterSpacing: 0.3 }}>
            Live TV & 24/7 Channels
          </REDText>
        </View>

        <Pressable
          onPress={onSeeAllPress}
          style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.7 }]}
        >
          <REDText size={12} weight="bold" color={THEME.colors.red}>
            All Live
          </REDText>
          <ChevronRight size={14} color={THEME.colors.red} />
        </Pressable>
      </View>

      <FlatList
        data={LIVE_CHANNELS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onChannelPress(item)}
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={styles.thumbWrapper}>
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumbImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                allowDownscaling={false}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.35)', 'rgba(10,11,16,0.95)']}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFill}
              />

              {/* Top-left LIVE NOW pill */}
              <View style={styles.liveTag}>
                <View style={styles.liveTagDot} />
                <REDText size={9} weight="bold" color="#fff" style={{ letterSpacing: 0.6 }}>
                  LIVE
                </REDText>
              </View>

              {/* Top-right Category or Telemetry pill */}
              <View style={styles.categoryPill}>
                <REDText size={9} weight="bold" color="rgba(255,255,255,0.9)">
                  {item.telemetryTag || item.categoryLabel}
                </REDText>
              </View>

              {/* Center Play Button */}
              <View style={styles.playOverlay}>
                <View style={styles.playCircle}>
                  <Play fill="#fff" color="#fff" size={16} style={{ marginLeft: 2 }} />
                </View>
              </View>

              {/* Bottom Channel Title & Program */}
              <View style={styles.bottomInfo}>
                <REDText size={14} weight="bold" color="#fff" numberOfLines={1}>
                  {item.name}
                </REDText>
                <REDText
                  size={11}
                  color="rgba(255,255,255,0.7)"
                  numberOfLines={1}
                  style={{ marginTop: 1 }}
                >
                  {item.currentProgram}
                </REDText>
              </View>
            </View>
          </Pressable>
        )}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePulseDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: THEME.colors.red,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#151720',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  thumbWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  liveTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.red,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  categoryPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(229, 9, 20, 0.85)',
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
  },
});
