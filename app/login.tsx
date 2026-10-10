import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions, TextInput } from 'react-native';
import { THEME } from '../src/constants/theme';
import { REDText } from '../src/components/ui/REDText';
import { REDButton } from '../src/components/ui/REDButton';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { auth } from '../src/services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '40019675990-1q0nrenjaopjtavkfshu39gfjermnth7.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@murat/red-app',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential).then(() => {
        router.back();
      }).catch(err => {
        Alert.alert('Google Error', err.message);
      }).finally(() => setLoading(false));
    }
  }, [response]);



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
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', height: 56, borderRadius: 16, marginTop: 8 }}
            onPress={() => promptAsync()}
            disabled={!request || loading}
          >
            <REDText weight="bold" color="#000">{loading ? 'Connecting...' : 'Continue with Google'}</REDText>
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, height: 60, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'Inter-Medium' },
  toggleBtn: { marginTop: 32, alignItems: 'center', padding: 16 }
});
