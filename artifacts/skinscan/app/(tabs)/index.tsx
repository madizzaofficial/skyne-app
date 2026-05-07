import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useApp } from "@/context/AppContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";
import { MOCK_PRODUCTS } from "@/constants/mockData";

function RoutineProductItem({
  productId,
  moment,
  done,
}: {
  productId: string;
  moment: "matin" | "soir";
  done: boolean;
}) {
  const colors = useColors();
  const { getProductById, toggleRoutineDone } = useApp();
  const product = getProductById(productId);
  if (!product) return null;

  return (
    <Pressable
      style={[
        styles.routineItem,
        { backgroundColor: colors.card, borderColor: done ? colors.success + "40" : colors.border },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleRoutineDone(productId, moment);
      }}
    >
      <View
        style={[
          styles.routineCheck,
          { backgroundColor: done ? colors.success : "transparent", borderColor: done ? colors.success : colors.border },
        ]}
      >
        {done && <Feather name="check" size={12} color="#fff" />}
      </View>
      <Text style={[styles.routineProductName, { color: done ? colors.textSecondary : colors.textPrimary }]} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={[styles.routineBrand, { color: colors.textSecondary }]}>{product.brand}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const { scanHistory, getProductById, getIncompatibilities, routine, routineScore } = useApp();

  const recentProducts = scanHistory
    .slice(0, 5)
    .map((h) => getProductById(h.productId))
    .filter(Boolean);

  const morningRoutine = routine.filter((r) => r.moment === "matin");
  const eveningRoutine = routine.filter((r) => r.moment === "soir");
  const incompatibilities = getIncompatibilities();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bonsoir" : "Bonsoir";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting},</Text>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{profile.firstName}</Text>
        </View>
        <View style={[styles.scorePill, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "40" }]}>
          <Text style={[styles.scoreLabel, { color: colors.primary }]}>Routine</Text>
          <Text style={[styles.scoreValue, { color: colors.primary }]}>{routineScore}%</Text>
        </View>
      </View>

      {/* CTAs */}
      <View style={styles.ctas}>
        <Pressable
          style={[styles.ctaPrimary, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/scanner-modal");
          }}
        >
          <Feather name="camera" size={20} color="#fff" />
          <Text style={styles.ctaPrimaryText}>Scanner un produit</Text>
        </Pressable>
        <Pressable
          style={[styles.ctaSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/compare");
          }}
        >
          <Feather name="bar-chart-2" size={18} color={colors.textPrimary} />
          <Text style={[styles.ctaSecondaryText, { color: colors.textPrimary }]}>Comparer</Text>
        </Pressable>
      </View>

      {/* Quick actions */}
      <View style={[styles.quickActions, { marginBottom: 28 }]}>
        <Pressable
          style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/scanner-modal");
          }}
        >
          <Feather name="edit-3" size={16} color={colors.textPrimary} />
          <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Analyse INCI</Text>
        </Pressable>
        <Pressable
          style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/catalogue");
          }}
        >
          <Feather name="search" size={16} color={colors.textPrimary} />
          <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Rechercher</Text>
        </Pressable>
        <Pressable
          style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/add-product");
          }}
        >
          <Feather name="plus" size={16} color={colors.textPrimary} />
          <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Ajouter</Text>
        </Pressable>
      </View>

      {/* Incompatibility Alerts */}
      {incompatibilities.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Alertes" />
          {incompatibilities.map((inc, i) => (
            <View
              key={i}
              style={[styles.alertCard, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "40" }]}
            >
              <Feather name="alert-triangle" size={16} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: colors.danger }]}>Incompatibilité détectée</Text>
                <Text style={[styles.alertText, { color: colors.textSecondary }]}>
                  {inc.reason}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Routine du jour */}
      <View style={styles.section}>
        <SectionHeader title="Ta routine du jour" action="Voir tout" onAction={() => router.push("/(tabs)/routine")} />
        {morningRoutine.length > 0 && (
          <>
            <View style={styles.momentHeader}>
              <Feather name="sun" size={14} color={colors.warning} />
              <Text style={[styles.momentLabel, { color: colors.warning }]}>Matin</Text>
            </View>
            {morningRoutine.map((r) => (
              <RoutineProductItem key={r.productId + "matin"} productId={r.productId} moment="matin" done={r.done} />
            ))}
          </>
        )}
        {eveningRoutine.length > 0 && (
          <>
            <View style={[styles.momentHeader, { marginTop: 12 }]}>
              <Feather name="moon" size={14} color={colors.primary} />
              <Text style={[styles.momentLabel, { color: colors.primary }]}>Soir</Text>
            </View>
            {eveningRoutine.map((r) => (
              <RoutineProductItem key={r.productId + "soir"} productId={r.productId} moment="soir" done={r.done} />
            ))}
          </>
        )}
        {morningRoutine.length === 0 && eveningRoutine.length === 0 && (
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Feather name="plus-circle" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Ajoute des produits à ta routine depuis une fiche produit
            </Text>
          </View>
        )}
      </View>

      {/* Récemment scannés */}
      {recentProducts.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Récemment scannés" />
          {recentProducts.map((p) => (
            <ProductCard key={p!.id} product={p!} personalScore={78} />
          ))}
        </View>
      )}

      {/* Découvrir */}
      <View style={styles.section}>
        <SectionHeader title="Découvrir pour ta peau" action="Voir tout" onAction={() => router.push("/(tabs)/catalogue")} />
        {MOCK_PRODUCTS.slice(1, 4).map((p) => (
          <ProductCard key={p.id} product={p} personalScore={82 + Math.floor(Math.random() * 15)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  name: { fontSize: 28, fontFamily: "Inter_700Bold" },
  scorePill: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  scoreLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  scoreValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  ctas: { flexDirection: "row", gap: 10, marginBottom: 28 },
  ctaPrimary: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  ctaSecondary: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  ctaSecondaryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  quickActions: { flexDirection: "row", gap: 8 },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  quickActionText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  section: { marginBottom: 28 },
  alertCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  alertTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  alertText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  momentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  momentLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  routineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  routineCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  routineProductName: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  routineBrand: { fontSize: 12, fontFamily: "Inter_400Regular" },
  emptyBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
});
