import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckboxBadge } from "@/components/CheckboxBadge";
import { IngredientRow } from "@/components/IngredientRow";
import { ProductCard } from "@/components/ProductCard";
import { ScoreBlock } from "@/components/ScoreBlock";
import { useApp } from "@/context/AppContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";
import { Ingredient, RetailerInfo, Review } from "@/constants/mockData";

function IngredientSheet({
  ingredient,
  onClose,
  isUserAllergen,
}: {
  ingredient: Ingredient;
  onClose: () => void;
  isUserAllergen: boolean;
}) {
  const colors = useColors();
  const safetyColors = { safe: colors.success, caution: colors.warning, avoid: colors.danger };
  const safetyLabels = { safe: "Ingrédient sûr", caution: "À surveiller", avoid: "À éviter" };
  const safetyColor = safetyColors[ingredient.safetyLevel];

  return (
    <Modal visible animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

        {/* Safety badge */}
        <View style={styles.sheetBadgeRow}>
          <View style={[styles.safetyBadge, { backgroundColor: `${safetyColor}20` }]}>
            <View style={[styles.safetyDot, { backgroundColor: safetyColor }]} />
            <Text style={[styles.safetyText, { color: safetyColor }]}>
              {safetyLabels[ingredient.safetyLevel]}
            </Text>
          </View>
        </View>

        <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>{ingredient.inci}</Text>
        <Text style={[styles.sheetCommon, { color: colors.textSecondary }]}>
          {ingredient.commonName} · {ingredient.function}
        </Text>

        {isUserAllergen && (
          <View style={[styles.allergenAlert, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "40" }]}>
            <Feather name="alert-triangle" size={14} color={colors.danger} />
            <Text style={[styles.allergenAlertText, { color: colors.danger }]}>
              Cet ingrédient figure dans ta liste d'allergènes
            </Text>
          </View>
        )}

        <Text style={[styles.sheetDesc, { color: colors.textSecondary }]}>{ingredient.description}</Text>

        {ingredient.concerns.length > 0 && (
          <View style={styles.concernsRow}>
            {ingredient.concerns.map((c, i) => (
              <View key={i} style={[styles.concernChip, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "30" }]}>
                <Text style={[styles.concernText, { color: colors.danger }]}>{c}</Text>
              </View>
            ))}
          </View>
        )}

        {ingredient.benefits.length > 0 && (
          <View style={styles.sheetSection}>
            <Text style={[styles.sheetSectionTitle, { color: colors.textPrimary }]}>Bénéfices</Text>
            {ingredient.benefits.map((b, i) => (
              <View key={i} style={styles.sheetRow}>
                <View style={[styles.sheetDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.sheetRowText, { color: colors.textSecondary }]}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.sheetActions}>
          <Pressable style={[styles.sheetActionBtn, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "40" }]}>
            <Feather name="x" size={14} color={colors.danger} />
            <Text style={[styles.sheetActionText, { color: colors.danger }]}>Marquer comme évité</Text>
          </Pressable>
          <Pressable style={[styles.sheetActionBtn, { backgroundColor: colors.successDim, borderColor: colors.success + "40" }]}>
            <Feather name="heart" size={14} color={colors.success} />
            <Text style={[styles.sheetActionText, { color: colors.success }]}>Marquer comme aimé</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={onClose}>
          <Text style={[styles.closeBtnText, { color: colors.textPrimary }]}>Fermer</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function WhereToBuySheet({
  retailers,
  productName,
  onClose,
}: {
  retailers: RetailerInfo[];
  productName: string;
  onClose: () => void;
}) {
  const colors = useColors();
  return (
    <Modal visible animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <View style={styles.wtbHeader}>
          <Text style={[styles.wtbTitle, { color: colors.textPrimary }]}>Où acheter</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Feather name="x" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        {retailers.map((r, i) => (
          <Pressable
            key={i}
            style={[styles.retailerRow, { borderBottomColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (r.searchUrl) Linking.openURL(r.searchUrl);
            }}
          >
            <View style={[styles.retailerLogo, { backgroundColor: r.color + "20" }]}>
              <Text style={styles.retailerEmoji}>{r.emoji}</Text>
            </View>
            <Text style={[styles.retailerName, { color: colors.textPrimary }]}>{r.name}</Text>
            {r.price ? (
              <Text style={[styles.retailerPrice, { color: colors.textPrimary }]}>{r.price}</Text>
            ) : (
              <View style={[styles.searchBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.searchBtnText, { color: colors.textSecondary }]}>Rechercher</Text>
              </View>
            )}
            <Feather name="external-link" size={14} color={colors.mutedForeground} />
          </Pressable>
        ))}
        <Text style={[styles.wtbDisclaimer, { color: colors.mutedForeground }]}>
          Les prix sont indicatifs et peuvent varier selon les promotions.
        </Text>
      </View>
    </Modal>
  );
}

function ReviewCard({
  review,
  colors,
}: {
  review: Review;
  colors: ReturnType<typeof useColors>;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(review.comments);

  const submitComment = () => {
    if (!commentText.trim()) return;
    setLocalComments((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, pseudo: "Moi", text: commentText.trim(), date: "À l'instant" },
    ]);
    setCommentText("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.reviewCard, { borderTopColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <View style={[styles.reviewAvatar, { backgroundColor: colors.primaryDim }]}>
          <Text style={[styles.reviewAvatarText, { color: colors.primary }]}>
            {review.pseudo.charAt(0)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.reviewPseudo, { color: colors.textPrimary }]}>{review.pseudo}</Text>
          <Text style={[styles.reviewMeta, { color: colors.textSecondary }]}>
            Peau {review.skinType} · {review.date}
          </Text>
        </View>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Feather key={s} name="star" size={10} color={s <= review.rating ? colors.warning : colors.border} />
          ))}
        </View>
      </View>

      <Text style={[styles.reviewContent, { color: colors.textSecondary }]}>{review.content}</Text>

      <View style={styles.reviewTags}>
        {review.tags.map((tag) => (
          <View key={tag} style={[styles.reviewTag, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.reviewTagText, { color: colors.textSecondary }]}>#{tag}</Text>
          </View>
        ))}
      </View>

      {/* Likes + comment toggle */}
      <View style={styles.reviewActions}>
        <Pressable style={styles.reviewAction}>
          <Feather name="thumbs-up" size={13} color={colors.textSecondary} />
          <Text style={[styles.reviewActionText, { color: colors.textSecondary }]}>{review.likes}</Text>
        </Pressable>
        <Pressable
          style={styles.reviewAction}
          onPress={() => setShowComments((v) => !v)}
        >
          <Feather name="message-circle" size={13} color={colors.primary} />
          <Text style={[styles.reviewActionText, { color: colors.primary }]}>
            {localComments.length} commentaire{localComments.length !== 1 ? "s" : ""}
          </Text>
        </Pressable>
      </View>

      {showComments && (
        <View style={[styles.commentsSection, { borderTopColor: colors.border }]}>
          {localComments.map((c) => (
            <View key={c.id} style={styles.commentRow}>
              <View style={[styles.commentAvatar, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[styles.commentAvatarText, { color: colors.textSecondary }]}>
                  {c.pseudo.charAt(0)}
                </Text>
              </View>
              <View style={[styles.commentBubble, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[styles.commentPseudo, { color: colors.textPrimary }]}>{c.pseudo}</Text>
                <Text style={[styles.commentText, { color: colors.textSecondary }]}>{c.text}</Text>
                <Text style={[styles.commentDate, { color: colors.mutedForeground }]}>{c.date}</Text>
              </View>
            </View>
          ))}

          {/* Reply input */}
          <View style={styles.commentInputRow}>
            <TextInput
              style={[
                styles.commentInput,
                { backgroundColor: colors.surfaceElevated, color: colors.textPrimary, borderColor: colors.border },
              ]}
              placeholder="Ajoute un commentaire..."
              placeholderTextColor={colors.mutedForeground}
              value={commentText}
              onChangeText={setCommentText}
              returnKeyType="send"
              onSubmitEditing={submitComment}
            />
            <Pressable
              style={[styles.sendBtn, { backgroundColor: colors.primary }]}
              onPress={submitComment}
            >
              <Feather name="send" size={14} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const { favorites, toggleFavorite, addToRoutine, getProductById, allProducts } = useApp();

  const product = getProductById(id ?? "");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [showWhereToBuy, setShowWhereToBuy] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
            hitSlop={12}
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 40 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" }}>
            <Feather name="package" size={28} color={colors.mutedForeground} />
          </View>
          <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.textPrimary, textAlign: "center" }}>
            Produit introuvable
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
            Ce produit n'est pas encore dans notre base de données. Tu peux l'ajouter manuellement.
          </Text>
          <Pressable
            style={{ backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 }}
            onPress={() => router.replace("/add-product")}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" }}>Ajouter le produit</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isFav = favorites.includes(product.id);
  const userAllergens = profile.allergenes.map((a) => a.toLowerCase());

  const isUserAllergen = (ingredient: Ingredient | null | undefined): boolean => {
    if (!ingredient?.inci) return false;
    return (
      userAllergens.some(
        (a) =>
          ingredient.inci.toLowerCase().includes(a) ||
          ingredient.commonName.toLowerCase().includes(a)
      ) || ingredient.inci.toLowerCase().includes("parfum")
    );
  };

  const safeCount = product.ingredients.filter((i) => i.safetyLevel === "safe").length;
  const cautionCount = product.ingredients.filter((i) => i.safetyLevel === "caution").length;
  const avoidCount = product.ingredients.filter((i) => i.safetyLevel === "avoid").length;
  const hasAllergen = product.ingredients.some((i) => isUserAllergen(i));

  const personalScore = (() => {
    const total = product.ingredients.length;
    if (total === 0) return 0;
    const raw =
      90 * (safeCount / total) -
      30 * (cautionCount / total) -
      50 * (avoidCount / total) -
      (hasAllergen ? 10 : 0);
    return Math.max(5, Math.min(100, Math.round(raw)));
  })();

  const scoreReasons: string[] = (() => {
    if (product.ingredients.length === 0)
      return ["Composition non disponible dans Open Beauty Facts"];
    const r: string[] = [];
    if (safeCount > 0) r.push(`${safeCount} ingrédient${safeCount > 1 ? "s" : ""} sûr${safeCount > 1 ? "s" : ""}`);
    if (avoidCount > 0) r.push(`${avoidCount} ingrédient${avoidCount > 1 ? "s" : ""} à éviter`);
    if (hasAllergen) r.push("Contient un allergène potentiel");
    if (product.properties.fragranceFree) r.push("Sans parfum");
    if (product.properties.parabenFree) r.push("Sans paraben");
    return r.slice(0, 3);
  })();

  const alternatives = (() => {
    const sameCategory = allProducts.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    if (sameCategory.length >= 2) return sameCategory.slice(0, 3);
    return allProducts.filter((p) => p.id !== product.id).slice(0, 3);
  })();

  const props = product.properties;
  const checkboxItems = [
    { label: "Sans alcool", value: props.alcoholFree },
    { label: "Sans parfum", value: props.fragranceFree },
    { label: "Sans huile", value: props.oilFree },
    { label: "Sans silicone", value: props.siliconeFree },
    { label: "Sans paraben", value: props.parabenFree },
    { label: "Sans sulfate", value: props.sulfateFree },
    { label: "Allergène-EU free", value: props.euAllergenFree },
    { label: "Fungal-acne safe", value: props.fungalAcneSafe },
    { label: "Non comédogène", value: props.nonComedogenic },
    { label: "Vegan", value: props.vegan },
    { label: "Cruelty-free", value: props.crueltyFree },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${product.name} par ${product.brand}`,
        message: `Découvrez ${product.name} par ${product.brand} sur SkinScan ! Score de compatibilité : ${personalScore}/100. Catégorie : ${product.subcategory}.`,
      });
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Floating header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
          hitSlop={12}
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.topBarActions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavorite(product.id);
            }}
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather
              name={isFav ? "bookmark" : "bookmark"}
              size={18}
              color={isFav ? colors.primary : colors.textSecondary}
            />
          </Pressable>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleShare}
          >
            <Feather name="share-2" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product header */}
        <View style={styles.productHeader}>
          <Pressable onPress={() => setShowFullImage(true)}>
            <Image
              source={{ uri: product.image }}
              style={[styles.productImage, { backgroundColor: colors.card }]}
              resizeMode="cover"
            />
            <View style={styles.imageZoom}>
              <Feather name="maximize-2" size={12} color="#fff" />
            </View>
          </Pressable>
          <View style={styles.productInfo}>
            <Text style={[styles.brand, { color: colors.primary }]}>{product.brand}</Text>
            <Text style={[styles.productName, { color: colors.textPrimary }]}>{product.name}</Text>
            <Text style={[styles.subcategory, { color: colors.textSecondary }]}>
              {product.category} · {product.subcategory}
            </Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={star}
                  name="star"
                  size={12}
                  color={star <= Math.round(product.communityScore) ? colors.warning : colors.border}
                />
              ))}
              <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>
                {product.communityScore.toFixed(1)} ({product.reviewCount})
              </Text>
            </View>
          </View>
        </View>

        {/* Score */}
        <ScoreBlock
          score={personalScore}
          reasons={scoreReasons}
        />

        {/* Where to buy */}
        <Pressable
          style={[styles.wtbCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowWhereToBuy(true);
          }}
        >
          <View style={styles.wtbLeft}>
            <Text style={[styles.wtbCardTitle, { color: colors.textPrimary }]}>Où acheter</Text>
            <Text style={[styles.wtbCardSub, { color: colors.textSecondary }]}>
              {product.whereToBuy.map((r) => r.name).slice(0, 3).join(", ")}
              {product.whereToBuy.length > 3 ? ` +${product.whereToBuy.length - 3}` : ""}
            </Text>
          </View>
          <View style={styles.wtbLogos}>
            {product.whereToBuy.slice(0, 4).map((r, i) => (
              <View
                key={i}
                style={[styles.retailerLogoSmall, { backgroundColor: r.color + "20", marginLeft: i > 0 ? -8 : 0 }]}
              >
                <Text style={styles.retailerEmojiSmall}>{r.emoji}</Text>
              </View>
            ))}
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>

        {/* Ce qu'il contient */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ce qu'il contient</Text>
          <View style={styles.checkboxGrid}>
            {checkboxItems.map((item) => (
              <CheckboxBadge key={item.label} label={item.label} value={item.value} />
            ))}
          </View>
        </View>

        {/* Composition */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Composition</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.ingredientBar}>
              <View style={[styles.barSegment, { flex: safeCount, backgroundColor: colors.success }]} />
              <View style={[styles.barSegment, { flex: cautionCount, backgroundColor: colors.warning }]} />
              <View style={[styles.barSegment, { flex: avoidCount, backgroundColor: colors.danger }]} />
            </View>
            <View style={styles.barLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>{safeCount} sûrs</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>{cautionCount} à surveiller</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>{avoidCount} à éviter</Text>
              </View>
            </View>
            {product.ingredients.length === 0 ? (
              <View style={[styles.noDataBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Feather name="alert-circle" size={16} color={colors.mutedForeground} />
                <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                  Composition INCI non disponible dans Open Beauty Facts pour ce produit.
                </Text>
              </View>
            ) : product.ingredients.map((ingredient) => (
              <IngredientRow
                key={ingredient.id}
                ingredient={ingredient}
                userAllergen={isUserAllergen(ingredient)}
                onPress={(i) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedIngredient(i);
                }}
              />
            ))}
            {product.incompatibilities.length > 0 && (
              <View style={[styles.incompatSection, { borderTopColor: colors.border }]}>
                <Text style={[styles.incompatTitle, { color: colors.textPrimary }]}>⚠️ Incompatibilités</Text>
                {product.incompatibilities.map((inc, i) => (
                  <View key={i} style={[styles.incompatRow, { backgroundColor: colors.warningDim }]}>
                    <Feather name="alert-circle" size={13} color={colors.warning} />
                    <Text style={[styles.incompatText, { color: colors.textSecondary }]}>{inc}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Bénéfices & Risques */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bénéfices & Risques</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>✅ Bénéfices</Text>
            {["Hydratation profonde", "Contrôle du sébum", "Réduit les pores", "Uniformise le teint"].map((b, i) => (
              <View key={i} style={[styles.benefitRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.benefitIcon, { backgroundColor: colors.successDim }]}>
                  <Feather name="check-circle" size={15} color={colors.success} />
                </View>
                <Text style={[styles.benefitText, { color: colors.textPrimary }]}>{b}</Text>
              </View>
            ))}
            {product.ingredients.filter((i) => i.concerns.length > 0).length > 0 && (
              <>
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 12 }]}>⚠️ Points de vigilance</Text>
                {product.ingredients
                  .filter((i) => i.concerns.length > 0)
                  .flatMap((i) => i.concerns.map((c) => c))
                  .slice(0, 4)
                  .map((concern, i) => (
                    <View key={i} style={[styles.benefitRow, { borderBottomColor: colors.border }]}>
                      <View style={[styles.benefitIcon, { backgroundColor: colors.dangerDim }]}>
                        <Feather name="alert-triangle" size={14} color={colors.danger} />
                      </View>
                      <Text style={[styles.benefitText, { color: colors.textSecondary }]}>{concern}</Text>
                    </View>
                  ))}
              </>
            )}
          </View>
        </View>

        {/* Avis */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Avis communauté</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.ratingOverview}>
              <Text style={[styles.ratingBig, { color: colors.textPrimary }]}>{product.communityScore.toFixed(1)}</Text>
              <View>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Feather key={s} name="star" size={16} color={s <= Math.round(product.communityScore) ? colors.warning : colors.border} />
                  ))}
                </View>
                <Text style={[styles.reviewCountText, { color: colors.textSecondary }]}>
                  {product.reviewCount} avis
                </Text>
              </View>
            </View>
            {product.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} colors={colors} />
            ))}
          </View>
        </View>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Alternatives</Text>
            {alternatives.map((p) => (
              <ProductCard key={p.id} product={p} personalScore={82} />
            ))}
          </View>
        )}

        {/* Routine */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ajouter à ma routine</Text>
          <View style={styles.routineBtns}>
            <Pressable
              style={[styles.routineBtn, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                addToRoutine(product.id, "matin");
              }}
            >
              <Feather name="sun" size={18} color={colors.warning} />
              <Text style={[styles.routineBtnText, { color: colors.textPrimary }]}>Matin</Text>
            </Pressable>
            <Pressable
              style={[styles.routineBtn, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                addToRoutine(product.id, "soir");
              }}
            >
              <Feather name="moon" size={18} color={colors.primary} />
              <Text style={[styles.routineBtnText, { color: colors.textPrimary }]}>Soir</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {selectedIngredient && (
        <IngredientSheet
          ingredient={selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
          isUserAllergen={isUserAllergen(selectedIngredient)}
        />
      )}

      {showWhereToBuy && (
        <WhereToBuySheet
          retailers={product.whereToBuy}
          productName={product.name}
          onClose={() => setShowWhereToBuy(false)}
        />
      )}

      {/* Fullscreen image */}
      <Modal visible={showFullImage} transparent animationType="fade">
        <View style={styles.fullImageOverlay}>
          <Pressable style={styles.fullImageClose} onPress={() => setShowFullImage(false)}>
            <View style={styles.fullImageCloseBtn}>
              <Feather name="x" size={22} color="#fff" />
            </View>
          </Pressable>
          <Image
            source={{ uri: product.image }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  topBarActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 16, gap: 20 },
  productHeader: { flexDirection: "row", gap: 14 },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  imageZoom: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 6,
    padding: 4,
  },
  productInfo: { flex: 1, gap: 4, justifyContent: "center" },
  brand: { fontSize: 11, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8 },
  productName: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 22 },
  subcategory: { fontSize: 12, fontFamily: "Inter_400Regular" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingCount: { fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: 4 },
  wtbCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wtbLeft: { flex: 1 },
  wtbCardTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  wtbCardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  wtbLogos: { flexDirection: "row", alignItems: "center" },
  retailerLogoSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  retailerEmojiSmall: { fontSize: 13 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  checkboxGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ingredientBar: { flexDirection: "row", height: 6, margin: 16, borderRadius: 3, overflow: "hidden", gap: 1 },
  barSegment: { height: "100%" },
  barLegend: { flexDirection: "row", gap: 14, paddingHorizontal: 16, marginBottom: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  incompatSection: { borderTopWidth: StyleSheet.hairlineWidth, padding: 16, gap: 8 },
  incompatTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  incompatRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 10 },
  incompatText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 17 },
  subSectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  benefitIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  benefitText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  concernIconSmall: { fontSize: 16 },
  ratingOverview: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16 },
  ratingBig: { fontSize: 48, fontFamily: "Inter_700Bold" },
  starsRow: { flexDirection: "row", gap: 2 },
  reviewCountText: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  reviewCard: { borderTopWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10 },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  reviewAvatarText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  reviewPseudo: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reviewMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  reviewContent: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  reviewTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  reviewTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  reviewTagText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  reviewActions: { flexDirection: "row", gap: 16 },
  reviewAction: { flexDirection: "row", alignItems: "center", gap: 5 },
  reviewActionText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  commentsSection: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, gap: 10 },
  commentRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  commentBubble: { flex: 1, borderRadius: 12, padding: 10, gap: 2 },
  commentPseudo: { fontSize: 12, fontFamily: "Inter_700Bold" },
  commentText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  commentDate: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  commentInputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  routineBtns: { flexDirection: "row", gap: 10 },
  routineBtn: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  routineBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    gap: 14,
    maxHeight: "90%",
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  sheetBadgeRow: { alignItems: "center" },
  safetyBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  safetyDot: { width: 7, height: 7, borderRadius: 4 },
  safetyText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sheetTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  sheetCommon: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  allergenAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  allergenAlertText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  sheetDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  concernsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  concernChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  concernIcon: { fontSize: 14 },
  concernText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sheetSection: { gap: 6 },
  sheetSectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  sheetRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  sheetDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  sheetRowText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  sheetActions: { gap: 8 },
  sheetActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  sheetActionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  closeBtn: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  wtbHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wtbTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  retailerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  retailerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  retailerEmoji: { fontSize: 18 },
  retailerName: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  retailerPrice: { fontSize: 15, fontFamily: "Inter_700Bold" },
  searchBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchBtnText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  wtbDisclaimer: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 16,
    marginTop: 4,
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullImageClose: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 10,
  },
  fullImageCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
  noDataBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  noDataText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
