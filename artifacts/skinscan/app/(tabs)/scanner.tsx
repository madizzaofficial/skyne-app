import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { MOCK_PRODUCTS } from "@/constants/mockData";
import {
  lookupProductByBarcodeViaBackend,
  searchProductsViaBackend,
} from "@/services/backendProductService";
import { lookupByBarcode as obfLookupByBarcode } from "@/services/openBeautyFacts";
import {
  lookupProductByBarcode as firestoreLookupByBarcode,
  saveProductToFirestore,
} from "@/services/firestoreProducts";

type ScanMode = "barcode" | "search" | "inci";

export default function ScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToHistory, addScannedProduct } = useApp();

  const [mode, setMode] = useState<ScanMode>("barcode");
  const [searchQuery, setSearchQuery] = useState("");
  const [inciText, setInciText] = useState("");
  const [searchResults, setSearchResults] = useState(MOCK_PRODUCTS);
  const [searchLoading, setSearchLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState("Centre le code-barres dans le viseur");
  const [permission, requestPermission] = useCameraPermissions();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(MOCK_PRODUCTS);
      return;
    }
    const q = query.toLowerCase();
    const localMockResults = MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setSearchResults(localMockResults);

    if (query.trim().length >= 3) {
      setSearchLoading(true);
      try {
        const backendResults = await searchProductsViaBackend(query.trim(), 10);
        const existingIds = new Set(localMockResults.map((p) => p.id));
        const newResults = backendResults.filter((p) => !existingIds.has(p.id));
        newResults.forEach((p) => addScannedProduct(p));
        setSearchResults([...localMockResults, ...newResults]);
      } catch {}
      setSearchLoading(false);
    }
  };

  const handleAnalyzeInci = () => {
    if (!inciText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToHistory(MOCK_PRODUCTS[0].id);
    router.push(`/product/${MOCK_PRODUCTS[0].id}`);
  };

  /**
   * Barcode scan flow (priority order):
   * 1. Check mock data (instant)
   * 2. Check Firestore (our imported DB)
   * 3. Check Open Beauty Facts API (live)
   * 4. Not found → manual entry
   */
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || scanLoading) return;
    setScanned(true);
    setScanLoading(true);
    setScanStatus("Code détecté !");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // 1. Mock data (instant — for demo/offline)
      const mockMatch = MOCK_PRODUCTS.find((p) => p.barcode === data || p.id === data);
      if (mockMatch) {
        addToHistory(mockMatch.id);
        router.push(`/product/${mockMatch.id}`);
        return;
      }

      setScanStatus("Recherche du produit…");

      // 2. Firestore (cached — only if already has INCI data)
      const fsProd = await firestoreLookupByBarcode(data);
      if (fsProd && fsProd.ingredients.length > 0) {
        addScannedProduct(fsProd);
        addToHistory(fsProd.id);
        router.push(`/product/${fsProd.id}`);
        return;
      }

      // 3. Open Beauty Facts direct lookup (always for full INCI)
      setScanStatus("Analyse des ingrédients…");
      const obfProd = await obfLookupByBarcode(data);
      if (obfProd) {
        const final = fsProd
          ? { ...fsProd, ingredients: obfProd.ingredients, properties: obfProd.properties, incompatibilities: obfProd.incompatibilities }
          : obfProd;
        addScannedProduct(final);
        addToHistory(final.id);
        if (final.ingredients.length > 0) saveProductToFirestore(final).catch(() => {});
        router.push(`/product/${final.id}`);
        return;
      }

      // 4. Firestore without INCI (better than nothing)
      if (fsProd) {
        addScannedProduct(fsProd);
        addToHistory(fsProd.id);
        router.push(`/product/${fsProd.id}`);
        return;
      }

      // 5. Not found — offer contribution
      setScanStatus("Produit introuvable dans Open Beauty Facts");
      router.push("/add-product");
    } finally {
      setScanLoading(false);
      setTimeout(() => {
        setScanned(false);
        setScanStatus("Centre le code-barres dans le viseur");
      }, 4000);
    }
  };

  const ModeTab = ({ m, label, icon }: { m: ScanMode; label: string; icon: string }) => (
    <Pressable
      style={[styles.modeTab, { backgroundColor: mode === m ? colors.primary : "transparent" }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setMode(m);
      }}
    >
      <Feather name={icon as any} size={14} color={mode === m ? "#fff" : colors.textSecondary} />
      <Text style={[styles.modeTabText, { color: mode === m ? "#fff" : colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );

  const renderBarcodeMode = () => {
    if (Platform.OS === "web") {
      return (
        <View style={[styles.cameraContainer, { backgroundColor: "#111" }]}>
          <View style={styles.cameraSimBg}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
              <View style={[styles.scanLine, { backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.cameraHint}>
              <View style={[styles.hintPill, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                <Feather name="monitor" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.hintText}>Caméra disponible sur iOS/Android</Text>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.demoBar,
              { paddingBottom: insets.bottom + 16, backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.demoLabel, { color: colors.textSecondary }]}>
              Produits démo — tape pour voir la fiche :
            </Text>
            <View style={styles.demoProducts}>
              {MOCK_PRODUCTS.slice(0, 3).map((p) => (
                <Pressable
                  key={p.id}
                  style={[
                    styles.demoProduct,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    addToHistory(p.id);
                    router.push(`/product/${p.id}`);
                  }}
                >
                  <Feather name="package" size={14} color={colors.primary} />
                  <Text
                    style={[styles.demoProductText, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      );
    }

    if (!permission) {
      return (
        <View style={[styles.permBox, { backgroundColor: colors.background }]}>
          <View style={[styles.permIcon, { backgroundColor: colors.primaryDim }]}>
            <Feather name="camera" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.permTitle, { color: colors.textPrimary }]}>Chargement…</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={[styles.permBox, { backgroundColor: colors.background }]}>
          <View style={[styles.permIcon, { backgroundColor: colors.primaryDim }]}>
            <Feather name="camera-off" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.permTitle, { color: colors.textPrimary }]}>Accès caméra requis</Text>
          <Text style={[styles.permText, { color: colors.textSecondary }]}>
            SkinScan a besoin d'accéder à ta caméra pour scanner les codes-barres.
          </Text>
          <Pressable
            style={[styles.permBtn, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Feather name="camera" size={16} color="#fff" />
            <Text style={styles.permBtnText}>Autoriser la caméra</Text>
          </Pressable>
          <Pressable
            style={[styles.permSkip, { borderColor: colors.border }]}
            onPress={() => {
              addToHistory(MOCK_PRODUCTS[0].id);
              router.push(`/product/${MOCK_PRODUCTS[0].id}`);
            }}
          >
            <Text style={[styles.permSkipText, { color: colors.textSecondary }]}>
              Voir un produit démo
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          autofocus="on"
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        {scanLoading && (
          <View style={styles.scanLoadingOverlay}>
            <View style={[styles.scanLoadingPill, { backgroundColor: "rgba(0,0,0,0.85)" }]}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.scanLoadingText}>{scanStatus}</Text>
            </View>
          </View>
        )}

        <View style={styles.overlay}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
            <View style={[styles.scanLine, { backgroundColor: colors.primary }]} />
          </View>
        </View>

        <View style={styles.cameraHint}>
          <View style={[styles.hintPill, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <Feather name="camera" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={[styles.hintText, { color: "rgba(255,255,255,0.9)" }]}>{scanStatus}</Text>
          </View>
        </View>

        <View
          style={[
            styles.cameraBottom,
            { paddingBottom: insets.bottom + 16, backgroundColor: "rgba(0,0,0,0.6)" },
          ]}
        >
          <Pressable
            style={[styles.addManualBtn, { borderColor: "rgba(255,255,255,0.3)" }]}
            onPress={() => router.push("/add-product")}
          >
            <Feather name="plus" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.addManualText}>Produit introuvable ? L'ajouter manuellement</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.modeTabs,
          { paddingTop: insets.top + 16, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Scanner</Text>
        <View
          style={[
            styles.modeTabsRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <ModeTab m="barcode" label="Code-barres" icon="camera" />
          <ModeTab m="search" label="Recherche" icon="search" />
          <ModeTab m="inci" label="Liste INCI" icon="edit-3" />
        </View>

        {/* Share Extension shortcut */}
        <Pressable
          style={[styles.linkImportBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/import-product");
          }}
        >
          <View style={[styles.linkImportIcon, { backgroundColor: colors.primaryDim }]}>
            <Feather name="link" size={14} color={colors.primary} />
          </View>
          <Text style={[styles.linkImportText, { color: colors.textSecondary }]}>
            Analyser depuis un lien produit (Amazon, Sephora…)
          </Text>
          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {mode === "barcode" && renderBarcodeMode()}

      {mode === "search" && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.searchContainer, { paddingHorizontal: 20 }]}>
            <View
              style={[
                styles.searchBar,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Feather name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Nom du produit, marque..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
                returnKeyType="search"
              />
              {searchLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : searchQuery.length > 0 ? (
                <Pressable onPress={() => handleSearch("")}>
                  <Feather name="x" size={16} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          </View>
          <ScrollView
            contentContainerStyle={[
              styles.searchResults,
              { paddingBottom: insets.bottom + 90 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={[
                styles.resultCount,
                { color: colors.textSecondary, paddingHorizontal: 20 },
              ]}
            >
              {searchResults.length} produit{searchResults.length > 1 ? "s" : ""}
            </Text>
            {searchResults.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.resultItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  addScannedProduct(p);
                  addToHistory(p.id);
                  router.push(`/product/${p.id}`);
                }}
              >
                <View style={[styles.resultIcon, { backgroundColor: colors.card }]}>
                  <Feather name="package" size={20} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultBrand, { color: colors.textSecondary }]}>
                    {p.brand}
                  </Text>
                  <Text style={[styles.resultName, { color: colors.textPrimary }]}>{p.name}</Text>
                  <Text style={[styles.resultCat, { color: colors.textSecondary }]}>
                    {p.category} · {p.subcategory}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {mode === "inci" && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.inciContainer,
              { paddingHorizontal: 20, paddingBottom: insets.bottom + 90 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.inciTitle, { color: colors.textPrimary }]}>
              Colle ou tape la liste INCI
            </Text>
            <Text style={[styles.inciSub, { color: colors.textSecondary }]}>
              Copie-colle la liste d'ingrédients depuis n'importe quelle source
            </Text>
            <TextInput
              style={[
                styles.inciInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Aqua, Glycerin, Niacinamide, Parfum..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={inciText}
              onChangeText={setInciText}
              autoFocus
            />
            <Pressable
              style={[
                styles.analyzeBtn,
                { backgroundColor: inciText.trim() ? colors.primary : colors.border },
              ]}
              onPress={handleAnalyzeInci}
              disabled={!inciText.trim()}
            >
              <Feather
                name="zap"
                size={18}
                color={inciText.trim() ? "#fff" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.analyzeBtnText,
                  { color: inciText.trim() ? "#fff" : colors.textSecondary },
                ]}
              >
                Analyser les ingrédients
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modeTabs: { paddingHorizontal: 20, paddingBottom: 16 },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 16 },
  modeTabsRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 2,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modeTabText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  linkImportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  linkImportIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  linkImportText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium" },
  cameraContainer: { flex: 1, position: "relative" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  scanLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scanLoadingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
  },
  scanLoadingText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  cameraSimBg: { flex: 1, backgroundColor: "#0D0D0D", position: "relative" },
  viewfinder: { position: "absolute", top: "25%", left: "10%", right: "10%", height: 200 },
  corner: { position: "absolute", width: 24, height: 24, borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: "absolute", top: "50%", left: 0, right: 0, height: 2, opacity: 0.7 },
  cameraHint: { position: "absolute", bottom: 160, left: 0, right: 0, alignItems: "center" },
  hintPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  cameraBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  addManualBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
  },
  addManualText: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_500Medium" },
  demoBar: { paddingHorizontal: 20, paddingTop: 16 },
  demoLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  demoProducts: { gap: 8 },
  demoProduct: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  demoProductText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  permBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  permIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  permTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  permText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  permBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  permBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  permSkip: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10 },
  permSkipText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  searchContainer: { paddingTop: 16, paddingBottom: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  searchResults: { gap: 0 },
  resultCount: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultIcon: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  resultBrand: { fontSize: 11, fontFamily: "Inter_400Regular" },
  resultName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  resultCat: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  inciContainer: { paddingTop: 20, gap: 16 },
  inciTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  inciSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: -8 },
  inciInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 160,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  analyzeBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  analyzeBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
