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
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();
  const { updateProfile } = useProfile();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!firstName.trim()) { setError("Entre ton prénom."); return; }
    if (!email.trim()) { setError("Entre ton email."); return; }
    if (password.length < 6) { setError("Mot de passe trop court (6 caractères minimum)."); return; }
    if (password !== confirmPw) { setError("Les mots de passe ne correspondent pas."); return; }

    setLoading(true);
    try {
      await signUp(email.trim(), password, firstName.trim());
      await updateProfile({ firstName: firstName.trim(), accountType: "free" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Go to onboarding quiz
      router.replace("/onboarding");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé. Connecte-toi à la place.");
      } else if (code === "auth/invalid-email") {
        setError("Adresse email invalide.");
      } else if (code === "auth/network-request-failed") {
        setError("Problème réseau. Vérifie ta connexion.");
      } else {
        setError("Erreur inattendue. Réessaie.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Back header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={16} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.textPrimary }]}>Créer un compte</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Steps indicator */}
        <View style={styles.stepsRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.stepWrap}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: s === 1 ? colors.primary : colors.card,
                    borderColor: s === 1 ? colors.primary : colors.border,
                  },
                ]}
              >
                {s === 1 ? (
                  <Text style={styles.stepDotText}>1</Text>
                ) : (
                  <Text style={[styles.stepDotText, { color: colors.mutedForeground }]}>{s}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, { color: s === 1 ? colors.primary : colors.mutedForeground }]}>
                {s === 1 ? "Compte" : s === 2 ? "Profil peau" : "Routine"}
              </Text>
              {s < 3 && (
                <View style={[styles.stepLine, { backgroundColor: s < 1 ? colors.primary : colors.border }]} />
              )}
            </View>
          ))}
        </View>

        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Tes informations</Text>
        <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
          Crée ton compte en quelques secondes, ensuite on personnalise ton expérience.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Prénom</Text>
            <TextInput
              style={inputStyle}
              placeholder="Ton prénom"
              placeholderTextColor={colors.mutedForeground}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={inputStyle}
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
                style={[inputStyle, { flex: 1 }]}
                placeholder="6 caractères minimum"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <Pressable
                style={[styles.eyeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowPw((p) => !p)}
              >
                <Feather name={showPw ? "eye-off" : "eye"} size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirmer le mot de passe</Text>
            <TextInput
              style={inputStyle}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              value={confirmPw}
              onChangeText={setConfirmPw}
              secureTextEntry={!showPw}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
          </View>

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "40" }]}>
              <Feather name="alert-circle" size={14} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          <Pressable
            style={[styles.nextBtn, { backgroundColor: loading ? colors.mutedForeground : colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>Continuer</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </Pressable>

          <Text style={[styles.legalText, { color: colors.mutedForeground }]}>
            En créant un compte, tu acceptes nos conditions d'utilisation et notre politique de confidentialité.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  stepsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 8 },
  stepWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  stepLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  stepLine: { width: 28, height: 1.5, marginHorizontal: 4 },
  stepTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginLeft: 2 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  pwRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  eyeBtn: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  nextBtn: { borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, minHeight: 52 },
  nextBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  legalText: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16 },
});
