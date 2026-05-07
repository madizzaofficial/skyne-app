// Native: Google auth requires a development build (not available in Expo Go)
// Shows a clear message to the user
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function GoogleAuthButton({ onError }: Props) {
  const colors = useColors();

  return (
    <Pressable
      style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() =>
        onError(
          "Google Sign-In n'est pas disponible dans Expo Go. Utilise email/mot de passe, ou connecte-toi depuis le navigateur web."
        )
      }
    >
      <View style={[styles.gIcon, { backgroundColor: "#EAF1FB" }]}>
        <Text style={styles.gIconText}>G</Text>
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Google (web uniquement)
      </Text>
      <Feather name="info" size={14} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 52,
    opacity: 0.7,
  },
  gIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  gIconText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#4285F4" },
  label: { fontSize: 15, fontFamily: "Inter_500Medium", flex: 1 },
});
