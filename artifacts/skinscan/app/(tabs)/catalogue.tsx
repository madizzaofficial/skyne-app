import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AnimatedScreenTransition } from "@/components/animations/AnimatedScreenTransition";
import { AnimatedStaggeredItem } from "@/components/animations/AnimatedStaggeredList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { MOCK_PRODUCTS, Product } from "@/constants/mockData";
import {
  getProductCount,
  getProductsByCategory,
  importOBFProducts,
  searchProductsInFirestore,
} from "@/services/firestoreProducts";
import { searchProducts } from "@/services/openBeautyFacts";

// ─── Category taxonomy ─────────────────────────────────────────────────────────
interface SubSubCat {
  id: string;
  label: string;
  obfTag?: string;
}

interface SubCat {
  id: string;
  label: string;
  subs: SubSubCat[];
}

interface CatConfig {
  id: string;
  label: string;
  emoji: string;
  color: string;
  obfTag: string;
  subcategories: SubCat[];
}

const CATEGORIES: CatConfig[] = [
  {
    id: "visage",
    label: "Soin visage",
    emoji: "🌿",
    color: "#4ECDC4",
    obfTag: "face",
    subcategories: [
      { id: "hydratant", label: "Hydratant visage", subs: [{ id: "creme_jour", label: "Crème de jour" }, { id: "creme_nuit", label: "Crème de nuit" }, { id: "gel_hydratant", label: "Gel hydratant" }, { id: "bb_cc", label: "Crème BB / CC" }] },
      { id: "serum", label: "Sérum & huile", subs: [{ id: "serum_vit_c", label: "Sérum vitamine C" }, { id: "serum_retinol", label: "Sérum rétinol" }, { id: "huile_visage", label: "Huile visage" }] },
      { id: "nettoyant", label: "Nettoyant visage", subs: [{ id: "gel_nettoyant", label: "Gel nettoyant" }, { id: "mousse_nettoyante", label: "Mousse nettoyante" }, { id: "eau_micellaire", label: "Eau micellaire" }, { id: "lait_nettoyant", label: "Lait nettoyant" }, { id: "huile_demaquillante", label: "Huile démaquillante" }] },
      { id: "toner", label: "Toner & essence", subs: [{ id: "lotion_tonique", label: "Lotion tonique" }, { id: "eau_florale", label: "Eau florale" }, { id: "essence", label: "Essence" }] },
      { id: "masque_visage", label: "Masque visage", subs: [{ id: "masque_argile", label: "Masque argile" }, { id: "masque_tissu", label: "Masque tissu" }, { id: "masque_peel", label: "Masque peel-off" }, { id: "masque_nuit", label: "Masque de nuit" }] },
      { id: "exfoliant_visage", label: "Exfoliant visage", subs: [{ id: "gommage_visage", label: "Gommage doux" }, { id: "exfoliant_chim", label: "Exfoliant chimique (AHA/BHA)" }] },
      { id: "soin_yeux", label: "Soin contour yeux", subs: [{ id: "creme_yeux", label: "Crème contour yeux" }, { id: "patch_yeux", label: "Patch yeux" }, { id: "serum_yeux", label: "Sérum yeux" }] },
      { id: "soin_levres", label: "Soin lèvres", subs: [{ id: "baume_levres", label: "Baume lèvres" }, { id: "gommage_levres", label: "Gommage lèvres" }] },
    ],
  },
  {
    id: "corps",
    label: "Soin corps",
    emoji: "💆",
    color: "#A29BFE",
    obfTag: "body",
    subcategories: [
      { id: "hydratant_corps", label: "Hydratant corps", subs: [{ id: "lotion_corps", label: "Lotion corps" }, { id: "creme_corps", label: "Crème corps" }, { id: "beurre_corps", label: "Beurre corps" }, { id: "huile_corps", label: "Huile corps" }] },
      { id: "nettoyant_corps", label: "Nettoyant corps", subs: [{ id: "gel_douche", label: "Gel douche" }, { id: "savon", label: "Savon" }, { id: "bain_moussant", label: "Bain moussant" }, { id: "huile_bain", label: "Huile de bain" }] },
      { id: "exfoliant_corps", label: "Exfoliant corps", subs: [{ id: "gommage_corps", label: "Gommage corps" }, { id: "brosse", label: "Brosse / Loofah" }] },
      { id: "mains_pieds", label: "Mains & pieds", subs: [{ id: "creme_mains", label: "Crème mains" }, { id: "creme_pieds", label: "Crème pieds" }, { id: "soin_ongles", label: "Soin ongles" }] },
    ],
  },
  {
    id: "cheveux",
    label: "Soin cheveux",
    emoji: "💇",
    color: "#FDCB6E",
    obfTag: "hair",
    subcategories: [
      { id: "shampoing", label: "Shampoing", subs: [{ id: "shampoing_doux", label: "Shampoing doux" }, { id: "shampoing_sec", label: "Shampoing sec" }, { id: "shampoing_solide", label: "Shampoing solide" }, { id: "shampoing_pellicules", label: "Antipelliculaire" }] },
      { id: "apres_shampoing", label: "Après-shampoing", subs: [{ id: "revitalisant", label: "Revitalisant" }, { id: "demelant", label: "Démêlant spray" }, { id: "apres_solide", label: "Après-shampoing solide" }] },
      { id: "masque_cheveux", label: "Masque cheveux", subs: [{ id: "masque_nourrissant", label: "Masque nourrissant" }, { id: "masque_reparateur", label: "Masque réparateur" }, { id: "masque_brillance", label: "Masque brillance" }] },
      { id: "serum_cheveux", label: "Sérum & huile capillaire", subs: [{ id: "huile_capi", label: "Huile capillaire" }, { id: "serum_capi", label: "Sérum cheveux" }, { id: "soin_sans_rinçage", label: "Soin sans rinçage" }] },
      { id: "coiffant", label: "Coiffant", subs: [{ id: "gel_coiffant", label: "Gel coiffant" }, { id: "mousse", label: "Mousse coiffante" }, { id: "spray_fixant", label: "Spray fixant" }] },
    ],
  },
  {
    id: "hygiene",
    label: "Hygiène",
    emoji: "🧼",
    color: "#74B9FF",
    obfTag: "hygiene",
    subcategories: [
      { id: "deodorant", label: "Déodorant", subs: [{ id: "antitranspirant", label: "Anti-transpirant" }, { id: "deo_bille", label: "Déodorant bille" }, { id: "deo_spray", label: "Déodorant spray" }, { id: "deo_stick", label: "Déodorant stick" }, { id: "deo_solide", label: "Déodorant solide" }, { id: "pierre_alun", label: "Pierre d'alun" }] },
      { id: "dentaire", label: "Hygiène dentaire", subs: [{ id: "dentifrice", label: "Dentifrice" }, { id: "bain_bouche", label: "Bain de bouche" }, { id: "fil_dentaire", label: "Fil dentaire" }] },
      { id: "intime", label: "Hygiène intime", subs: [{ id: "gel_intime", label: "Gel intime" }, { id: "lingettes_intimes", label: "Lingettes intimes" }] },
    ],
  },
  {
    id: "maquillage",
    label: "Maquillage",
    emoji: "💄",
    color: "#FF7675",
    obfTag: "makeup",
    subcategories: [
      { id: "teint", label: "Teint", subs: [{ id: "fond_teint", label: "Fond de teint" }, { id: "correcteur", label: "Correcteur / Anticerne" }, { id: "blush", label: "Blush" }, { id: "highlighter", label: "Highlighter" }, { id: "bronzer", label: "Bronzer" }] },
      { id: "yeux_maquillage", label: "Yeux", subs: [{ id: "mascara", label: "Mascara" }, { id: "eyeliner", label: "Eyeliner" }, { id: "crayon_yeux", label: "Crayon yeux" }, { id: "fard", label: "Fard à paupières" }] },
      { id: "levres_maquillage", label: "Lèvres", subs: [{ id: "rouge_levres", label: "Rouge à lèvres" }, { id: "gloss", label: "Gloss" }, { id: "baume_teinte", label: "Baume teinté" }] },
      { id: "ongles", label: "Ongles", subs: [{ id: "vernis", label: "Vernis à ongles" }, { id: "top_coat", label: "Top coat" }, { id: "dissolvant", label: "Dissolvant" }] },
    ],
  },
  {
    id: "solaire",
    label: "Solaire",
    emoji: "☀️",
    color: "#FFEAA7",
    obfTag: "sun",
    subcategories: [
      { id: "protection", label: "Protection solaire", subs: [{ id: "spf50", label: "SPF 50+" }, { id: "spf30", label: "SPF 30" }, { id: "spf_visage", label: "SPF visage" }, { id: "spf_enfant", label: "SPF enfant" }] },
      { id: "apres_soleil", label: "Après-soleil", subs: [{ id: "gel_apsol", label: "Gel après-soleil" }, { id: "lait_apsol", label: "Lait après-soleil" }] },
      { id: "autobronzant", label: "Autobronzant", subs: [{ id: "lotion_autobronz", label: "Lotion autobronzante" }, { id: "gouttes_autobronz", label: "Gouttes autobronzantes" }] },
    ],
  },
];

