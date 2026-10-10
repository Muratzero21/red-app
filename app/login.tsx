import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { THEME } from '../src/constants/theme';
import { REDText } from '../src/components/ui/REDText';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { auth } from '../src/services/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '40019675990-1q0nrenjaopjtavkfshu39gfjermnth7.apps.googleusercontent.com',
});

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      
      if (!idToken) throw new Error('Token error');
      
      const cred = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, cred);
      router.back();
    } catch(e: any) {
      if (e.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Giriş Hatası', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(229, 9, 20, 0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Back Button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft color="#fff" size={32} />
      </Pressable>

      <View style={styles.content}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <REDText weight="heavy" size={48} color={THEME.colors.red} style={{ letterSpacing: -2 }}>RED</REDText>
          <REDText size={16} color="rgba(255,255,255,0.6)" style={{ marginTop: 8 }}>
            Join the ultimate movie network.
          </REDText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Pressable 
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <REDText weight="bold" color="#000">
              {loading ? 'Connecting...' : 'Continue with Google'}
            </REDText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10, padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  content: { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
  header: { marginBottom: 48, alignItems: 'center' },
  form: { gap: 16 },
  googleBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#fff', 
    height: 56, 
    borderRadius: 16, 
    marginTop: 8 
  }
});
