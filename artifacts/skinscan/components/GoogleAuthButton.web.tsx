// Web implementation using Firebase signInWithRedirect
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function GoogleAuthButton({ loading, setLoading, onError }: Props) {
  const colors = useColors();
  const { signInWithGoogle } = useAuth();

  const handlePress = async () => {
    setLoading(true);
    try {
      // signInWithRedirect navigates away — auth state handled by onAuthStateChanged
      await signInWithGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/unauthorized-domain") {
        onError("Domaine non autorisé — ajoute-le dans Firebase Console → Authentication → Authorized domains.");
      } else {
        onError("Connexion Google impossible sur le web.");
      }
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <>
          <View style={[styles.gIcon, { backgroundColor: "#EAF1FB" }]}>
            <Text style={styles.gIconText}>G</Text>
          </View>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Continuer avec Google
          </Text>
          <Feather name="external-link" size={14} color={colors.mutedForeground} />
        </>
      )}
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
  },
  gIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  gIconText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#4285F4" },
  label: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
});