// ─── Nav state ─────────────────────────────────────────────────────────────────
type NavLevel = "cats" | "subcats" | "subsubcats" | "products";
type NavDirection = "forward" | "backward" | "none";

interface NavState {
  level: NavLevel;
  cat: CatConfig | null;
  sub: SubCat | null;
  subsub: SubSubCat | null;
}

// ─── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "#00b894" : score >= 40 ? "#fdcb6e" : "#d63031";
  return (
    <View style={[styles.scoreBadge, { borderColor: color + "50", backgroundColor: color + "18" }]}>
      <Text style={[styles.scoreNum, { color }]}>{score}</Text>
      <Text style={[styles.scoreMax, { color: color + "99" }]}>/100</Text>
    </View>
  );
}

// ─── Product row ───────────────────────────────────────────────────────────────
function ProductRow({ product }: { product: Product }) {
  const colors = useColors();
  const router = useRouter();
  const { addScannedProduct, addToHistory } = useApp();
  const score = Math.floor(50 + Math.random() * 45);

  return (
    <Pressable
      style={[styles.productRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        addScannedProduct(product);
        addToHistory(product.id);
        router.push(`/product/${product.id}`);
      }}
    >
      <Image
        source={{ uri: product.image }}
        style={[styles.productImg, { backgroundColor: colors.muted }]}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productBrand, { color: colors.textSecondary }]} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
          {product.name}
        </Text>
        {product.subcategory ? (
          <Text style={[styles.productCat, { color: colors.mutedForeground }]} numberOfLines={1}>
            {product.subcategory}
          </Text>
        ) : null}
      </View>
      <ScoreBadge score={score} />
    </Pressable>
  );
}

