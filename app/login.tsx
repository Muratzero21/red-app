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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
GoogleSignin.configure({ webClientId: '40019675990-1q0nrenjaopjtavkfshu39gfjermnth7.apps.googleusercontent.com' });





const { width, height } = Dimensions.get('window');

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
      if (e.code !== 'SIGN_IN_CANCELLED') Alert.alert('Error', e.message);
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
      <Pressable onPress={handleGoogleLogin}
            disabled={loading}
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
