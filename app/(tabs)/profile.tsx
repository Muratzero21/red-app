import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Pressable, Image as RNImage } from 'react-native';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';
import { TopNavBar } from '../../src/components/ui/TopNavBar';
import { useWatchlistStore } from '../../src/store/useWatchlistStore';
import { Settings, Users, Film, Star, ChevronRight, Activity, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/useAuthStore';
import { REDButton } from '../../src/components/ui/REDButton';
import { auth } from '../../src/services/firebase';
import { signOut } from 'firebase/auth';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { watchlist } = useWatchlistStore();
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return null; // Loading Firebase Auth

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <View style={styles.avatarContainer}>
          <Users color="rgba(255,255,255,0.2)" size={64} style={{ marginBottom: 24 }} />
        </View>
        <REDText weight="bold" size={24} style={{ marginBottom: 12, textAlign: 'center' }}>Join the Community</REDText>
        <REDText size={14} color="rgba(255,255,255,0.5)" style={{ textAlign: 'center', marginBottom: 32 }}>
          Create an account to save your RED List across devices and connect with friends.
        </REDText>
        <REDButton title="Sign In / Sign Up" onPress={() => router.push('/login')} style={{ width: '100%', height: 56, borderRadius: 16 }} />
      </View>
    );
  }

  // Hesaplanan Istatistikler (Gercek watchlist uzerinden yari-dinamik)
  const watchedCount = watchlist.length > 0 ? 142 + watchlist.length : 142;
  const hoursWatched = Math.floor(watchedCount * 1.8);

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <REDText weight="bold" size={24}>Profile</REDText>
        <Pressable onPress={() => router.push('/(tabs)/settings')} style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.7 }]}>
          <Settings color="#fff" size={24} />
        </Pressable>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Cinematic Header & Avatar */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(229, 9, 20, 0.15)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.avatarContainer}>
            <RNImage source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatar} />
            <View style={styles.proBadge}>
              <REDText color="#fff" weight="heavy" size={10}>PRO</REDText>
            </View>
          </View>
          <REDText weight="bold" size={26} style={{ marginTop: 16 }}>{user.email?.split('@')[0] || 'User'}</REDText>
          <REDText color="rgba(255,255,255,0.5)" size={14} style={{ marginTop: 4 }}>🎬 Cinephile</REDText>
          
          <Pressable onPress={() => signOut(auth)} style={styles.editButton}>
            <REDText weight="bold" size={14} color="#fff">Sign Out</REDText>
          </Pressable>
          
          <View style={styles.headerStatsRow}>
            <View style={styles.headerStat}>
              <REDText weight="bold" size={16}>{watchedCount}</REDText>
              <REDText size={12} color="rgba(255,255,255,0.5)">Films</REDText>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <REDText weight="bold" size={16}>2.4K</REDText>
              <REDText size={12} color="rgba(255,255,255,0.5)">Followers</REDText>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <REDText weight="bold" size={16}>148</REDText>
              <REDText size={12} color="rgba(255,255,255,0.5)">Following</REDText>
            </View>
          </View>
        </View>

        {/* Viewing Habits (Premium Chart) */}
        <View style={styles.section}>
          <REDText weight="bold" size={18} style={styles.sectionTitle}>Viewing Habits</REDText>
          <View style={styles.glassCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Clock color={THEME.colors.red} size={18} style={{ marginRight: 8 }} />
              <REDText weight="bold" size={16}>{hoursWatched} Hours</REDText>
              <REDText color="rgba(255,255,255,0.5)" size={14} style={{ marginLeft: 6 }}>this year</REDText>
            </View>
            
            {/* Horizontal Stacked Bar */}
            <View style={styles.stackedBar}>
              <View style={[styles.barSegment, { flex: 5, backgroundColor: THEME.colors.red }]} />
              <View style={[styles.barSegment, { flex: 3, backgroundColor: '#ff7b00' }]} />
              <View style={[styles.barSegment, { flex: 2, backgroundColor: '#00bfff' }]} />
            </View>
            
            <View style={styles.legendRow}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: THEME.colors.red }]} /><REDText size={12} color="rgba(255,255,255,0.7)">Sci-Fi (50%)</REDText></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ff7b00' }]} /><REDText size={12} color="rgba(255,255,255,0.7)">Drama (30%)</REDText></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#00bfff' }]} /><REDText size={12} color="rgba(255,255,255,0.7)">Action (20%)</REDText></View>
            </View>
          </View>
        </View>

        {/* Letterboxd Style Top 4 */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
            <REDText weight="bold" size={18}>All-Time Favorites</REDText>
            <Pressable>
              <REDText color={THEME.colors.red} weight="bold" size={13}>Edit</REDText>
            </Pressable>
          </View>
          <View style={styles.top4Grid}>
             <View style={styles.top4Item}><RNImage source={{ uri: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg' }} style={styles.top4Poster} /></View>
             <View style={styles.top4Item}><RNImage source={{ uri: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' }} style={styles.top4Poster} /></View>
             <View style={styles.top4Item}><RNImage source={{ uri: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg' }} style={styles.top4Poster} /></View>
             <View style={styles.top4Item}><RNImage source={{ uri: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MvrIdqoP.jpg' }} style={styles.top4Poster} /></View>
          </View>
        </View>

        {/* Real Watchlist */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
            <REDText weight="bold" size={18}>My RED List ({watchlist.length})</REDText>
            <Pressable onPress={() => router.push('/(tabs)/watchlist')}>
              <ChevronRight color="rgba(255,255,255,0.5)" size={20} />
            </Pressable>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
            {watchlist.slice(0, 10).map(item => (
              <Pressable key={item.id} onPress={() => router.push(`/detail/${item.mediaType}/${item.id}`)}>
                <RNImage source={{ uri: item.posterUrl }} style={styles.miniPoster} />
              </Pressable>
            ))}
            {watchlist.length === 0 && (
              <View style={[styles.miniPoster, { backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }]}>
                <Film color="rgba(255,255,255,0.2)" size={32} />
                <REDText size={12} color="rgba(255,255,255,0.3)" style={{ marginTop: 8 }}>Empty</REDText>
              </View>
            )}
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  settingsBtn: { padding: 8, marginRight: -8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  header: { alignItems: 'center', paddingVertical: 32, position: 'relative' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)' },
  proBadge: { position: 'absolute', bottom: -5, alignSelf: 'center', backgroundColor: THEME.colors.red, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 2, borderColor: THEME.colors.background },
  headerStatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 24 },
  headerStat: { alignItems: 'center', minWidth: 60 },
  headerStatDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16 },
  section: { marginTop: 32 },
  sectionTitle: { paddingHorizontal: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  glassCard: { marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  stackedBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  barSegment: { height: '100%' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  top4Grid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  top4Item: { flex: 1, aspectRatio: 2/3, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  top4Poster: { width: '100%', height: '100%' },
  miniPoster: { width: 110, height: 165, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  editButton: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 }
});
