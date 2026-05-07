import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function RoutineSection({ moment, label }: { moment: "matin" | "soir"; label: string }) {
  const colors = useColors();
  const router = useRouter();
  const { getRoutineProducts, removeFromRoutine, toggleRoutineDone } = useApp();
  const products = getRoutineProducts(moment);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Feather
            name={moment === "matin" ? "sun" : "moon"}
            size={18}
            color={moment === "matin" ? colors.warning : colors.primary}
          />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{label}</Text>
        </View>
        <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
          {products.filter((p) => p.item.done).length}/{products.length}
        </Text>
      </View>

      {products.length === 0 && (
        <Pressable
          style={[styles.emptyAdd, { borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/catalogue")}
        >
          <Feather name="plus" size={20} color={colors.textSecondary} />
          <Text style={[styles.emptyAddText, { color: colors.textSecondary }]}>
            Ajouter un produit
          </Text>
        </Pressable>
      )}

      {products.map(({ item, product }, index) => (
        <View key={product.id + moment} style={[styles.routineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stepNumber}>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>{index + 1}</Text>
          </View>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <Pressable
            style={styles.productInfo}
            onPress={() => router.push(`/product/${product.id}`)}
          >
            <Text style={[styles.productBrand, { color: colors.textSecondary }]}>{product.brand}</Text>
            <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={[styles.productSubcat, { color: colors.textSecondary }]}>{product.subcategory}</Text>
          </Pressable>
          <View style={styles.routineActions}>
            <Pressable
              style={[
                styles.doneBtn,
                { backgroundColor: item.done ? colors.successDim : colors.card, borderColor: item.done ? colors.success + "60" : colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleRoutineDone(product.id, moment);
              }}
            >
              <Feather name="check" size={14} color={item.done ? colors.success : colors.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                removeFromRoutine(product.id, moment);
              }}
              hitSlop={8}
            >
              <Feather name="trash-2" size={14} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function RoutineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { routineScore, getIncompatibilities } = useApp();
  const incompatibilities = getIncompatibilities();

  const scoreColor =
    routineScore >= 80 ? colors.success : routineScore >= 60 ? colors.warningHigh : colors.danger;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>Ma Routine</Text>

      {/* Score */}
      <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Score de routine</Text>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>{routineScore}%</Text>
          <Text style={[styles.scoreDesc, { color: colors.textSecondary }]}>
            {routineScore >= 80
              ? "Excellente compatibilité"
              : routineScore >= 60
              ? "Compatibilité correcte"
              : "Attention aux incompatibilités"}
          </Text>
        </View>
        <View style={[styles.scoreRing, { borderColor: `${scoreColor}40` }]}>
          <Feather name="shield" size={28} color={scoreColor} />
        </View>
      </View>

      {/* Incompatibilities */}
      {incompatibilities.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Incompatibilités</Text>
          {incompatibilities.map((inc, i) => (
            <View
              key={i}
              style={[styles.incompat, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "40" }]}
            >
              <Feather name="alert-circle" size={16} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.incompatTitle, { color: colors.danger }]}>
                  {inc.product1} + {inc.product2}
                </Text>
                <Text style={[styles.incompatText, { color: colors.textSecondary }]}>{inc.reason}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <RoutineSection moment="matin" label="Routine Matin" />
      <RoutineSection moment="soir" label="Routine Soir" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 0 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 20 },
  scoreCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    marginBottom: 24,
  },
  scoreLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 4 },
  scoreValue: { fontSize: 40, fontFamily: "Inter_700Bold" },
  scoreDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  scoreRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionCount: { fontSize: 13, fontFamily: "Inter_500Medium" },
  incompat: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  incompatTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  incompatText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  routineCard: {
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  stepNumber: { width: 20, alignItems: "center" },
  stepText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  productImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: "#2A2A2A" },
  productInfo: { flex: 1 },
  productBrand: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 2 },
  productName: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 17 },
  productSubcat: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  routineActions: { gap: 10, alignItems: "center" },
  doneBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  emptyAdd: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyAddText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
