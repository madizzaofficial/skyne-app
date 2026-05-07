import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["Nettoyant", "Hydratant", "Sérum", "SPF", "Exfoliant", "Masque", "Contour des yeux", "Autre"];
const SKIN_TYPES_OPT = ["Tous types", "Grasse", "Sèche", "Mixte", "Sensible", "Normale"];

export default function AddProductScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("");
  const [skinType, setSkinType] = useState("");
  const [inci, setInci] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary },
  ];

  const canSubmit = brand.trim() && name.trim() && inci.trim() && category;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert("Champs requis", "Remplis au minimum la marque, le nom, la catégorie et la liste INCI.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Produit ajouté ! 🎉",
      `${brand} – ${name} a été soumis à la communauté SkinScan. Il sera analysé et disponible prochainement.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          hitSlop={12}
        >
          <Feather name="x" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ajouter un produit</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Code-barres non trouvé — aide la communauté
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "30" }]}>
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Ton ajout sera validé par l'équipe SkinScan avant d'être accessible à tous les utilisateurs.
          </Text>
        </View>

        {/* Champs obligatoires */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>INFORMATIONS PRODUIT *</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Marque *</Text>
            <TextInput
              style={[styles.inlineInput, { color: colors.textPrimary }]}
              placeholder="Ex: CeraVe, La Roche-Posay..."
              placeholderTextColor={colors.mutedForeground}
              value={brand}
              onChangeText={setBrand}
              returnKeyType="next"
            />
          </View>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nom *</Text>
            <TextInput
              style={[styles.inlineInput, { color: colors.textPrimary }]}
              placeholder="Nom complet du produit"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
          </View>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Code-barres</Text>
            <TextInput
              style={[styles.inlineInput, { color: colors.textPrimary }]}
              placeholder="EAN-13 ou UPC"
              placeholderTextColor={colors.mutedForeground}
              value={barcode}
              onChangeText={setBarcode}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Prix</Text>
            <TextInput
              style={[styles.inlineInput, { color: colors.textPrimary }]}
              placeholder="Ex: 12,90 €"
              placeholderTextColor={colors.mutedForeground}
              value={price}
              onChangeText={setPrice}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Catégorie */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>CATÉGORIE *</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.chip,
                {
                  backgroundColor: category === cat ? colors.primaryDim : colors.card,
                  borderColor: category === cat ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCategory(cat);
              }}
            >
              <Text style={[styles.chipText, { color: category === cat ? colors.primary : colors.textSecondary }]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Type de peau */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>TYPE DE PEAU RECOMMANDÉ</Text>
        <View style={styles.chips}>
          {SKIN_TYPES_OPT.map((st) => (
            <Pressable
              key={st}
              style={[
                styles.chip,
                {
                  backgroundColor: skinType === st ? colors.primaryDim : colors.card,
                  borderColor: skinType === st ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSkinType(st);
              }}
            >
              <Text style={[styles.chipText, { color: skinType === st ? colors.primary : colors.textSecondary }]}>
                {st}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* INCI */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>LISTE INCI *</Text>
        <Text style={[styles.groupHint, { color: colors.mutedForeground }]}>
          Copie la liste d'ingrédients depuis l'emballage ou le site de la marque
        </Text>
        <TextInput
          style={[
            styles.inciInput,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary },
          ]}
          placeholder="Aqua, Glycerin, Niacinamide, Ceramide NP..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={inci}
          onChangeText={setInci}
        />

        {/* Submit */}
        <Pressable
          style={[
            styles.submitBtn,
            { backgroundColor: canSubmit && !loading ? colors.primary : colors.border },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
        >
          <Feather name={loading ? "loader" : "send"} size={18} color={canSubmit && !loading ? "#fff" : colors.mutedForeground} />
          <Text style={[styles.submitText, { color: canSubmit && !loading ? "#fff" : colors.mutedForeground }]}>
            {loading ? "Envoi en cours..." : "Soumettre le produit"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  content: { padding: 16, gap: 12 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  groupLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 2,
  },
  groupHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -8,
    marginBottom: 6,
    marginLeft: 2,
  },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium", width: 90 },
  inlineInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 14 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  inciInput: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 130,
    lineHeight: 22,
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
