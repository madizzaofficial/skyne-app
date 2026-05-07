import { initializeApp, getApps } from "firebase/app";
import { Platform } from "react-native";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use AsyncStorage persistence on native to keep auth state between sessions
function buildAuth() {
  if (Platform.OS !== "web") {
    // Dynamic require avoids a webpack warning on web
    const { initializeAuth, getReactNativePersistence } = require("firebase/auth");
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    try {
      return initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      // Already initialised (hot reload)
      const { getAuth } = require("firebase/auth");
      return getAuth(app);
    }
  }
  const { getAuth } = require("firebase/auth");
  return getAuth(app);
}

export const auth = buildAuth();
export const db = getFirestore(app);
export default app;
