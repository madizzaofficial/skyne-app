import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type SkinType = "grasse" | "seche" | "mixte" | "sensible" | "normale" | null;
export type SkinConcern = "acne" | "points_noirs" | "pores_dilates" | "cicatrices" | "teint_terne" | "rougeurs";
export type Goal = "reduire_acne" | "glow_up" | "minimaliste" | "comprendre" | null;
export type RoutineLevel = "aucune" | "basique" | "intermediaire" | "avancee" | null;

export interface UserProfile {
  firstName: string;
  skinType: SkinType;
  concerns: SkinConcern[];
  hasAllergies: boolean | null;
  allergenes: string[];
  hadReaction: boolean | null;
  goal: Goal;
  routineLevel: RoutineLevel;
  isComplete: boolean;
  accountType: "guest" | "free" | "premium";
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: "Utilisateur",
  skinType: null,
  concerns: [],
  hasAllergies: null,
  allergenes: [],
  hadReaction: null,
  goal: null,
  routineLevel: null,
  isComplete: false,
  accountType: "guest",
};

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetProfile: () => Promise<void>;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  getCompatibilityScore: (productId: string, allergenIds?: string[]) => number;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY = "@skinscan_profile";
const ONBOARDED_KEY = "@skinscan_onboarded";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [hasOnboarded, setHasOnboardedState] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [stored, onboarded] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(ONBOARDED_KEY),
      ]);
      if (stored) setProfile(JSON.parse(stored));
      if (onboarded === "true") setHasOnboardedState(true);
    } catch {}
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetProfile = async () => {
    setProfile(DEFAULT_PROFILE);
    setHasOnboardedState(false);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(ONBOARDED_KEY),
    ]);
  };

  const setHasOnboarded = async (v: boolean) => {
    setHasOnboardedState(v);
    await AsyncStorage.setItem(ONBOARDED_KEY, v ? "true" : "false");
  };

  const getCompatibilityScore = (productId: string, allergenIds: string[] = []): number => {
    if (!profile.skinType) return 70;
    let score = 85;
    if (allergenIds.length > 0) score -= allergenIds.length * 25;
    if (profile.skinType === "grasse" && Math.random() > 0.5) score += 5;
    if (profile.skinType === "sensible" && allergenIds.length === 0) score += 8;
    return Math.max(10, Math.min(100, score));
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        resetProfile,
        hasOnboarded,
        setHasOnboarded,
        getCompatibilityScore,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
