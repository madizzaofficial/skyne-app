import { Feather } from "@expo/vector-icons";
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
import { useAuth } from "@/context/AuthContext";
import { useProfile, SkinType, SkinConcern, Goal, RoutineLevel } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";

const TOTAL_STEPS = 7;

type OptionItem = { id: string; label: string; desc?: string };

function OptionCard({
  option,
  selected,
  onPress,
  multi,
}: {
  option: OptionItem;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={[
        styles.optionCard,
        {
          backgroundColor: selected ? colors.primaryDim : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={styles.optionCheck}>
        {selected ? (
          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
            <Feather name="check" size={12} color="#fff" />
          </View>
        ) : (
          <View style={[styles.checkCircleEmpty, { borderColor: colors.border }]} />
        )}
      </View>
      <View style={styles.optionText}>
        <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>{option.label}</Text>
        {option.desc && (
          <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>{option.desc}</Text>
        )}
      </View>
    </Pressable>
  );
}

const COMMON_ALLERGENS = [
  "Parfum", "Lanoline", "Formaldéhyde", "Limonène", "Linalool",
  "Géraniol", "Citronellol", "Eugenol", "Cinnamal", "Coumarine",
  "Alpha-isomethyl ionone", "Benzyl benzoate", "Benzyl alcool",
  "Hydroxycitronellal", "Isoeugenol", "Cinnamyl alcool", "Farnesol",
  "Amyl cinnamal", "Hexyl cinnamal", "Butylphenyl methylpropional",
  "Méthylisothiazolinone", "Méthylchloroisothiazolinone", "Phénoxyéthanol",
  "Propylène glycol", "Alcool dénat.", "BHA", "BHT",
  "Parabènes", "Sulfates (SLS/SLES)", "Acide salicylique",
  "Quaternium-15", "DMDM hydantoïne", "Chlorphenesin",
];

function AllergenPicker({
  selected,
  input,
  onInputChange,
  onAdd,
  onRemove,
}: {
  selected: string[];
  input: string;
  onInputChange: (v: string) => void;
  onAdd: (allergen: string) => void;
  onRemove: (allergen: string) => void;
}) {
  const colors = useColors();

  const suggestions = COMMON_ALLERGENS.filter(
    (a) =>
      a.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(a) &&
      input.trim().length > 0
  ).slice(0, 6);

  const handleConfirmInput = () => {
    const trimmed = input.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onAdd(trimmed);
    }
  };

  return (
    <View style={{ gap: 10, marginTop: 8 }}>
      {/* Selected tags */}
      {selected.length > 0 && (
        <View style={apStyles.tagsWrap}>
          {selected.map((tag) => (
            <Pressable
              key={tag}
              style={[apStyles.tag, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "60" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRemove(tag);
              }}
            >
              <Text style={[apStyles.tagText, { color: colors.primary }]}>{tag}</Text>
              <Feather name="x" size={12} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Suggestions — shown ABOVE input so they're visible when keyboard is open */}
      {suggestions.length > 0 && (
        <View style={[apStyles.suggestBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {suggestions.map((s, i) => (
            <Pressable
              key={s}
              style={[
                apStyles.suggestRow,
                { borderTopColor: colors.border },
                i === 0 && { borderTopWidth: 0 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onAdd(s);
              }}
            >
              <Text style={[apStyles.suggestText, { color: colors.textPrimary }]}>{s}</Text>
              <View style={[apStyles.suggestPlus, { backgroundColor: colors.primaryDim }]}>
                <Feather name="plus" size={12} color={colors.primary} />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Input at the bottom */}
      <View style={[apStyles.inputRow, { backgroundColor: colors.card, borderColor: input.trim() ? colors.primary : colors.border }]}>
        <Feather name="search" size={16} color={colors.textSecondary} />
        <TextInput
          style={[apStyles.input, { color: colors.textPrimary }]}
          placeholder="Ex: parfum, lanoline…"
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={onInputChange}
          returnKeyType="done"
          onSubmitEditing={handleConfirmInput}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {input.trim().length > 0 && (
          <Pressable
            style={[apStyles.addBtn, { backgroundColor: colors.primary }]}
            onPress={handleConfirmInput}
          >
            <Feather name="plus" size={14} color="#fff" />
          </Pressable>
        )}
      </View>

      {/* Empty hint */}
      {selected.length === 0 && input.trim().length === 0 && (
        <Text style={[apStyles.hint, { color: colors.mutedForeground }]}>
          Tape pour rechercher ou ajouter un allergène personnalisé
        </Text>
      )}
    </View>
  );
}

const apStyles = StyleSheet.create({
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  addBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  suggestBox: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  suggestRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  suggestText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  suggestPlus: { width: 24, height: 24, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 4 },
});

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateProfile, setHasOnboarded } = useProfile();

  const { signUp } = useAuth();

  const [step, setStep] = useState(0);
  const [skinType, setSkinType] = useState<SkinType>(null);
  const [concerns, setConcerns] = useState<SkinConcern[]>([]);
  const [hasAllergies, setHasAllergies] = useState<boolean | null>(null);
  const [allergenesArray, setAllergenesArray] = useState<string[]>([]);
  const [allergenInput, setAllergenInput] = useState("");
  const [goal, setGoal] = useState<Goal>(null);
  const [routineLevel, setRoutineLevel] = useState<RoutineLevel>(null);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const progress = (step + 1) / TOTAL_STEPS;

  const skinTypes: OptionItem[] = [
    { id: "grasse", label: "Grasse", desc: "Brillances, pores dilatés" },
    { id: "seche", label: "Sèche", desc: "Tiraillements, inconfort" },
    { id: "mixte", label: "Mixte", desc: "Zone T grasse, joues sèches" },
    { id: "sensible", label: "Sensible", desc: "Rougeurs, réactivité" },
    { id: "normale", label: "Normale", desc: "Équilibrée, peu de problèmes" },
  ];

  const concernOptions: OptionItem[] = [
    { id: "acne", label: "Acné" },
    { id: "points_noirs", label: "Points noirs" },
    { id: "pores_dilates", label: "Pores dilatés" },
    { id: "cicatrices", label: "Cicatrices" },
    { id: "teint_terne", label: "Teint terne" },
    { id: "rougeurs", label: "Rougeurs" },
  ];

  const goalOptions: OptionItem[] = [
    { id: "reduire_acne", label: "Réduire l'acné", desc: "Cibler boutons et imperfections" },
    { id: "glow_up", label: "Glow up général", desc: "Peau plus belle globalement" },
    { id: "minimaliste", label: "Routine minimaliste", desc: "Le moins de produits possible" },
    { id: "comprendre", label: "Comprendre les ingrédients", desc: "Savoir ce que je mets sur ma peau" },
  ];

  const routineOptions: OptionItem[] = [
    { id: "aucune", label: "Aucune", desc: "Je me lave la tête c'est tout" },
    { id: "basique", label: "Basique", desc: "Eau + crème ou gel douche visage" },
    { id: "intermediaire", label: "Intermédiaire", desc: "Nettoyant + hydratant + SPF" },
    { id: "avancee", label: "Avancée", desc: "Actifs, sérums, plusieurs étapes" },
  ];

  const toggleConcern = (id: string) => {
    const c = id as SkinConcern;
    setConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const canNext = () => {
    switch (step) {
      case 0: return firstName.trim().length > 0;
      case 1: return skinType !== null;
      case 2: return true;
      case 3: return hasAllergies !== null;
      case 4: return goal !== null;
      case 5: return routineLevel !== null;
      case 6: return email.trim().length > 3 && password.length >= 6;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAuthError("");
      setStep((s) => s + 1);
    } else {
      if (!email.trim() || password.length < 6) {
        setAuthError("Remplis ton email et un mot de passe d'au moins 6 caractères.");
        return;
      }
      setAuthLoading(true);
      setAuthError("");
      try {
        await signUp(email.trim(), password, firstName.trim());
        await updateProfile({
          firstName,
          skinType,
          concerns,
          hasAllergies,
          allergenes: allergenesArray,
          goal,
          routineLevel,
          isComplete: true,
          accountType: "free",
        });
        await setHasOnboarded(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? "";
        if (code === "auth/email-already-in-use") {
          setAuthError("Cet email est déjà utilisé. Connecte-toi à la place.");
        } else if (code === "auth/invalid-email") {
          setAuthError("Adresse email invalide.");
        } else if (code === "auth/network-request-failed") {
          setAuthError("Problème réseau. Vérifie ta connexion.");
        } else {
          setAuthError("Erreur inattendue. Réessaie.");
        }
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const inputStyle = [
    styles.nameInput,
    { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary },
  ];

  const steps = [
    {
      title: "Comment tu t'appelles ?",
      subtitle: "On va personnaliser l'app pour toi.",
      content: (
        <View style={styles.inputWrapper}>
          <TextInput
            style={inputStyle}
            placeholder="Ton prénom"
            placeholderTextColor={colors.textSecondary}
            value={firstName}
            onChangeText={setFirstName}
            autoFocus
            returnKeyType="done"
          />
        </View>
      ),
    },
    {
      title: "Ton type de peau",
      subtitle: "Choisis celui qui te correspond le mieux.",
      content: skinTypes.map((opt) => (
        <OptionCard
          key={opt.id}
          option={opt}
          selected={skinType === opt.id}
          onPress={() => setSkinType(opt.id as SkinType)}
        />
      )),
    },
    {
      title: "Tes problèmes principaux",
      subtitle: "Sélection multiple — ou passe si t'as pas de problèmes.",
      content: concernOptions.map((opt) => (
        <OptionCard
          key={opt.id}
          option={opt}
          selected={concerns.includes(opt.id as SkinConcern)}
          onPress={() => toggleConcern(opt.id)}
          multi
        />
      )),
    },
    {
      title: "Allergies cosmétiques connues ?",
      subtitle: "On t'alertera si un produit contient ton allergène.",
      content: (
        <View style={{ gap: 10 }}>
          {[
            { id: true, label: "Oui, j'en ai", desc: "Je vais les préciser" },
            { id: false, label: "Non / Je ne sais pas", desc: "On surveillera les allergènes courants" },
          ].map((opt) => (
            <OptionCard
              key={String(opt.id)}
              option={{ id: String(opt.id), label: opt.label, desc: opt.desc }}
              selected={hasAllergies === opt.id}
              onPress={() => setHasAllergies(opt.id)}
            />
          ))}
          {hasAllergies === true && (
            <AllergenPicker
              selected={allergenesArray}
              input={allergenInput}
              onInputChange={setAllergenInput}
              onAdd={(a) => {
                if (!allergenesArray.includes(a)) setAllergenesArray((p) => [...p, a]);
                setAllergenInput("");
              }}
              onRemove={(a) => setAllergenesArray((p) => p.filter((x) => x !== a))}
            />
          )}
        </View>
      ),
    },
    {
      title: "Ton objectif principal",
      subtitle: "On adapte les recommandations à ton but.",
      content: goalOptions.map((opt) => (
        <OptionCard
          key={opt.id}
          option={opt}
          selected={goal === opt.id}
          onPress={() => setGoal(opt.id as Goal)}
        />
      )),
    },
    {
      title: "Ta routine actuelle",
      subtitle: "Sois honnête — on est là pour t'aider à progresser.",
      content: routineOptions.map((opt) => (
        <OptionCard
          key={opt.id}
          option={opt}
          selected={routineLevel === opt.id}
          onPress={() => setRoutineLevel(opt.id as RoutineLevel)}
        />
      )),
    },
    {
      title: "Crée ton compte",
      subtitle: `Dernière étape, ${firstName || "on y est presque"} ! Sauvegarde ton profil.`,
      content: (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={{ gap: 14 }}>
            <View style={styles.inputWrapper}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                style={inputStyle}
                placeholder="ton@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Mot de passe</Text>
              <View style={styles.pwRow}>
                <TextInput
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="Min. 6 caractères"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                  returnKeyType="done"
                />
                <Pressable
                  style={[styles.eyeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setShowPw((v) => !v)}
                >
                  <Feather name={showPw ? "eye-off" : "eye"} size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>
            <View style={[styles.recapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.recapTitle, { color: colors.textSecondary }]}>TON PROFIL</Text>
              {[
                { label: "Prénom", value: firstName },
                { label: "Type de peau", value: skinType || "—" },
                { label: "Objectif", value: goal?.replace(/_/g, " ") || "—" },
              ].map((r) => (
                <View key={r.label} style={[styles.recapRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.recapLabel, { color: colors.textSecondary }]}>{r.label}</Text>
                  <Text style={[styles.recapValue, { color: colors.textPrimary }]}>{r.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </KeyboardAvoidingView>
      ),
    },
  ];

  const current = steps[step];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => step === 0 ? router.replace("/auth") : setStep((s) => s - 1)}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={[styles.progressBar, { backgroundColor: colors.border, flex: 1, marginLeft: 16 }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${progress * 100}%` },
            ]}
          />
        </View>
        <Text style={[styles.stepCount, { color: colors.textSecondary }]}>
          {step + 1}/{TOTAL_STEPS}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top + 24}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>{current.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{current.subtitle}</Text>
          <View style={styles.options}>
            {Array.isArray(current.content) ? current.content : current.content}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {!!authError && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerDim, borderColor: colors.danger + "40" }]}>
              <Feather name="alert-circle" size={14} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{authError}</Text>
            </View>
          )}
          <Pressable
            style={[styles.nextBtn, { backgroundColor: canNext() && !authLoading ? colors.primary : colors.border }]}
            onPress={handleNext}
            disabled={!canNext() || authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={[styles.nextText, { color: canNext() ? "#fff" : colors.textSecondary }]}>
                  {step === TOTAL_STEPS - 1 ? "Créer mon compte" : "Continuer"}
                </Text>
                <Feather
                  name={step === TOTAL_STEPS - 1 ? "check" : "arrow-right"}
                  size={18}
                  color={canNext() ? "#fff" : colors.textSecondary}
                />
              </>
            )}
          </Pressable>
          {step === 2 && (
            <Pressable onPress={handleNext} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>Passer cette étape</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 32 },
  progressBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  stepCount: { fontSize: 12, fontFamily: "Inter_500Medium", minWidth: 32, textAlign: "right" },
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", lineHeight: 34, marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 28 },
  options: { gap: 10 },
  optionCard: { borderRadius: 14, padding: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  optionCheck: { width: 22 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  checkCircleEmpty: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  optionDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  inputWrapper: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginLeft: 2 },
  nameInput: { borderRadius: 14, borderWidth: 1, padding: 16, fontSize: 16, fontFamily: "Inter_400Regular" },
  pwRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  eyeBtn: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  recapCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginTop: 4 },
  recapTitle: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.8, padding: 12, paddingBottom: 6 },
  recapRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  recapLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  recapValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  footer: { paddingTop: 16, gap: 12 },
  nextBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52 },
  nextText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  skipBtn: { alignItems: "center", paddingVertical: 4 },
  skipText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
});
