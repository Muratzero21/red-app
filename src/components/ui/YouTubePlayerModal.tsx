import React, { useState } from 'react';
import { View, StyleSheet, Modal, Dimensions, Pressable, ActivityIndicator, StatusBar, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
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
  const [loading, setLoading] = useState(true);

  if (!visible || !videoId) return null;

  // Clean HTML with origin and autoplay permissions
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body, html { 
            background: #000; 
            width: 100%; 
            height: 100%; 
            overflow: hidden; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
          }
          .video-container { 
            position: relative; 
            width: 100%; 
            height: 100%; 
          }
          iframe { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            border: none; 
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&fs=1" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
            allowfullscreen>
          </iframe>
        </div>
      </body>
    </html>
  `;

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

        {/* Video Player Box */}
        <View style={styles.playerContainer}>
          <WebView
            source={{ 
              html: htmlContent,
              baseUrl: 'https://www.youtube.com'
            }}
            style={styles.webview}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            onLoadEnd={() => setLoading(false)}
            originWhitelist={['*']}
            mixedContentMode="always"
            userAgent="Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          />

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={THEME.colors.red} />
              <REDText size={13} color="rgba(255,255,255,0.7)" style={{ marginTop: 8 }}>
                Loading video...
              </REDText>
            </View>
          )}
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

            {/* Quick Open in YouTube Button if network blocks in-app embed */}
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
    position: 'relative',
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
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
