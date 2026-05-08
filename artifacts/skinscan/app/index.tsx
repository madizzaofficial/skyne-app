import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // wait for Firebase to resolve auth state

    if (user) {
      // Authenticated via Firebase — existing account, go straight to the app
      setDestination("/(tabs)");
      return;
    }

    // No Firebase user — check for guest/existing local profile
    (async () => {
      const [profile, onboarded] = await Promise.all([
        AsyncStorage.getItem("@skinscan_profile"),
        AsyncStorage.getItem("@skinscan_onboarded"),
      ]);
      const parsed = profile ? JSON.parse(profile) : null;
      const isOnboarded = onboarded === "true";

      if (!parsed || parsed.accountType === undefined) {
        setDestination("/auth");
      } else if (!isOnboarded) {
        setDestination("/onboarding");
      } else {
        setDestination("/(tabs)");
      }
    })();
  }, [user, authLoading]);

  if (!destination) return <View style={{ flex: 1, backgroundColor: "#0A0A0A" }} />;
  return <Redirect href={destination as any} />;
}
