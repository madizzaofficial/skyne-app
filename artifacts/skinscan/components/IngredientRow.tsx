import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";
import { Ingredient } from "@/constants/mockData";

interface IngredientRowProps {
  ingredient: Ingredient;
  onPress: (ingredient: Ingredient) => void;
  userAllergen?: boolean;
}

export function IngredientRow({ ingredient, onPress, userAllergen = false }: IngredientRowProps) {
  const colors = useColors();

  const getSafetyColor = () => {
    if (userAllergen) return colors.danger;
    switch (ingredient.safetyLevel) {
      case "safe":
        return colors.success;
      case "caution":
        return colors.warning;
      case "avoid":
        return colors.danger;
    }
  };

  const safetyColor = getSafetyColor();

  return (
    <Pressable
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={() => onPress(ingredient)}
    >
      <View style={[styles.dot, { backgroundColor: safetyColor }]} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.inci, { color: colors.textPrimary }]}>{ingredient.inci}</Text>
          {userAllergen && (
            <View style={[styles.allergenBadge, { backgroundColor: colors.dangerDim }]}>
              <Text style={[styles.allergenText, { color: colors.danger }]}>TON ALLERGÈNE</Text>
            </View>
          )}
          {ingredient.isComedogenic && (
            <View style={[styles.allergenBadge, { backgroundColor: colors.warningDim }]}>
              <Text style={[styles.allergenText, { color: colors.warning }]}>COMÉDOGÈNE</Text>
            </View>
          )}
        </View>
        <Text style={[styles.common, { color: colors.textSecondary }]}>
          {ingredient.commonName} · {ingredient.function}
        </Text>
      </View>
      <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  inci: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  common: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  allergenBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  allergenText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
