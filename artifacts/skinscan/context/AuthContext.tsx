import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  redirectLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectLoading, setRedirectLoading] = useState(false);

  useEffect(() => {
    // On web: check for the result of a signInWithRedirect call
    if (Platform.OS === "web") {
      setRedirectLoading(true);
      getRedirectResult(auth)
        .then((result) => {
          if (result?.user) {
            setUser(result.user);
          }
        })
        .catch(() => {})
        .finally(() => setRedirectLoading(false));
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
  };

  const signInWithGoogle = async () => {
    if (Platform.OS === "web") {
      const provider = new GoogleAuthProvider();
      // signInWithRedirect is more compatible with iframe / restricted browser environments.
      // The page redirects to Google and back. After redirect, getRedirectResult() above resolves.
      await signInWithRedirect(auth, provider);
    }
    // On native: would require expo-auth-session + Google OAuth credentials
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, redirectLoading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
