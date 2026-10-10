const fs = require('fs');
let text = fs.readFileSync('app/login.tsx', 'utf8');

text = text.replace(/import \* as WebBrowser from 'expo-web-browser';/g, '');
text = text.replace(/import \* as Google from 'expo-auth-session\/providers\/google';/g, '');
text = text.replace(/WebBrowser\.maybeCompleteAuthSession\(\);/g, '');

text = text.replace(
  /import \{ LinearGradient \} from 'expo-linear-gradient';/g,
  `import { LinearGradient } from 'expo-linear-gradient';\nimport { GoogleSignin } from '@react-native-google-signin/google-signin';\nGoogleSignin.configure({ webClientId: '40019675990-1q0nrenjaopjtavkfshu39gfjermnth7.apps.googleusercontent.com' });`
);

const newLogic = `  const handleGoogleLogin = async () => {
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
  };`;

text = text.replace(/const \[request, response, promptAsync\][\s\S]*?\[response\]\);/g, newLogic);
text = text.replace(/onPress=\{[\s\S]*?promptAsync\(\)\}/g, 'onPress={handleGoogleLogin}');
text = text.replace(/disabled=\{!request \|\| loading\}/g, 'disabled={loading}');

fs.writeFileSync('app/login.tsx', text);
console.log('Login updated!');
