import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { analyzeIngredients } from "@/services/products/productAnalysisService";
import { ProductAnalysisResult } from "@/types/product";

interface ManualIngredientsInputProps {
  onResult?: (result: ProductAnalysisResult) => void;
  initialIngredients?: string;
  initialProductName?: string;
  initialBrand?: string;
}

interface RiskBadgeProps {
  level: "low" | "medium" | "high" | "unknown";
  label: string;
}

function RiskBadge({ level, label }: RiskBadgeProps) {
  const colors = useColors();
  const colorMap: Record<string, string> = {
    low: colors.success,
    medium: colors.warning,
    high: colors.danger,
    unknown: colors.mutedForeground,
  };
  const c = colorMap[level] ?? colors.mutedForeground;
  return (
    <View style={[styles.riskBadge, { backgroundColor: c + "20", borderColor: c + "40" }]}>
      <View style={[styles.riskDot, { backgroundColor: c }]} />
      <Text style={[styles.riskLabel, { color: c }]}>{label}</Text>
    </View>
  );
}

function AnalysisResultView({ result }: { result: ProductAnalysisResult }) {
  const colors = useColors();

  return (
    <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
          {result.productName}
        </Text>
        {result.brand && (
          <Text style={[styles.resultBrand, { color: colors.textSecondary }]}>
            {result.brand}
          </Text>
        )}

        <Text style={[styles.resultSummary, { color: colors.textSecondary }]}>
          {result.summary}
        </Text>

        <View style={styles.riskRow}>
          <RiskBadge
            level={result.irritationRiskLevel}
            label={`Irritation : ${result.irritationRiskLevel}`}
          />
          <RiskBadge
            level={result.comedogenicRiskLevel}
            label={`Comédogène : ${result.comedogenicRiskLevel}`}
          />
        </View>

        {result.positivePoints.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>
              Points positifs
            </Text>
            {result.positivePoints.map((p, i) => (
              <Text key={i} style={[styles.sectionItem, { color: colors.textSecondary }]}>
                {p}
              </Text>
            ))}
          </View>
        )}

        {result.warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.warning }]}>
              Alertes
            </Text>
            {result.warnings.map((w, i) => (
              <View
                key={i}
                style={[
                  styles.warningRow,
                  {
                    backgroundColor:
                      w.level === "avoid"
                        ? colors.dangerDim
                        : w.level === "caution"
                        ? colors.warningDim ?? colors.card
                        : colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather
                  name={w.level === "avoid" ? "x-circle" : "alert-triangle"}
                  size={13}
                  color={w.level === "avoid" ? colors.danger : colors.warning}
                />
                <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                  {w.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {result.sensitiveSkinNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Peaux sensibles
            </Text>
            {result.sensitiveSkinNotes.map((n, i) => (
              <Text key={i} style={[styles.sectionItem, { color: colors.textSecondary }]}>
                · {n}
              </Text>
            ))}
          </View>
        )}

        {result.acneSafetyNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Sécurité acné
            </Text>
            {result.acneSafetyNotes.map((n, i) => (
              <Text key={i} style={[styles.sectionItem, { color: colors.textSecondary }]}>
                · {n}
              </Text>
            ))}
          </View>
        )}

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          ⚠ Cette analyse est fournie à titre indicatif uniquement et ne constitue
          pas un avis médical.
        </Text>
      </View>
    </ScrollView>
  );
}

export function ManualIngredientsInput({
  onResult,
  initialIngredients = "",
  initialProductName = "",
  initialBrand = "",
}: ManualIngredientsInputProps) {
  const colors = useColors();
  const [productName, setProductName] = useState(initialProductName);
  const [brand, setBrand] = useState(initialBrand);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!ingredients.trim()) {
      setError("La liste d'ingrédients est requise pour lancer l'analyse.");
      return;
    }
    setError(null);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));
    const analysisResult = analyzeIngredients(
      ingredients,
      productName || "Produit sans nom",
      brand || undefined
    );
    setResult(analysisResult);
    onResult?.(analysisResult);
    setLoading(false);
  };

  if (result) {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.resetBtn}
          onPress={() => {
            setResult(null);
            setError(null);
          }}
        >
          <Feather name="arrow-left" size={14} color={colors.textSecondary} />
          <Text style={[styles.resetText, { color: colors.textSecondary }]}>
            Modifier les ingrédients
          </Text>
        </Pressable>
        <AnalysisResultView result={result} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
          Analyse manuelle
        </Text>
        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
          Collez la liste INCI pour obtenir une analyse instantanée.
        </Text>

        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border },
          ]}
          placeholder="Nom du produit (optionnel)"
          placeholderTextColor={colors.mutedForeground}
          value={productName}
          onChangeText={setProductName}
        />

        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border },
          ]}
          placeholder="Marque (optionnel)"
          placeholderTextColor={colors.mutedForeground}
          value={brand}
          onChangeText={setBrand}
        />

        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: colors.background, color: colors.textPrimary, borderColor: error ? colors.danger : colors.border },
          ]}
          placeholder="Aqua, Glycerin, Niacinamide, Parfum... (requis)"
          placeholderTextColor={colors.mutedForeground}
          value={ingredients}
          onChangeText={(t) => {
            setIngredients(t);
            if (error) setError(null);
          }}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {error && (
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        )}

        <Pressable
          style={[
            styles.analyzeBtn,
            { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
          ]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="zap" size={15} color="#fff" />
              <Text style={styles.analyzeBtnText}>Analyser les ingrédients</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  formTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  formSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    minHeight: 110,
  },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  analyzeBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  resetText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  resultScroll: { flex: 1 },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  resultTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  resultBrand: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  resultSummary: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  riskRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  riskDot: { width: 7, height: 7, borderRadius: 4 },
  riskLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
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
  disclaimer: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },
});
