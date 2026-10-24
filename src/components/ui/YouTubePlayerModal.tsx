import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Modal, Dimensions, Pressable, StatusBar, Linking } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { X, ExternalLink } from 'lucide-react-native';
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
const VIDEO_HEIGHT = Math.min(width * (9 / 16), 320);

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

  const handleOpenExternal = () => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(`vnd.youtube://${videoId}`).catch(() => {
      Linking.openURL(url);
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.backdrop}>
        <StatusBar hidden={false} barStyle="light-content" />

        {/* Top Header Bar */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <REDText size={11} weight="bold" color={THEME.colors.red} style={{ letterSpacing: 1 }}>
              RED PLAYER
            </REDText>
            {title ? (
              <REDText size={15} weight="bold" color="#fff" numberOfLines={1} style={{ marginTop: 2 }}>
                {title}
              </REDText>
            ) : null}
          </View>

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }]}
          >
            <X color="#fff" size={20} />
          </Pressable>
        </View>

        {/* Video Player Box using Official React Native YouTube Iframe */}
        <View style={styles.playerContainer}>
          <YoutubePlayer
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

        {/* Bottom Details Bar */}
        <View style={styles.detailsContainer}>
          {subtitle ? (
            <REDText size={13} color="rgba(255,255,255,0.7)" style={{ lineHeight: 18 }} numberOfLines={3}>
              {subtitle}
            </REDText>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={styles.badge}>
                <REDText size={10} weight="bold" color="#fff">FULL HD</REDText>
              </View>
              <View style={[styles.badge, { borderColor: THEME.colors.red, backgroundColor: 'rgba(229,9,20,0.15)' }]}>
                <REDText size={10} weight="bold" color={THEME.colors.red}>YOUTUBE</REDText>
              </View>
            </View>

            {/* Quick Open in YouTube Button */}
            <Pressable
              onPress={handleOpenExternal}
              style={({ pressed }) => [styles.externalBtn, pressed && { opacity: 0.7 }]}
            >
              <ExternalLink size={13} color="#fff" style={{ marginRight: 6 }} />
              <REDText size={12} weight="semibold" color="#fff">Open App</REDText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  playerContainer: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  externalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
});
