import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1LhGDyF90MZJ_6nTAMC6OUOC_Sa4Eesw",
  authDomain: "sole-30c3b.firebaseapp.com",
  projectId: "sole-30c3b",
  storageBucket: "sole-30c3b.firebasestorage.app",
  messagingSenderId: "40019675990",
  appId: "1:40019675990:web:c3eac2fb864de626dee4f7",
  measurementId: "G-WRMNFEMC5M"
};

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);