// ─── Category row (level 1) ─────────────────────────────────────────────────────
function CatRow({ cat, onPress }: { cat: CatConfig; onPress: () => void }) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 });
        opacity.value = withTiming(0.8, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 180 });
        opacity.value = withTiming(1, { duration: 180 });
      }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          animStyle,
          styles.catRow,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.catEmoji, { backgroundColor: cat.color + "22" }]}>
          <Text style={styles.catEmojiText}>{cat.emoji}</Text>
        </View>
        <Text style={[styles.catLabel, { color: colors.textPrimary }]}>{cat.label}</Text>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </Animated.View>
    </Pressable>
  );
}

// ─── Sub/subsub row (level 2 & 3) ──────────────────────────────────────────────
function SubRow({
  label,
  isLast,
  isSeeAll,
  onPress,
}: {
  label: string;
  isLast?: boolean;
  isSeeAll?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 80 });
        opacity.value = withTiming(0.75, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 160 });
        opacity.value = withTiming(1, { duration: 160 });
      }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          animStyle,
          styles.subRow,
          { borderBottomColor: isLast ? "transparent" : colors.border },
          isSeeAll && { backgroundColor: colors.primaryDim },
        ]}
      >
        <Text
          style={[
            styles.subLabel,
            { color: isSeeAll ? colors.primary : colors.textPrimary },
            isSeeAll && { fontFamily: "Inter_600SemiBold" },
          ]}
        >
          {label}
        </Text>
        <Feather
          name="chevron-right"
          size={16}
          color={isSeeAll ? colors.primary : colors.mutedForeground}
        />
      </Animated.View>
    </Pressable>
  );
}

