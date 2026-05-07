import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Product } from "@/constants/mockData";

interface Props {
  visible: boolean;
  product: Product | null;
  loading?: boolean;
  notFound?: boolean;
  onClose: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "#00b894" : score >= 40 ? "#fdcb6e" : "#d63031";
  return (
    <View style={[styles.scoreBadge, { borderColor: color + "50", backgroundColor: color + "18" }]}>
      <Text style={[styles.scoreNum, { color }]}>{score}</Text>
      <Text style={[styles.scoreMax, { color: color + "99" }]}>/100</Text>
    </View>
  );
}

function IngredientDot({ status }: { status: "safe" | "caution" | "avoid" }) {
  const color = status === "safe" ? "#00b894" : status === "caution" ? "#fdcb6e" : "#d63031";
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

export function ProductPreviewModal({ visible, product, loading, notFound, onClose }: Props) {
  const colors = useColors();
  const router = useRouter();

  const score = product ? Math.floor(50 + Math.abs(product.id.charCodeAt(0) - 97) * 2) : 0;
  const clamped = Math.min(98, Math.max(22, score));

  const handleViewFull = () => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    setTimeout(() => router.push(`/product/${product.id}`), 150);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Loading state */}
          {loading && (
            <View style={styles.centerBox}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Recherche du produit…
              </Text>
            </View>
          )}

          {/* Not found */}
          {!loading && notFound && (
            <View style={styles.centerBox}>
              <View style={[styles.notFoundIcon, { backgroundColor: colors.dangerDim }]}>
                <Feather name="x-circle" size={28} color={colors.danger} />
              </View>
              <Text style={[styles.notFoundTitle, { color: colors.textPrimary }]}>
                Produit introuvable
              </Text>
              <Text style={[styles.notFoundSub, { color: colors.textSecondary }]}>
                Aucun produit trouvé pour cette URL ou ce code-barres.{"\n"}
                Essaie un lien Open Beauty Facts ou un EAN directement.
              </Text>
              <Pressable
                style={[styles.closeBtn, { borderColor: colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.closeBtnText, { color: colors.textPrimary }]}>Fermer</Text>
              </Pressable>
            </View>
          )}

          {/* Product found */}
          {!loading && !notFound && product && (
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Header: image + info */}
              <View style={styles.productHeader}>
                <Image
                  source={{ uri: product.image }}
                  style={[styles.productImg, { backgroundColor: colors.muted }]}
                  resizeMode="cover"
                />
                <View style={styles.productHeaderInfo}>
                  <Text style={[styles.brand, { color: colors.textSecondary }]} numberOfLines={1}>
                    {product.brand}
                  </Text>
                  <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={3}>
                    {product.name}
                  </Text>
                  {product.category && (
                    <View style={[styles.catBadge, { backgroundColor: colors.primaryDim }]}>
                      <Text style={[styles.catBadgeText, { color: colors.primary }]}>
                        {product.category}
                      </Text>
                    </View>
                  )}
                </View>
                <ScoreBadge score={clamped} />
              </View>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Ingredients preview */}
              {product.ingredients && product.ingredients.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    INGRÉDIENTS ({product.ingredients.length})
                  </Text>
                  {product.ingredients.slice(0, 5).map((ing, i) => (
                    <View key={i} style={[styles.ingRow, { borderBottomColor: colors.border }]}>
                      <IngredientDot status={ing.status} />
                      <Text style={[styles.ingName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {ing.name}
                      </Text>
                      <Text
                        style={[
                          styles.ingStatus,
                          {
                            color:
                              ing.status === "safe"
                                ? "#00b894"
                                : ing.status === "caution"
                                ? "#fdcb6e"
                                : "#d63031",
                          },
                        ]}
                      >
                        {ing.status === "safe" ? "✓ Sûr" : ing.status === "caution" ? "⚠ Attention" : "✗ Éviter"}
                      </Text>
                    </View>
                  ))}
                  {product.ingredients.length > 5 && (
                    <Text style={[styles.moreIng, { color: colors.mutedForeground }]}>
                      + {product.ingredients.length - 5} autres ingrédients
                    </Text>
                  )}
                </View>
              )}

              {/* Properties */}
              {product.properties && product.properties.length > 0 && (
                <View style={styles.propsRow}>
                  {product.properties.slice(0, 4).map((p, i) => (
                    <View key={i} style={[styles.propChip, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "30" }]}>
                      <Text style={[styles.propText, { color: colors.primary }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={[styles.viewBtn, { backgroundColor: colors.primary }]}
                  onPress={handleViewFull}
                >
                  <Feather name="file-text" size={16} color="#fff" />
                  <Text style={styles.viewBtnText}>Voir la fiche complète</Text>
                </Pressable>
                <Pressable
                  style={[styles.dismissBtn, { borderColor: colors.border }]}
                  onPress={onClose}
                >
                  <Text style={[styles.dismissText, { color: colors.textSecondary }]}>Fermer</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "85%",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginVertical: 12 },
  centerBox: { alignItems: "center", paddingVertical: 32, gap: 14 },
  loadingText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  notFoundIcon: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  notFoundTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  notFoundSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  closeBtn: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  closeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  productHeader: { flexDirection: "row", gap: 14, alignItems: "flex-start", paddingVertical: 4 },
  productImg: { width: 80, height: 80, borderRadius: 16 },
  productHeaderInfo: { flex: 1, gap: 4 },
  brand: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  name: { fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 20 },
  catBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  scoreBadge: {
    width: 52, height: 52, borderRadius: 14, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  scoreNum: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 18 },
  scoreMax: { fontSize: 9, fontFamily: "Inter_400Regular" },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 14 },
  section: { gap: 2, marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8, marginBottom: 8 },
  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  ingName: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  ingStatus: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  moreIng: { fontSize: 12, fontFamily: "Inter_400Regular", paddingTop: 6, paddingLeft: 18 },
  propsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  propChip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5 },
  propText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  actions: { gap: 10, paddingTop: 4 },
  viewBtn: {
    borderRadius: 16, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  viewBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  dismissBtn: {
    borderRadius: 14, paddingVertical: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  dismissText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
