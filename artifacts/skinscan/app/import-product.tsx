import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ManualIngredientsInput } from "@/components/product/ManualIngredientsInput";
import { useColors } from "@/hooks/useColors";
import {
  analyzeProductFromUrl,
  detectRetailerFromUrl,
  parseSharedProductInput,
  ImportedProductMetadata,
} from "@/services/import/sharedProductImportService";
import { ProductAnalysisResult } from "@/types/product";
import { analyzeIngredients } from "@/services/products/productAnalysisService";

type ScreenState =
  | "parsing"
  | "invalid_url"
  | "fetching"
  | "retailer_detected"
  | "no_ingredients"
  | "manual_input"
  | "result";

function RetailerBadge({ name }: { name: string }) {
  const colors = useColors();
  return (
    <View style={[styles.retailerBadge, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "30" }]}>
      <Feather name="shopping-bag" size={13} color={colors.primary} />
      <Text style={[styles.retailerBadgeText, { color: colors.primary }]}>
        Produit détecté depuis {name}
      </Text>
    </View>
  );
}

function AnalysisResultCard({ result }: { result: ProductAnalysisResult }) {
  const colors = useColors();
  const riskColor = (level: string) => {
    if (level === "low") return colors.success;
    if (level === "medium") return colors.warning;
    if (level === "high") return colors.danger;
    return colors.mutedForeground;
  };

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
        {result.productName}
      </Text>
      {result.brand && (
        <Text style={[styles.resultBrand, { color: colors.textSecondary }]}>
          {result.brand}
        </Text>
      )}

      <View style={styles.riskRow}>
        <View style={[styles.riskChip, { backgroundColor: riskColor(result.irritationRiskLevel) + "20", borderColor: riskColor(result.irritationRiskLevel) + "40" }]}>
          <View style={[styles.riskDot, { backgroundColor: riskColor(result.irritationRiskLevel) }]} />
          <Text style={[styles.riskText, { color: riskColor(result.irritationRiskLevel) }]}>
            Irritation : {result.irritationRiskLevel}
          </Text>
        </View>
        <View style={[styles.riskChip, { backgroundColor: riskColor(result.comedogenicRiskLevel) + "20", borderColor: riskColor(result.comedogenicRiskLevel) + "40" }]}>
          <View style={[styles.riskDot, { backgroundColor: riskColor(result.comedogenicRiskLevel) }]} />
          <Text style={[styles.riskText, { color: riskColor(result.comedogenicRiskLevel) }]}>
            Comédogène : {result.comedogenicRiskLevel}
          </Text>
        </View>
      </View>

      <Text style={[styles.summary, { color: colors.textSecondary }]}>{result.summary}</Text>

      {result.positivePoints.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.success }]}>Points positifs</Text>
          {result.positivePoints.map((p, i) => (
            <Text key={i} style={[styles.sectionItem, { color: colors.textSecondary }]}>{p}</Text>
          ))}
        </View>
      )}

      {result.warnings.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.warning }]}>Alertes</Text>
          {result.warnings.map((w, i) => (
            <View key={i} style={[styles.warningRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="alert-triangle" size={13} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>{w.message}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
        ⚠ Analyse indicative — pas un avis médical. Score de confiance : {result.confidenceScore}/100.
      </Text>
    </View>
  );
}

export default function ImportProductScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { url: rawUrl, text: rawText } = useLocalSearchParams<{
    url?: string;
    text?: string;
  }>();

  const [state, setState] = useState<ScreenState>("parsing");
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [retailerName, setRetailerName] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImportedProductMetadata | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const parsed = parseSharedProductInput({
      url: rawUrl ?? undefined,
      text: rawText ?? undefined,
    });

    if (!parsed.isValid || !parsed.url) {
      setErrorMessage(parsed.errorReason ?? "URL invalide.");
      setState("invalid_url");
      return;
    }

    setSharedUrl(parsed.url);
    setRetailerName(parsed.retailer?.displayName ?? "Autre site");
    setState("fetching");

    analyzeProductFromUrl(parsed.url)
      .then((meta) => {
        setMetadata(meta);
        setState("retailer_detected");
      })
      .catch(() => {
        setState("no_ingredients");
      });
  }, [rawUrl, rawText]);

  const handleAnalyzeFromUrl = async () => {
    if (!metadata) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!metadata.rawIngredients) {
      setState("no_ingredients");
      return;
    }

    const result = analyzeIngredients(
      metadata.rawIngredients,
      metadata.name ?? "Produit importé",
      metadata.brand
    );
    setAnalysisResult(result);
    setState("result");
  };

  const handleManualResult = (result: ProductAnalysisResult) => {
    setAnalysisResult(result);
    setState("result");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Analyser un produit
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── PARSING ── */}
        {state === "parsing" && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Analyse du lien partagé...
            </Text>
          </View>
        )}

        {/* ── FETCHING ── */}
        {state === "fetching" && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>
              Analyse du produit en cours...
            </Text>
            {sharedUrl && (
              <Text
                style={[styles.urlText, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {sharedUrl}
              </Text>
            )}
          </View>
        )}

        {/* ── INVALID URL ── */}
        {state === "invalid_url" && (
          <View style={styles.errorBox}>
            <View style={[styles.errorIcon, { backgroundColor: colors.dangerDim }]}>
              <Feather name="alert-circle" size={28} color={colors.danger} />
            </View>
            <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
              Lien invalide
            </Text>
            <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
              {errorMessage}
            </Text>
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => setState("manual_input")}
            >
              <Feather name="edit-3" size={14} color="#fff" />
              <Text style={styles.primaryBtnText}>Coller des ingrédients manuellement</Text>
            </Pressable>
          </View>
        )}

        {/* ── RETAILER DETECTED ── */}
        {state === "retailer_detected" && (
          <View style={styles.detectedBox}>
            {retailerName && <RetailerBadge name={retailerName} />}
            {sharedUrl && (
              <Text
                style={[styles.urlText, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {sharedUrl}
              </Text>
            )}

            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="info" size={15} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                L'extraction des ingrédients depuis ce site nécessite une analyse backend.
                Tu peux coller la liste INCI manuellement pour obtenir l'analyse immédiatement.
              </Text>
            </View>

            <Pressable
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleAnalyzeFromUrl();
              }}
            >
              <Feather name="zap" size={14} color="#fff" />
              <Text style={styles.primaryBtnText}>Analyser ce produit</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setState("manual_input");
              }}
            >
              <Feather name="edit-3" size={14} color={colors.textPrimary} />
              <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>
                Coller les ingrédients manuellement
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── NO INGREDIENTS ── */}
        {state === "no_ingredients" && (
          <View style={styles.errorBox}>
            <View style={[styles.errorIcon, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
              <Feather name="package" size={28} color={colors.textSecondary} />
            </View>
            <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
              Ingrédients introuvables
            </Text>
            <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
              Impossible d'extraire automatiquement les ingrédients de cette page.
              Colle la liste INCI ci-dessous pour continuer.
            </Text>
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => setState("manual_input")}
            >
              <Feather name="edit-3" size={14} color="#fff" />
              <Text style={styles.primaryBtnText}>Entrer les ingrédients</Text>
            </Pressable>
          </View>
        )}

        {/* ── MANUAL INPUT ── */}
        {state === "manual_input" && (
          <ManualIngredientsInput
            onResult={handleManualResult}
            initialProductName={metadata?.name}
            initialBrand={metadata?.brand}
          />
        )}

        {/* ── RESULT ── */}
        {state === "result" && analysisResult && (
          <View style={styles.resultBox}>
            {retailerName && <RetailerBadge name={retailerName} />}
            <AnalysisResultCard result={analysisResult} />
            <Pressable
              style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 8 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setState("manual_input");
              }}
            >
              <Feather name="edit-3" size={14} color={colors.textSecondary} />
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                Modifier les ingrédients
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  centerBox: { alignItems: "center", paddingVertical: 60, gap: 14 },
  statusText: { fontSize: 15, fontFamily: "Inter_500Medium", textAlign: "center" },
  urlText: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 24 },
  errorBox: { alignItems: "center", paddingVertical: 32, gap: 16, paddingHorizontal: 8 },
  errorIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  errorTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  errorDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  detectedBox: { gap: 14 },
  retailerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  retailerBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  infoText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    width: "100%",
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 13,
    width: "100%",
  },
  secondaryBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  resultBox: { gap: 12 },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  resultTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  resultBrand: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  riskRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  riskChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  riskDot: { width: 7, height: 7, borderRadius: 4 },
  riskText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  summary: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  sectionItem: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  warningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  warningText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16 },
});
