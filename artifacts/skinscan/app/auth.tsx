import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, redirectLoading } = useAuth();
  const { updateProfile, hasOnboarded } = useProfile();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const navigate = (isOnboarded: boolean) => {
    router.replace(isOnboarded ? "/(tabs)" : "/onboarding");
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Remplis l'email et le mot de passe.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigate(hasOnboarded);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Email ou mot de passe incorrect.");
      } else if (code === "auth/too-many-requests") {
        setError("Trop de tentatives. Réessaie dans quelques minutes.");
      } else if (code === "auth/network-request-failed") {
        setError("Problème réseau. Vérifie ta connexion.");
      } else if (code === "auth/unauthorized-domain") {
        setError(
          "Domaine non autorisé. Ajoute-le dans Firebase Console → Authentication → Authorized domains."
        );
      } else {
        setError("Erreur inattendue. Réessaie.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await updateProfile({ accountType: "guest", firstName: "Invité" });
    router.replace("/(tabs)");
  };

  if (redirectLoading) {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.redirectText, { color: colors.textSecondary }]}>
          Connexion en cours…
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View
            style={[
              styles.logoIcon,
              { backgroundColor: colors.primaryDim, borderColor: colors.primary + "40" },
            ]}
          >
            <Feather name="crosshair" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>SkinScan</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Analyse tes ingrédients.{"\n"}Protège ta peau.
          </Text>
        </View>

        {/* Login form */}
        <View style={styles.form}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Connexion
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="ton@email.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Mot de passe</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable
                style={[
                  styles.eyeBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowPw((p) => !p)}
              >
                <Feather
                  name={showPw ? "eye-off" : "eye"}
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          {!!error && (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: colors.dangerDim, borderColor: colors.danger + "40" },
              ]}
            >
              <Feather name="alert-circle" size={14} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          <Pressable
            style={[
              styles.loginBtn,
              { backgroundColor: loading ? colors.mutedForeground : colors.primary },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Se connecter</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.divLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.divText, { color: colors.mutedForeground }]}>ou</Text>
          <View style={[styles.divLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Google */}
        <GoogleAuthButton
          loading={googleLoading}
          setLoading={setGoogleLoading}
          onSuccess={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigate(hasOnboarded);
          }}
          onError={(msg) => setError(msg)}
        />

        {/* Register CTA */}
        <Pressable
          style={[styles.registerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/register");
          }}
        >
          <View style={[styles.registerIcon, { backgroundColor: colors.primaryDim }]}>
            <Feather name="user-plus" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.registerTitle, { color: colors.textPrimary }]}>
              Créer un compte
            </Text>
            <Text style={[styles.registerSub, { color: colors.textSecondary }]}>
              Inscription rapide, personnalise ton expérience
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>

        {/* Guest */}
        <Pressable
          style={[styles.guestBtn, { borderTopColor: colors.border }]}
          onPress={handleGuest}
        >
          <Text style={[styles.guestText, { color: colors.mutedForeground }]}>
            Continuer sans compte
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  redirectText: { marginTop: 16, fontSize: 15, fontFamily: "Inter_400Regular" },
  scroll: { paddingHorizontal: 24, gap: 20 },
  logoArea: { alignItems: "center", gap: 10, marginBottom: 4 },
  logoIcon: {
    width: 84,
    height: 84,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  appName: { fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.8, textTransform: "uppercase" },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginLeft: 2 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  pwRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  eyeBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  loginBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    minHeight: 52,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  divLine: { flex: 1, height: StyleSheet.hairlineWidth },
  divText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  registerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  registerTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  registerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  guestBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  guestText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
