import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductPreviewModal } from "@/components/ProductPreviewModal";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { MOCK_PRODUCTS, Product } from "@/constants/mockData";
import { lookupByBarcode as obfLookup } from "@/services/openBeautyFacts";
import {
  lookupProductByBarcode as getFirestoreProductByBarcode,
  saveProductToFirestore,
} from "@/services/firestoreProducts";

// ─── Extract barcode from URL or raw input ─────────────────────────────────
function extractBarcode(input: string): string | null {
  const clean = input.trim();
  // Raw barcode (8–14 digits)
  if (/^\d{8,14}$/.test(clean)) return clean;
  // OBF URL: openbeautyfacts.org/product/BARCODE/
  const obfMatch = clean.match(/openbeautyfacts\.org\/product\/(\d{8,14})/);
  if (obfMatch) return obfMatch[1];
  // Any URL fragment that looks like an EAN (8, 12, or 13 digits)
  const eanMatch = clean.match(/\b(\d{13}|\d{12}|\d{8})\b/);
  if (eanMatch) return eanMatch[1];
  return null;
}

// ─── Lookup helper: Firestore → OBF → mock ──────────────────────────────────
async function lookupProduct(barcode: string, addScannedProduct: (p: Product) => void): Promise<Product | null> {
  // 1. Firestore
  const fsProd = await getFirestoreProductByBarcode(barcode);
  if (fsProd) { addScannedProduct(fsProd); return fsProd; }

  // 2. OBF live API
  const obfProd = await obfLookup(barcode);
  if (obfProd) {
    addScannedProduct(obfProd);
    // Save to Firestore (fire-and-forget — non-blocking)
    saveProductToFirestore(obfProd).catch(() => {});
    return obfProd;
  }

  // 3. Local mock fallback
  const mock = MOCK_PRODUCTS.find((p) => p.id === barcode || p.barcode === barcode);
  if (mock) { addScannedProduct(mock); return mock; }

  return null;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ScannerModal() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToHistory, addScannedProduct } = useApp();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [tab, setTab] = useState<"scan" | "url">("scan");

  // URL tab state
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupNotFound, setPopupNotFound] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // ── Barcode scanner handler ────────────────────────────────────────────
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const product = await lookupProduct(data, addScannedProduct);
    if (product) {
      addToHistory(product.id);
      router.back();
      setTimeout(() => router.push(`/product/${product.id}`), 100);
    } else {
      router.back();
      setTimeout(() => router.push("/add-product"), 100);
    }
  };

  // ── URL / barcode lookup ────────────────────────────────────────────────
  const handleUrlLookup = async () => {
    const input = urlInput.trim();
    if (!input) return;
    Keyboard.dismiss();

    const barcode = extractBarcode(input);
    if (!barcode) {
      setPopupProduct(null);
      setPopupLoading(false);
      setPopupNotFound(true);
      setPopupVisible(true);
      return;
    }

    setPopupProduct(null);
    setPopupNotFound(false);
    setPopupLoading(true);
    setPopupVisible(true);
    setUrlLoading(true);

    try {
      const product = await lookupProduct(barcode, addScannedProduct);
      if (product) {
        addToHistory(product.id);
        setPopupProduct(product);
        setPopupNotFound(false);
      } else {
        setPopupNotFound(true);
      }
    } catch {
      setPopupNotFound(true);
    } finally {
      setPopupLoading(false);
      setUrlLoading(false);
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
    setPopupProduct(null);
    setPopupNotFound(false);
  };

  // ── Camera content ─────────────────────────────────────────────────────
  const renderCameraContent = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.webDemo}>
          <View style={styles.viewfinder}>
            <Corner pos="topLeft" color={colors.primary} />
            <Corner pos="topRight" color={colors.primary} />
            <Corner pos="bottomLeft" color={colors.primary} />
            <Corner pos="bottomRight" color={colors.primary} />
            <View style={[styles.scanLine, { backgroundColor: colors.primary }]} />
          </View>
          <View style={[styles.hint, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
            <Feather name="monitor" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.hintText}>Caméra disponible sur iOS / Android</Text>
          </View>
          <View style={styles.demoProducts}>
            {MOCK_PRODUCTS.slice(0, 3).map((p) => (
              <Pressable
                key={p.id}
                style={[styles.demoProduct, { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }]}
                onPress={() => {
                  addScannedProduct(p);
                  addToHistory(p.id);
                  router.back();
                  setTimeout(() => router.push(`/product/${p.id}`), 100);
                }}
              >
                <Feather name="package" size={14} color={colors.primary} />
                <Text style={styles.demoProductText} numberOfLines={1}>{p.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }

    if (!permission?.granted) {
      return (
        <View style={styles.permBox}>
          <View style={[styles.permIcon, { backgroundColor: colors.primaryDim }]}>
            <Feather name="camera-off" size={32} color={colors.primary} />
          </View>
          <Text style={styles.permTitle}>Accès caméra requis</Text>
          <Text style={styles.permText}>
            SkinScan a besoin de ta caméra pour scanner les codes-barres.
          </Text>
          <Pressable style={[styles.permBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
            <Feather name="camera" size={16} color="#fff" />
            <Text style={styles.permBtnText}>Autoriser</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.viewfinder}>
            <Corner pos="topLeft" color={colors.primary} />
            <Corner pos="topRight" color={colors.primary} />
            <Corner pos="bottomLeft" color={colors.primary} />
            <Corner pos="bottomRight" color={colors.primary} />
            <View style={[styles.scanLine, { backgroundColor: colors.primary }]} />
          </View>
        </View>
        <View style={[styles.hint, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <Feather name="camera" size={14} color="rgba(255,255,255,0.9)" />
          <Text style={styles.hintText}>
            {scanned ? "Produit détecté !" : "Centre le code-barres dans le viseur"}
          </Text>
        </View>
        {!scanned && (
          <Pressable
            style={[styles.addBtn, { borderColor: "rgba(255,255,255,0.3)" }]}
            onPress={() => { router.back(); setTimeout(() => router.push("/add-product"), 100); }}
          >
            <Feather name="plus" size={15} color="rgba(255,255,255,0.8)" />
            <Text style={styles.addBtnText}>Produit introuvable ? L'ajouter</Text>
          </Pressable>
        )}
      </>
    );
  };

  // ── URL tab content ────────────────────────────────────────────────────
  const renderUrlContent = () => (
    <View style={[styles.urlPane, { backgroundColor: "#0A0A0A" }]}>
      {/* Instructions */}
      <View style={[styles.urlCard, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }]}>
        <Text style={styles.urlCardTitle}>Comment ça marche ?</Text>
        <View style={styles.urlTip}>
          <View style={[styles.urlTipDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.urlTipText}>
            Colle un lien <Text style={{ color: "#fff" }}>Open Beauty Facts</Text> (openbeautyfacts.org/product/…)
          </Text>
        </View>
        <View style={styles.urlTip}>
          <View style={[styles.urlTipDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.urlTipText}>
            Ou tape directement un <Text style={{ color: "#fff" }}>code-barres EAN</Text> (8 à 14 chiffres)
          </Text>
        </View>
        <View style={styles.urlTip}>
          <View style={[styles.urlTipDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.urlTipText}>
            Pour Amazon/Sephora, copie l'EAN depuis la page produit et colle-le ici
          </Text>
        </View>
      </View>

      {/* Input */}
      <View style={[styles.urlInputRow, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)" }]}>
        <Feather name="link" size={16} color="rgba(255,255,255,0.4)" />
        <TextInput
          ref={inputRef}
          style={styles.urlInput}
          placeholder="URL ou code-barres EAN…"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={urlInput}
          onChangeText={setUrlInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleUrlLookup}
          multiline={false}
        />
        {urlInput.length > 0 && (
          <Pressable onPress={() => setUrlInput("")} hitSlop={8}>
            <Feather name="x" size={14} color="rgba(255,255,255,0.4)" />
          </Pressable>
        )}
      </View>

      <Pressable
        style={[
          styles.urlSearchBtn,
          { backgroundColor: urlInput.trim() ? colors.primary : "rgba(255,107,53,0.35)" },
        ]}
        onPress={handleUrlLookup}
        disabled={!urlInput.trim() || urlLoading}
      >
        {urlLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Feather name="search" size={16} color="#fff" />
            <Text style={styles.urlSearchBtnText}>Analyser</Text>
          </>
        )}
      </Pressable>

      {/* Examples */}
      <Text style={styles.urlExampleLabel}>Exemples valides :</Text>
      {[
        "3401399570937",
        "https://world.openbeautyfacts.org/product/3401399570937/",
      ].map((ex) => (
        <Pressable
          key={ex}
          style={[styles.urlExample, { borderColor: "rgba(255,255,255,0.1)" }]}
          onPress={() => { setUrlInput(ex); inputRef.current?.focus(); }}
        >
          <Feather name="copy" size={12} color="rgba(255,255,255,0.35)" />
          <Text style={styles.urlExampleText} numberOfLines={1}>{ex}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: "#000" }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.topTitle}>Scanner</Text>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="x" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: "rgba(255,255,255,0.07)" }]}>
        {(["scan", "url"] as const).map((t) => (
          <Pressable
            key={t}
            style={[styles.tabItem, tab === t && { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTab(t);
              if (t === "scan") setScanned(false);
            }}
          >
            <Feather
              name={t === "scan" ? "camera" : "link"}
              size={14}
              color={tab === t ? "#fff" : "rgba(255,255,255,0.5)"}
            />
            <Text style={[styles.tabLabel, { color: tab === t ? "#fff" : "rgba(255,255,255,0.5)" }]}>
              {t === "scan" ? "Caméra" : "URL / Code"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {tab === "scan" ? renderCameraContent() : renderUrlContent()}
      </View>

      {/* Product preview popup */}
      <ProductPreviewModal
        visible={popupVisible}
        product={popupProduct}
        loading={popupLoading}
        notFound={popupNotFound}
        onClose={closePopup}
      />
    </View>
  );
}

// ─── Corner helper ────────────────────────────────────────────────────────────
function Corner({ pos, color }: { pos: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"; color: string }) {
  const isTop = pos.startsWith("top");
  const isLeft = pos.endsWith("Left");
  return (
    <View style={[
      styles.corner,
      { borderColor: color },
      isTop ? { top: 0 } : { bottom: 0 },
      isLeft ? { left: 0, borderRightWidth: 0 } : { right: 0, borderLeftWidth: 0 },
      isTop ? { borderBottomWidth: 0 } : { borderTopWidth: 0 },
    ]} />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  topTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 3,
    marginBottom: 2,
    gap: 3,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { flex: 1 },
  // Camera
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  viewfinder: { position: "absolute", top: "28%", left: "8%", right: "8%", height: 210 },
  corner: { position: "absolute", width: 30, height: 30, borderWidth: 3 },
  scanLine: { position: "absolute", top: "50%", left: 0, right: 0, height: 2, opacity: 0.7 },
  hint: {
    position: "absolute", bottom: 160, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  hintText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.9)" },
  addBtn: {
    position: "absolute", bottom: 50, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 12,
  },
  addBtnText: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_500Medium" },
  webDemo: { flex: 1, backgroundColor: "#0D0D0D", position: "relative" },
  demoProducts: { position: "absolute", bottom: 80, left: 20, right: 20, gap: 8 },
  demoProduct: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
  },
  demoProductText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  permBox: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 16, paddingHorizontal: 40, backgroundColor: "#0A0A0A",
  },
  permIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  permTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  permText: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 22 },
  permBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14,
  },
  permBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  // URL tab
  urlPane: { flex: 1, padding: 20, gap: 14 },
  urlCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  urlCardTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  urlTip: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  urlTipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  urlTipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", lineHeight: 18 },
  urlInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  urlInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#fff" },
  urlSearchBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  urlSearchBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  urlExampleLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.3)", letterSpacing: 0.8, textTransform: "uppercase" },
  urlExample: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  urlExampleText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
});
