import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCard } from "@/components/ProductCard";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { ThemePreference, useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

const SKIN_TYPE_LABELS: Record<string, string> = {
  grasse: "Grasse",
  seche: "Sèche",
  mixte: "Mixte",
  sensible: "Sensible",
  normale: "Normale",
};

const CONCERN_LABELS: Record<string, string> = {
  acne: "Acné",
  points_noirs: "Points noirs",
  pores_dilates: "Pores dilatés",
  cicatrices: "Cicatrices",
  teint_terne: "Teint terne",
  rougeurs: "Rougeurs",
};

const GOAL_LABELS: Record<string, string> = {
  reduire_acne: "Réduire l'acné",
  glow_up: "Glow up général",
  minimaliste: "Routine minimaliste",
  comprendre: "Comprendre les ingrédients",
};

function SectionRow({
  icon,
  label,
  value,
  onPress,
  rightEl,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightEl?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.primaryDim }]}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
        {value && (
          <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{value}</Text>
        )}
      </View>
      {rightEl || (onPress && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />)}
    </Pressable>
  );
}

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "light", label: "Clair", icon: "sun" },
  { value: "dark", label: "Sombre", icon: "moon" },
  { value: "system", label: "Système", icon: "smartphone" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, resetProfile } = useProfile();
  const { scanHistory, favorites, getProductById } = useApp();
  const { preference, setPreference } = useTheme();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"profil" | "historique" | "reglages">("profil");

  const historyProducts = scanHistory
    .slice(0, 20)
    .map((h) => getProductById(h.productId))
    .filter(Boolean);

  const handleReset = () => {
    Alert.alert(
      "Réinitialiser le profil",
      "Toutes tes données seront effacées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réinitialiser",
          style: "destructive",
          onPress: async () => {
            await resetProfile();
            router.replace("/auth");
          },
        },
      ]
    );
  };

  const TABS = [
    { id: "profil", label: "Profil" },
    { id: "historique", label: "Historique" },
    { id: "reglages", label: "Réglages" },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Profil</Text>
        <Pressable
          style={[styles.premiumBtn, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "50" }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Feather name="zap" size={14} color={colors.primary} />
          <Text style={[styles.premiumText, { color: colors.primary }]}>Premium</Text>
        </Pressable>
      </View>

      <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryDim }]}>
          <Text style={[styles.avatarLetter, { color: colors.primary }]}>
            {(profile.firstName || "U").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{profile.firstName}</Text>
          <Text style={[styles.userType, { color: colors.textSecondary }]}>
            {profile.accountType === "premium" ? "Premium" : profile.accountType === "guest" ? "Invité" : "Gratuit"}
            {profile.skinType ? ` · Peau ${SKIN_TYPE_LABELS[profile.skinType] || ""}` : ""}
          </Text>
        </View>
        <Pressable
          style={[styles.editBtn, { borderColor: colors.border }]}
          onPress={() => router.push("/edit-profile")}
        >
          <Feather name="edit-2" size={14} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab) => (
            <Pressable
              key={tab.id}
              style={styles.tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.id);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.id ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.tabIndicator,
                  { backgroundColor: activeTab === tab.id ? colors.primary : "transparent" },
                ]}
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "profil" && (
          <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>TON PROFIL DE PEAU</Text>
              <SectionRow
                icon="droplet"
                label="Type de peau"
                value={profile.skinType ? SKIN_TYPE_LABELS[profile.skinType] : "Non renseigné"}
              />
              <SectionRow
                icon="target"
                label="Problèmes"
                value={
                  profile.concerns.length > 0
                    ? profile.concerns.map((c) => CONCERN_LABELS[c]).join(", ")
                    : "Aucun"
                }
              />
              <SectionRow
                icon="flag"
                label="Objectif"
                value={profile.goal ? GOAL_LABELS[profile.goal] : "Non renseigné"}
              />
            </View>

            {profile.allergenes.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>MES ALLERGÈNES</Text>
                <View style={styles.allergenList}>
                  {profile.allergenes.map((a, i) => (
                    <View
                      key={i}
                      style={[styles.allergenTag, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "40" }]}
                    >
                      <Feather name="alert-circle" size={12} color={colors.danger} />
                      <Text style={[styles.allergenText, { color: colors.danger }]}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>STATISTIQUES</Text>
              <SectionRow icon="package" label="Produits scannés" value={String(scanHistory.length)} />
              <SectionRow icon="bookmark" label="Favoris" value={String(favorites.length)} />
            </View>
          </>
        )}

        {activeTab === "historique" && (
          <>
            {historyProducts.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="clock" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun scan</Text>
              </View>
            ) : (
              historyProducts.map((p) => (
                <ProductCard key={p!.id} product={p!} personalScore={72} />
              ))
            )}
          </>
        )}

        {activeTab === "reglages" && (
          <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>APPARENCE</Text>
              <View style={styles.themeRow}>
                {THEME_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: preference === opt.value ? colors.primaryDim : colors.surfaceElevated,
                        borderColor: preference === opt.value ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPreference(opt.value);
                    }}
                  >
                    <Feather
                      name={opt.icon as any}
                      size={20}
                      color={preference === opt.value ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.themeLabel,
                        { color: preference === opt.value ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>COMPTE</Text>
              <SectionRow icon="user" label="Compte" value={profile.accountType === "guest" ? "Invité" : profile.accountType === "premium" ? "Premium" : "Gratuit"} />
              <SectionRow
                icon="log-out"
                label="Se déconnecter"
                onPress={() => {
                  Alert.alert("Déconnexion", "Tu seras redirigé vers l'écran de connexion.", [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Se déconnecter",
                      onPress: async () => {
                        await signOut();
                        router.replace("/auth");
                      },
                    },
                  ]);
                }}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>DONNÉES</Text>
              <SectionRow
                icon="trash-2"
                label="Supprimer mes données"
                onPress={handleReset}
              />
            </View>

            <View style={[styles.appInfo, { borderColor: colors.border }]}>
              <Text style={[styles.appInfoText, { color: colors.mutedForeground }]}>
                SkinScan v1.0.0 · Fait avec ❤️ pour ta peau
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  premiumBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  premiumText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontSize: 22, fontFamily: "Inter_700Bold" },
  userName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  userType: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabsRow: {
    height: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  tabsContent: { paddingHorizontal: 20, height: 44, alignItems: "flex-end" },
  tab: {
    paddingHorizontal: 14,
    paddingBottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  tabIndicator: { height: 2, width: "100%", borderRadius: 1, marginTop: 8 },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold", paddingBottom: 2 },
  content: { paddingHorizontal: 20, gap: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 2 },
  allergenList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
  },
  allergenTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  allergenText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  themeRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
  },
  themeLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  emptySubtext: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  appInfo: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 16, alignItems: "center" },
  appInfoText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
