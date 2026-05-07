import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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
import { useProfile, SkinType, SkinConcern, Goal, RoutineLevel } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";

const SKIN_TYPES = [
  { id: "grasse", label: "Grasse" },
  { id: "seche", label: "Sèche" },
  { id: "mixte", label: "Mixte" },
  { id: "sensible", label: "Sensible" },
  { id: "normale", label: "Normale" },
];

const CONCERNS = [
  { id: "acne", label: "Acné" },
  { id: "points_noirs", label: "Points noirs" },
  { id: "pores_dilates", label: "Pores dilatés" },
  { id: "cicatrices", label: "Cicatrices" },
  { id: "teint_terne", label: "Teint terne" },
  { id: "rougeurs", label: "Rougeurs" },
];

const GOALS = [
  { id: "reduire_acne", label: "Réduire l'acné" },
  { id: "glow_up", label: "Glow up général" },
  { id: "minimaliste", label: "Routine minimaliste" },
  { id: "comprendre", label: "Comprendre les ingrédients" },
];

const ROUTINES = [
  { id: "aucune", label: "Aucune" },
  { id: "basique", label: "Basique" },
  { id: "intermediaire", label: "Intermédiaire" },
  { id: "avancee", label: "Avancée" },
];

function ChipSelect({
  options,
  selected,
  onToggle,
  multi = false,
}: {
  options: { id: string; label: string }[];
  selected: string | string[] | null;
  onToggle: (id: string) => void;
  multi?: boolean;
}) {
  const colors = useColors();
  const isSelected = (id: string) =>
    multi ? (selected as string[])?.includes(id) : selected === id;

  return (
    <View style={chipStyles.row}>
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          style={[
            chipStyles.chip,
            {
              backgroundColor: isSelected(opt.id) ? colors.primaryDim : colors.card,
              borderColor: isSelected(opt.id) ? colors.primary : colors.border,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle(opt.id);
          }}
        >
          {isSelected(opt.id) && (
            <Feather name="check" size={12} color={colors.primary} />
          )}
          <Text style={[chipStyles.chipText, { color: isSelected(opt.id) ? colors.primary : colors.textSecondary }]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [skinType, setSkinType] = useState<SkinType>(profile.skinType || null);
  const [concerns, setConcerns] = useState<SkinConcern[]>(profile.concerns || []);
  const [goal, setGoal] = useState<Goal>(profile.goal || null);
  const [routineLevel, setRoutineLevel] = useState<RoutineLevel>(profile.routineLevel || null);
  const [allergenesText, setAllergenesText] = useState((profile.allergenes || []).join(", "));
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleConcern = (id: string) => {
    const c = id as SkinConcern;
    setConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "Autorise l'accès à la galerie pour changer ta photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert("Erreur", "Le prénom ne peut pas être vide.");
      return;
    }
    setSaving(true);
    await updateProfile({
      firstName: firstName.trim(),
      skinType,
      concerns,
      goal,
      routineLevel,
      allergenes: allergenesText.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary },
  ];

  const sectionCard = [styles.section, { backgroundColor: colors.card, borderColor: colors.border }];

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          hitSlop={12}
        >
          <Feather name="x" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Modifier le profil</Text>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: saving ? colors.border : colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveBtnText, { color: saving ? colors.mutedForeground : "#fff" }]}>
            {saving ? "..." : "Sauver"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryDim }]}>
                <Text style={[styles.avatarLetter, { color: colors.primary }]}>
                  {firstName.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
            )}
            <View style={[styles.avatarEdit, { backgroundColor: colors.primary }]}>
              <Feather name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
          <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
            Appuie pour changer la photo
          </Text>
        </View>

        {/* Prénom */}
        <View style={sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRÉNOM</Text>
          <View style={styles.sectionBody}>
            <TextInput
              style={inputStyle}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Ton prénom"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Type de peau */}
        <View style={sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TYPE DE PEAU</Text>
          <View style={styles.sectionBody}>
            <ChipSelect
              options={SKIN_TYPES}
              selected={skinType}
              onToggle={(id) => setSkinType(skinType === id ? null : id as SkinType)}
            />
          </View>
        </View>

        {/* Problèmes */}
        <View style={sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PROBLÈMES (multi-sélection)</Text>
          <View style={styles.sectionBody}>
            <ChipSelect
              options={CONCERNS}
              selected={concerns}
              onToggle={toggleConcern}
              multi
            />
          </View>
        </View>

        {/* Objectif */}
        <View style={sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>OBJECTIF</Text>
          <View style={styles.sectionBody}>
            <ChipSelect
              options={GOALS}
              selected={goal}
              onToggle={(id) => setGoal(goal === id ? null : id as Goal)}
            />
          </View>
        </View>

        {/* Routine */}
        <View style={sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NIVEAU DE ROUTINE</Text>
          <View style={styles.sectionBody}>
            <ChipSelect
              options={ROUTINES}
              selected={routineLevel}
              onToggle={(id) => setRoutineLevel(routineLevel === id ? null : id as RoutineLevel)}
            />
          </View>
        </View>

        {/* Allergènes */}
        <View style={sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ALLERGÈNES (séparés par virgule)</Text>
          <View style={styles.sectionBody}>
            <TextInput
              style={[inputStyle, { minHeight: 80, textAlignVertical: "top" }]}
              value={allergenesText}
              onChangeText={setAllergenesText}
              placeholder="parfum, lanoline, formaldéhyde..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold" },
  saveBtn: {
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
  },
  saveBtnText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  content: { padding: 16, gap: 14 },
  avatarSection: { alignItems: "center", paddingVertical: 8, gap: 8 },
  avatarWrap: { position: "relative" },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: "center", justifyContent: "center",
  },
  avatarLetter: { fontSize: 36, fontFamily: "Inter_700Bold" },
  avatarEdit: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  avatarHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.8,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
  },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14 },
  input: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontFamily: "Inter_400Regular",
  },
});