// ─── Header with back navigation ────────────────────────────────────────────────
function DrillHeader({
  nav,
  onBack,
  colors,
}: {
  nav: NavState;
  onBack: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const crumbs: string[] = [];
  if (nav.cat) crumbs.push(nav.cat.label);
  if (nav.sub) crumbs.push(nav.sub.label);
  if (nav.subsub) crumbs.push(nav.subsub.label);

  return (
    <View style={[styles.drillHeader, { borderBottomColor: colors.border }]}>
      <Pressable
        style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onBack}
        hitSlop={8}
      >
        <Feather name="arrow-left" size={16} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.crumbWrap}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <Feather name="chevron-right" size={12} color={colors.mutedForeground} style={{ marginHorizontal: 2 }} />
            )}
            <Text
              style={[
                styles.crumb,
                { color: i === crumbs.length - 1 ? colors.textPrimary : colors.mutedForeground },
                i === crumbs.length - 1 && { fontFamily: "Inter_700Bold" },
              ]}
              numberOfLines={1}
            >
              {c}
            </Text>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CatalogueScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [nav, setNav] = useState<NavState>({ level: "cats", cat: null, sub: null, subsub: null });
  const [navDirection, setNavDirection] = useState<NavDirection>("none");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(false);

  const [firestoreCount, setFirestoreCount] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [importLabel, setImportLabel] = useState("");

  const { addScannedProduct } = useApp();
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getProductCount().then(setFirestoreCount);
  }, []);

  // Load products when reaching product level
  useEffect(() => {
    if (nav.level !== "products") return;
    setProdLoading(true);
    const catId = nav.cat?.id ?? "";
    getProductsByCategory(catId, undefined, 40)
      .then((prods) => {
        if (prods.length > 0) {
          setProducts(prods);
        } else {
          setProducts(MOCK_PRODUCTS.filter((p) => p.category?.toLowerCase() === catId));
        }
      })
      .finally(() => setProdLoading(false));
  }, [nav]);

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      if (!q.trim()) { setSearchResults([]); return; }
      setSearchLoading(true);
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
      searchDebounce.current = setTimeout(async () => {
        const local = MOCK_PRODUCTS.filter(
          (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase())
        );
        setSearchResults(local);
        try {
          const [fs, obf] = await Promise.all([searchProductsInFirestore(q, 20), searchProducts(q, 10)]);
          const seen = new Set(local.map((p) => p.id));
          const merged = [...local];
          for (const p of [...fs, ...obf]) {
            if (!seen.has(p.id)) { seen.add(p.id); merged.push(p); addScannedProduct(p); }
          }
          setSearchResults(merged);
        } catch {}
        setSearchLoading(false);
      }, 400);
    },
    [addScannedProduct]
  );

  const handleImport = async () => {
    setImporting(true);
    setImportCount(0);
    try {
      await importOBFProducts((count, label) => { setImportCount(count); setImportLabel(label); });
      const n = await getProductCount();
      setFirestoreCount(n);
    } catch {}
    setImporting(false);
  };

  const pushCat = (cat: CatConfig) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNavDirection("forward");
    setNav({ level: "subcats", cat, sub: null, subsub: null });
  };

  const pushSub = (sub: SubCat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNavDirection("forward");
    if (sub.subs.length === 0) {
      setNav((n) => ({ ...n, level: "products", sub, subsub: null }));
    } else {
      setNav((n) => ({ ...n, level: "subsubcats", sub, subsub: null }));
    }
  };

  const pushSubSub = (subsub: SubSubCat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNavDirection("forward");
    setNav((n) => ({ ...n, level: "products", subsub }));
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNavDirection("backward");
    setNav((n) => {
      if (n.level === "products" && n.subsub) return { ...n, level: "subsubcats", subsub: null };
      if (n.level === "products") return { ...n, level: "subcats", sub: null };
      if (n.level === "subsubcats") return { ...n, level: "subcats", sub: null };
      if (n.level === "subcats") return { level: "cats", cat: null, sub: null, subsub: null };
      return n;
    });
  };

  const isSearching = search.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
        {nav.level === "cats" ? (
          <Text style={[styles.title, { color: colors.textPrimary }]}>Catalogue</Text>
        ) : (
          <DrillHeader nav={nav} onBack={goBack} colors={colors} />
        )}

        {/* Search bar only at root */}
        {nav.level === "cats" && (
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Produit, marque, ingrédient..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={handleSearch}
            />
            {searchLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : search.length > 0 ? (
              <Pressable onPress={() => handleSearch("")} hitSlop={8}>
                <Feather name="x" size={14} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Import banner */}
        {nav.level === "cats" && !isSearching && (firestoreCount === 0 || importing) && (
          <View style={[styles.importBanner, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "30" }]}>
            {importing ? (
              <>
                <ActivityIndicator color={colors.primary} size="small" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.importTitle, { color: colors.primary }]}>Importation… {importCount} produits</Text>
                  <Text style={[styles.importSub, { color: colors.textSecondary }]}>{importLabel}</Text>
                </View>
              </>
            ) : (
              <>
                <Feather name="download-cloud" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.importTitle, { color: colors.textPrimary }]}>Base locale vide</Text>
                  <Text style={[styles.importSub, { color: colors.textSecondary }]}>Pré-charger ~1 500 produits depuis Open Beauty Facts</Text>
                </View>
                <Pressable style={[styles.importBtn, { backgroundColor: colors.primary }]} onPress={handleImport}>
                  <Text style={styles.importBtnText}>Charger</Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* ── SEARCH RESULTS ── */}
        {isSearching && nav.level === "cats" && (
          <>
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {searchResults.length} résultat{searchResults.length !== 1 ? "s" : ""}
            </Text>
            {searchResults.length === 0 && !searchLoading ? (
              <View style={styles.emptyBox}>
                <Feather name="search" size={36} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun résultat pour «{search}»</Text>
              </View>
            ) : (
              <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {searchResults.map((p) => (
                  <ProductRow key={p.id} product={p} />
                ))}
              </View>
            )}
          </>
        )}

        {/* ── LEVEL 1: CATEGORIES ── */}
        {!isSearching && nav.level === "cats" && (
          <AnimatedScreenTransition
            transitionKey="cats"
            direction={navDirection}
          >
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {CATEGORIES.map((cat, i) => (
                <AnimatedStaggeredItem key={cat.id} index={i} listKey="cats">
                  <View>
                    <CatRow cat={cat} onPress={() => pushCat(cat)} />
                    {i < CATEGORIES.length - 1 && (
                      <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                </AnimatedStaggeredItem>
              ))}
            </View>
          </AnimatedScreenTransition>
        )}

        {/* ── LEVEL 2: SUBCATEGORIES ── */}
        {nav.level === "subcats" && nav.cat && (
          <AnimatedScreenTransition
            transitionKey={`subcats-${nav.cat.id}`}
            direction={navDirection}
          >
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {nav.cat.subcategories.map((sub, i) => (
                <AnimatedStaggeredItem key={sub.id} index={i} listKey={`subcats-${nav.cat!.id}`}>
                  <SubRow
                    label={sub.label}
                    isLast={i === nav.cat!.subcategories.length}
                    onPress={() => pushSub(sub)}
                  />
                </AnimatedStaggeredItem>
              ))}
              <AnimatedStaggeredItem
                index={nav.cat.subcategories.length}
                listKey={`subcats-${nav.cat.id}`}
              >
                <SubRow
                  label={`Voir tous les produits ${nav.cat.label}`}
                  isSeeAll
                  isLast
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setNavDirection("forward");
                    setNav((n) => ({ ...n, level: "products", sub: null, subsub: null }));
                  }}
                />
              </AnimatedStaggeredItem>
            </View>
          </AnimatedScreenTransition>
        )}

        {/* ── LEVEL 3: SUB-SUBCATEGORIES ── */}
        {nav.level === "subsubcats" && nav.sub && (
          <AnimatedScreenTransition
            transitionKey={`subsubcats-${nav.sub.id}`}
            direction={navDirection}
          >
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {nav.sub.subs.map((ss, i) => (
                <AnimatedStaggeredItem key={ss.id} index={i} listKey={`subsubcats-${nav.sub!.id}`}>
                  <SubRow
                    label={ss.label}
                    isLast={i === nav.sub!.subs.length}
                    onPress={() => pushSubSub(ss)}
                  />
                </AnimatedStaggeredItem>
              ))}
              <AnimatedStaggeredItem
                index={nav.sub.subs.length}
                listKey={`subsubcats-${nav.sub.id}`}
              >
                <SubRow
                  label={`Voir tous les produits ${nav.sub.label}`}
                  isSeeAll
                  isLast
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setNavDirection("forward");
                    setNav((n) => ({ ...n, level: "products", subsub: null }));
                  }}
                />
              </AnimatedStaggeredItem>
            </View>
          </AnimatedScreenTransition>
        )}

        {/* ── LEVEL 4: PRODUCTS ── */}
        {nav.level === "products" && (
          <AnimatedScreenTransition
            transitionKey={`products-${nav.cat?.id ?? ""}-${nav.sub?.id ?? ""}-${nav.subsub?.id ?? ""}`}
            direction={navDirection}
          >
            {prodLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
            ) : products.length === 0 ? (
              <View style={styles.emptyBox}>
                <Feather name="package" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun produit trouvé</Text>
                <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
                  Lance une importation depuis l'onglet Catalogue ou scanne un produit
                </Text>
              </View>
            ) : (
              <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {products.map((p, i) => (
                  <AnimatedStaggeredItem
                    key={p.id}
                    index={i}
                    listKey={`products-${nav.cat?.id ?? ""}`}
                  >
                    <ProductRow product={p} />
                  </AnimatedStaggeredItem>
                ))}
              </View>
            )}
          </AnimatedScreenTransition>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", paddingHorizontal: 4 },
  drillHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  crumbWrap: { flex: 1, flexDirection: "row", alignItems: "center", flexWrap: "nowrap" },
  crumb: { fontSize: 14, fontFamily: "Inter_500Medium" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    marginHorizontal: 4,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  scroll: { paddingTop: 4, paddingHorizontal: 16 },
  importBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  importTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  importSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  importBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  importBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  listCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  catEmoji: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  catEmojiText: { fontSize: 22 },
  catLabel: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  subLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  productImg: { width: 64, height: 64, borderRadius: 12 },
  productInfo: { flex: 1, gap: 2 },
  productBrand: { fontSize: 10, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  productName: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  productCat: { fontSize: 11, fontFamily: "Inter_400Regular" },
  scoreBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 18 },
  scoreMax: { fontSize: 9, fontFamily: "Inter_400Regular" },
  resultCount: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  loadingBox: { height: 120, alignItems: "center", justifyContent: "center" },
  emptyBox: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  emptySubtext: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 20, lineHeight: 18 },
});
