import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  feature?: string;
}

export function GuestGate({ visible, onClose, feature = "cette fonctionnalité" }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();

  if (user) return null;

  const handleLogin = () => {
    onClose();
    router.push("/auth");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={[styles.iconWrap, { backgroundColor: colors.primaryDim }]}>
            <Feather name="lock" size={26} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Compte requis
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Crée un compte gratuit pour accéder à {feature} et synchroniser tes données.
          </Text>

          <View style={styles.perks}>
            {[
              { icon: "bookmark", text: "Sauvegarde tes produits favoris" },
              { icon: "list", text: "Construis ta routine personnalisée" },
              { icon: "cloud", text: "Synchronisation multi-appareils" },
            ].map((p) => (
              <View key={p.icon} style={styles.perkRow}>
                <View style={[styles.perkIcon, { backgroundColor: colors.primaryDim }]}>
                  <Feather name={p.icon as any} size={14} color={colors.primary} />
                </View>
                <Text style={[styles.perkText, { color: colors.textSecondary }]}>{p.text}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleLogin();
            }}
          >
            <Text style={styles.loginBtnText}>Créer un compte gratuit</Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
              Pas maintenant
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
    gap: 14,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginVertical: 10,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  perks: { alignSelf: "stretch", gap: 10, marginTop: 4 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  perkIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  perkText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 6,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  cancelBtn: { paddingVertical: 8 },
  cancelText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
