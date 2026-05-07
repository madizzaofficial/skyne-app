import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_PRODUCTS, Product, Ingredient } from "@/constants/mockData";

const PERSONAL_SCORES: Record<string, number> = {
  "1": 78, "2": 91, "3": 85, "4": 73, "5": 62,
};

// ─── Ingredient Sheet (popup) ─────────────────────────────────────────────────
function IngredientSheet({
  ingredient,
  onClose,
}: {
  ingredient: Ingredient;
  onClose: () => void;
}) {
  const colors = useColors();
  const safetyColors = { safe: colors.success, caution: colors.warning, avoid: colors.danger };
  const safetyLabels = { safe: "Ingrédient sûr", caution: "À surveiller", avoid: "À éviter" };
  const safetyColor = safetyColors[ingredient.safetyLevel];

  return (
    <Modal visible animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={ingStyles.overlay} onPress={onClose} />
      <View style={[ingStyles.sheet, { backgroundColor: colors.card }]}>
        <View style={[ingStyles.handle, { backgroundColor: colors.border }]} />

        <View style={{ alignItems: "center" }}>
          <View style={[ingStyles.badge, { backgroundColor: `${safetyColor}20` }]}>
            <View style={[ingStyles.dot, { backgroundColor: safetyColor }]} />
            <Text style={[ingStyles.badgeText, { color: safetyColor }]}>
              {safetyLabels[ingredient.safetyLevel]}
            </Text>
          </View>
        </View>

        <Text style={[ingStyles.title, { color: colors.textPrimary }]}>{ingredient.inci}</Text>
        <Text style={[ingStyles.common, { color: colors.textSecondary }]}>
          {ingredient.commonName} · {ingredient.function}
        </Text>

        <Text style={[ingStyles.desc, { color: colors.textSecondary }]}>{ingredient.description}</Text>

        {ingredient.concerns.length > 0 && (
          <View style={ingStyles.concernsRow}>
            {ingredient.concerns.map((c, i) => (
              <View key={i} style={[ingStyles.concernChip, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "30" }]}>
                <Text style={[ingStyles.concernText, { color: colors.danger }]}>{c}</Text>
              </View>
            ))}
          </View>
        )}

        {ingredient.benefits.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={[ingStyles.sectionTitle, { color: colors.textPrimary }]}>Bénéfices</Text>
            {ingredient.benefits.map((b, i) => (
              <View key={i} style={ingStyles.benefitRow}>
                <View style={[ingStyles.benefitDot, { backgroundColor: colors.success }]} />
                <Text style={[ingStyles.benefitText, { color: colors.textSecondary }]}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={ingStyles.actions}>
          <Pressable style={[ingStyles.actionBtn, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "40" }]}>
            <Feather name="x" size={14} color={colors.danger} />
            <Text style={[ingStyles.actionText, { color: colors.danger }]}>Marquer comme évité</Text>
          </Pressable>
          <Pressable style={[ingStyles.actionBtn, { backgroundColor: colors.successDim, borderColor: colors.success + "40" }]}>
            <Feather name="heart" size={14} color={colors.success} />
            <Text style={[ingStyles.actionText, { color: colors.success }]}>Marquer comme aimé</Text>
          </Pressable>
        </View>

        <Pressable
          style={[ingStyles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onClose}
        >
          <Text style={[ingStyles.closeBtnText, { color: colors.textPrimary }]}>Fermer</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const ingStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
    gap: 12, maxHeight: "90%",
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  common: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  desc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  concernsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  concernChip: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  concernText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  benefitDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  benefitText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  actions: { gap: 8 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 12,
  },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  closeBtn: { borderRadius: 14, borderWidth: 1, paddingVertical: 14, alignItems: "center" },
  closeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

// ─── Product Picker ───────────────────────────────────────────────────────────
function ProductPicker({
  selected,
  onSelect,
  exclude,
  onClose,
}: {
  selected: Product | null;
  onSelect: (p: Product) => void;
  exclude: string | null;
  onClose: () => void;
}) {
  const colors = useColors();
  return (
    <Modal visible animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={[pickerStyles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[pickerStyles.sheet, { backgroundColor: colors.card }]}>
          <View style={pickerStyles.header}>
            <Text style={[pickerStyles.title, { color: colors.textPrimary }]}>Choisir un produit</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {MOCK_PRODUCTS.filter((p) => p.id !== exclude).map((p) => (
              <Pressable
                key={p.id}
                style={[
                  pickerStyles.item,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor: selected?.id === p.id ? colors.primaryDim : "transparent",
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(p);
                  onClose();
                }}
              >
                <Image source={{ uri: p.image }} style={pickerStyles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={[pickerStyles.brand, { color: colors.textSecondary }]}>{p.brand}</Text>
                  <Text style={[pickerStyles.name, { color: colors.textPrimary }]} numberOfLines={1}>{p.name}</Text>
                  <Text style={[pickerStyles.cat, { color: colors.textSecondary }]}>{p.subcategory}</Text>
                </View>
                <View style={[pickerStyles.scoreBadge, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[pickerStyles.scoreText, { color: colors.primary }]}>
                    {PERSONAL_SCORES[p.id] ?? 75}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "80%", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  thumb: { width: 48, height: 48, borderRadius: 10 },
  brand: { fontSize: 11, fontFamily: "Inter_400Regular" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  cat: { fontSize: 11, fontFamily: "Inter_400Regular" },
  scoreBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  scoreText: { fontSize: 14, fontFamily: "Inter_700Bold" },
});

// ─── Score Circle ─────────────────────────────────────────────────────────────
function ScoreCircle({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: string;
}) {
  return (
    <View style={circleStyles.wrap}>
      <View style={[circleStyles.circle, { borderColor: color, backgroundColor: color + "15" }]}>
        <Text style={[circleStyles.score, { color }]}>{score}</Text>
        <Text style={[circleStyles.slash, { color: color + "80" }]}>/100</Text>
      </View>
      <Text style={[circleStyles.label, { color: "#999" }]} numberOfLines={2}>{label}</Text>
    </View>
  );
}

const circleStyles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", gap: 10 },
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  score: { fontSize: 26, fontFamily: "Inter_700Bold", lineHeight: 28 },
  slash: { fontSize: 11, fontFamily: "Inter_500Medium" },
  label: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
});

// ─── Ingredient Row ───────────────────────────────────────────────────────────
function IngRow({
  ing,
  onPress,
  colors,
}: {
  ing: Ingredient;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const dotColor =
    ing.safetyLevel === "safe"
      ? colors.success
      : ing.safetyLevel === "caution"
      ? colors.warning
      : colors.danger;
  return (
    <Pressable
      style={[ingRowStyles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[ingRowStyles.dot, { backgroundColor: dotColor }]} />
      <Text style={[ingRowStyles.name, { color: colors.textPrimary }]}>{ing.inci}</Text>
      <Text style={[ingRowStyles.common, { color: colors.textSecondary }]}>{ing.commonName}</Text>
      <Feather name="info" size={13} color={colors.mutedForeground} />
    </Pressable>
  );
}

const ingRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  common: { fontSize: 11, fontFamily: "Inter_400Regular" },
});

// ─── Properties ──────────────────────────────────────────────────────────────
const PROPERTIES = [
  { key: "alcoholFree", label: "Sans alcool" },
  { key: "fragranceFree", label: "Sans parfum" },
  { key: "oilFree", label: "Sans huile" },
  { key: "siliconeFree", label: "Sans silicone" },
  { key: "parabenFree", label: "Sans paraben" },
  { key: "sulfateFree", label: "Sans sulfate" },
  { key: "fungalAcneSafe", label: "Fungal-acne safe" },
  { key: "nonComedogenic", label: "Non comédogène" },
  { key: "vegan", label: "Vegan" },
  { key: "crueltyFree", label: "Cruelty-free" },
] as const;

// ─── ProductSlot ──────────────────────────────────────────────────────────────
function ProductSlot({
  product,
  onPick,
  colors,
}: {
  product: Product | null;
  onPick: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  if (!product) {
    return (
      <Pressable
        style={[styles.emptySlot, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onPick}
      >
        <Feather name="plus-circle" size={28} color={colors.primary} />
        <Text style={[styles.emptySlotText, { color: colors.textSecondary }]}>
          Choisir un produit
        </Text>
      </Pressable>
    );
  }
  return (
    <Pressable style={[styles.productSlot, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPick}>
      <Image source={{ uri: product.image }} style={styles.slotImage} />
      <Text style={[styles.slotBrand, { color: colors.primary }]} numberOfLines={1}>{product.brand}</Text>
      <Text style={[styles.slotName, { color: colors.textPrimary }]} numberOfLines={2}>{product.name}</Text>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CompareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [productA, setProductA] = useState<Product | null>(null);
  const [productB, setProductB] = useState<Product | null>(null);
  const [pickerFor, setPickerFor] = useState<"A" | "B" | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const scoreA = productA ? (PERSONAL_SCORES[productA.id] ?? 75) : 0;
  const scoreB = productB ? (PERSONAL_SCORES[productB.id] ?? 75) : 0;

  const getScoreColor = (s: number) =>
    s >= 80 ? colors.success : s >= 60 ? colors.warning : colors.danger;

  const avoidA = productA?.ingredients.filter((i) => i.safetyLevel === "avoid") ?? [];
  const avoidB = productB?.ingredients.filter((i) => i.safetyLevel === "avoid") ?? [];
  const safeA = productA?.ingredients.filter((i) => i.safetyLevel === "safe").length ?? 0;
  const safeB = productB?.ingredients.filter((i) => i.safetyLevel === "safe").length ?? 0;
  const totalA = productA?.ingredients.length ?? 1;
  const totalB = productB?.ingredients.length ?? 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Comparer</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product slots */}
        <View style={styles.slotsRow}>
          <ProductSlot product={productA} onPick={() => setPickerFor("A")} colors={colors} />
          <View style={styles.vsCircle}>
            <Text style={[styles.vsText, { color: colors.textSecondary }]}>VS</Text>
          </View>
          <ProductSlot product={productB} onPick={() => setPickerFor("B")} colors={colors} />
        </View>

        {productA && productB && (
          <>
            {/* Score Personnel — cercles */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SCORE PERSONNEL</Text>
              <View style={styles.scoresRow}>
                <ScoreCircle
                  score={scoreA}
                  label={productA.name}
                  color={getScoreColor(scoreA)}
                />
                <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
                <ScoreCircle
                  score={scoreB}
                  label={productB.name}
                  color={getScoreColor(scoreB)}
                />
              </View>
              {scoreA !== scoreB && (
                <View style={[styles.winnerBadge, { backgroundColor: getScoreColor(Math.max(scoreA, scoreB)) + "20" }]}>
                  <Feather name="award" size={14} color={getScoreColor(Math.max(scoreA, scoreB))} />
                  <Text style={[styles.winnerText, { color: getScoreColor(Math.max(scoreA, scoreB)) }]}>
                    {scoreA > scoreB ? productA.name : productB.name} est plus compatible pour ta peau
                  </Text>
                </View>
              )}
            </View>

            {/* Ingrédients problématiques */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INGRÉDIENTS PROBLÉMATIQUES</Text>

              {/* Counts side by side */}
              <View style={styles.statsRow}>
                <View style={styles.statCell}>
                  <Text style={[styles.avoidCount, { color: avoidA.length > 0 ? colors.danger : colors.success }]}>
                    {avoidA.length}
                  </Text>
                  <Text style={[styles.statSub, { color: colors.textSecondary }]}>à éviter</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statCell}>
                  <Text style={[styles.avoidCount, { color: avoidB.length > 0 ? colors.danger : colors.success }]}>
                    {avoidB.length}
                  </Text>
                  <Text style={[styles.statSub, { color: colors.textSecondary }]}>à éviter</Text>
                </View>
              </View>

              {avoidA.length === 0 && avoidB.length === 0 ? (
                <View style={[styles.allGoodBadge, { backgroundColor: colors.successDim }]}>
                  <Feather name="check-circle" size={14} color={colors.success} />
                  <Text style={[styles.allGoodText, { color: colors.success }]}>
                    Aucun ingrédient problématique dans les deux produits
                  </Text>
                </View>
              ) : (
                <View style={styles.avoidLists}>
                  {/* Column A */}
                  <View style={styles.avoidCol}>
                    <Text style={[styles.avoidColLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                      {productA.name}
                    </Text>
                    {avoidA.length === 0 ? (
                      <Text style={[styles.avoidNone, { color: colors.success }]}>Aucun</Text>
                    ) : (
                      avoidA.map((ing) => (
                        <Pressable
                          key={ing.id}
                          style={[styles.avoidTag, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "30" }]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedIngredient(ing);
                          }}
                        >
                          <Text style={[styles.avoidTagText, { color: colors.danger }]} numberOfLines={1}>{ing.inci}</Text>
                          <Feather name="info" size={10} color={colors.danger} />
                        </Pressable>
                      ))
                    )}
                  </View>

                  <View style={[styles.avoidSep, { backgroundColor: colors.border }]} />

                  {/* Column B */}
                  <View style={styles.avoidCol}>
                    <Text style={[styles.avoidColLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                      {productB.name}
                    </Text>
                    {avoidB.length === 0 ? (
                      <Text style={[styles.avoidNone, { color: colors.success }]}>Aucun</Text>
                    ) : (
                      avoidB.map((ing) => (
                        <Pressable
                          key={ing.id}
                          style={[styles.avoidTag, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "30" }]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedIngredient(ing);
                          }}
                        >
                          <Text style={[styles.avoidTagText, { color: colors.danger }]} numberOfLines={1}>{ing.inci}</Text>
                          <Feather name="info" size={10} color={colors.danger} />
                        </Pressable>
                      ))
                    )}
                  </View>
                </View>
              )}

              {(avoidA.length > 0 || avoidB.length > 0) && avoidA.length !== avoidB.length && (
                <View style={[styles.winnerBadge, { backgroundColor: colors.successDim }]}>
                  <Feather name="shield" size={14} color={colors.success} />
                  <Text style={[styles.winnerText, { color: colors.success }]}>
                    {avoidA.length < avoidB.length ? productA.name : productB.name} a moins d'ingrédients à éviter
                  </Text>
                </View>
              )}
            </View>

            {/* Note communauté */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTE COMMUNAUTÉ</Text>
              <View style={styles.statsRow}>
                <View style={styles.statCell}>
                  <Text style={[styles.statBig, { color: colors.warning }]}>{productA.communityScore.toFixed(1)}</Text>
                  <Text style={[styles.statSub, { color: colors.textSecondary }]}>{productA.reviewCount} avis</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statCell}>
                  <Text style={[styles.statBig, { color: colors.warning }]}>{productB.communityScore.toFixed(1)}</Text>
                  <Text style={[styles.statSub, { color: colors.textSecondary }]}>{productB.reviewCount} avis</Text>
                </View>
              </View>
            </View>

            {/* Ingrédients sûrs */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INGRÉDIENTS SÛRS</Text>
              <View style={styles.statsRow}>
                <View style={styles.statCell}>
                  <Text style={[styles.statBig, { color: colors.success }]}>{safeA}/{totalA}</Text>
                  <Text style={[styles.statSub, { color: colors.textSecondary }]}>ingrédients</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statCell}>
                  <Text style={[styles.statBig, { color: colors.success }]}>{safeB}/{totalB}</Text>
                  <Text style={[styles.statSub, { color: colors.textSecondary }]}>ingrédients</Text>
                </View>
              </View>
            </View>

            {/* Prix */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRIX</Text>
              <View style={styles.statsRow}>
                <View style={styles.statCell}>
                  <Text style={[styles.statBig, { color: colors.textPrimary }]}>{productA.price ?? "N/A"}</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statCell}>
                  <Text style={[styles.statBig, { color: colors.textPrimary }]}>{productB.price ?? "N/A"}</Text>
                </View>
              </View>
            </View>

            {/* Propriétés */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PROPRIÉTÉS</Text>
              {PROPERTIES.map(({ key, label }) => {
                const valA = productA.properties[key];
                const valB = productB.properties[key];
                return (
                  <View key={key} style={[styles.propRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.propCheck}>
                      <Feather
                        name={valA ? "check-circle" : "x-circle"}
                        size={18}
                        color={valA ? colors.success : colors.border}
                      />
                    </View>
                    <Text style={[styles.propLabel, { color: colors.textPrimary }]}>{label}</Text>
                    <View style={styles.propCheck}>
                      <Feather
                        name={valB ? "check-circle" : "x-circle"}
                        size={18}
                        color={valB ? colors.success : colors.border}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Ingrédients en commun */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INGRÉDIENTS EN COMMUN</Text>
              {(() => {
                const idsA = new Set(productA.ingredients.map((i) => i.id));
                const common = productB.ingredients.filter((i) => idsA.has(i.id));
                if (common.length === 0) {
                  return (
                    <Text style={[styles.noCommon, { color: colors.textSecondary }]}>
                      Aucun ingrédient commun entre ces deux produits.
                    </Text>
                  );
                }
                return common.map((ing) => (
                  <IngRow
                    key={ing.id}
                    ing={ing}
                    colors={colors}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedIngredient(ing);
                    }}
                  />
                ));
              })()}
            </View>
          </>
        )}

        {(!productA || !productB) && (
          <View style={[styles.hintBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="info" size={20} color={colors.textSecondary} />
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              Sélectionne deux produits pour voir leur comparaison détaillée : score de compatibilité, ingrédients problématiques, propriétés et prix.
            </Text>
          </View>
        )}
      </ScrollView>

      {pickerFor && (
        <ProductPicker
          selected={pickerFor === "A" ? productA : productB}
          exclude={pickerFor === "A" ? productB?.id ?? null : productA?.id ?? null}
          onSelect={(p) => {
            if (pickerFor === "A") setProductA(p);
            else setProductB(p);
          }}
          onClose={() => setPickerFor(null)}
        />
      )}

      {selectedIngredient && (
        <IngredientSheet
          ingredient={selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  screenTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 16, gap: 16 },
  slotsRow: { flexDirection: "row", alignItems: "center" },
  emptySlot: {
    flex: 1, height: 140, borderRadius: 16, borderWidth: 1.5,
    borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8,
  },
  emptySlotText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  productSlot: {
    flex: 1, borderRadius: 16, borderWidth: 1, padding: 12,
    alignItems: "center", gap: 6, minHeight: 140,
  },
  slotImage: { width: 64, height: 64, borderRadius: 12 },
  slotBrand: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  slotName: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center", lineHeight: 16 },
  vsCircle: { width: 36, alignItems: "center" },
  vsText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden", padding: 16, gap: 14 },
  sectionTitle: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  scoresRow: { flexDirection: "row", alignItems: "center", gap: 0 },
  scoreDivider: { width: 1, height: 80, marginHorizontal: 12 },
  winnerBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, padding: 10,
  },
  winnerText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statCell: { flex: 1, alignItems: "center", gap: 2 },
  statDivider: { width: 1, height: 40, marginHorizontal: 8 },
  statBig: { fontSize: 28, fontFamily: "Inter_700Bold" },
  avoidCount: { fontSize: 32, fontFamily: "Inter_700Bold" },
  statSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  avoidLists: { flexDirection: "row", gap: 0 },
  avoidSep: { width: 1, marginHorizontal: 12 },
  avoidCol: { flex: 1, gap: 8 },
  avoidColLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  avoidTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5,
  },
  avoidTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold", flex: 1 },
  avoidNone: { fontSize: 13, fontFamily: "Inter_500Medium" },
  allGoodBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, padding: 10,
  },
  allGoodText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  propRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  propCheck: { width: 24, alignItems: "center" },
  propLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  noCommon: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 8 },
  hintBox: {
    borderRadius: 16, borderWidth: 1, padding: 20,
    flexDirection: "row", gap: 12, alignItems: "flex-start",
  },
  hintText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
