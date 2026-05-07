import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Product } from "@/constants/mockData";

interface ProductCardProps {
  product: Product;
  personalScore?: number;
  compact?: boolean;
}

export function ProductCard({ product, personalScore, compact = false }: ProductCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(product.id);

  const getScoreColor = (score?: number) => {
    if (!score) return colors.mutedForeground;
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warningHigh;
    return colors.danger;
  };

  const scoreColor = getScoreColor(personalScore);

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        compact && styles.compact,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/product/${product.id}`);
      }}
    >
      <Image
        source={{ uri: product.image }}
        style={[styles.image, compact && styles.imageCompact]}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={[styles.brand, { color: colors.textSecondary }]} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={2}>
          {product.name}
        </Text>
        {product.communityScore > 0 && (
          <View style={styles.row}>
            <Feather name="star" size={12} color={colors.warning} />
            <Text style={[styles.score, { color: colors.textSecondary }]}>
              {product.communityScore.toFixed(1)} ({product.reviewCount})
            </Text>
          </View>
        )}
        {personalScore !== undefined && (
          <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}20` }]}>
            <View style={[styles.scoreDot, { backgroundColor: scoreColor }]} />
            <Text style={[styles.scoreText, { color: scoreColor }]}>{personalScore}/100</Text>
          </View>
        )}
      </View>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          toggleFavorite(product.id);
        }}
        hitSlop={8}
        style={[styles.favBtn, isFav && { backgroundColor: colors.primaryDim }]}
      >
        <Feather
          name="bookmark"
          size={16}
          color={isFav ? colors.primary : colors.mutedForeground}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  compact: { padding: 10 },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#2A2A2A",
  },
  imageCompact: { width: 56, height: 56 },
  info: { flex: 1, gap: 4 },
  brand: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  score: { fontSize: 12, fontFamily: "Inter_400Regular" },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  scoreText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  favBtn: {
    padding: 6,
    borderRadius: 8,
  },
});
