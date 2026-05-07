import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemePreference = "dark" | "light" | "system";

interface ThemeContextType {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType>({
  preference: "system",
  setPreference: () => {},
  resolvedTheme: "dark",
});

const THEME_KEY = "@skinscan_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === "dark" || v === "light" || v === "system") {
        setPreferenceState(v);
      }
    });
  }, []);

  const setPreference = useCallback(async (p: ThemePreference) => {
    setPreferenceState(p);
    await AsyncStorage.setItem(THEME_KEY, p);
  }, []);

  const resolvedTheme: "dark" | "light" =
    preference === "system"
      ? systemScheme === "light"
        ? "light"
        : "dark"
      : preference;

  return (
    <ThemeContext.Provider value={{ preference, setPreference, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
