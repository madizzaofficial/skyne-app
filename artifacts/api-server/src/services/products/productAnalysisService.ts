import type {
  AnalyzedIngredient,
  ComedogenicRiskLevel,
  IrritationRiskLevel,
  ProductAnalysisResult,
} from "../../types/product";

interface IngredientRule {
  commonName: string;
  function: string;
  safetyLevel: "safe" | "caution" | "avoid";
  isAllergen?: boolean;
  benefits?: string[];
  concerns?: string[];
  flagFragrance?: boolean;
  flagAlcohol?: boolean;
  flagSensitive?: boolean;
  flagComedogenic?: boolean;
}

const INGREDIENT_DB: Record<string, IngredientRule> = {
  // Water / solvents
  aqua: { commonName: "Eau", function: "Solvant", safetyLevel: "safe", benefits: ["Hydratation"] },
  water: { commonName: "Eau", function: "Solvant", safetyLevel: "safe", benefits: ["Hydratation"] },

  // Humectants
  glycerin: { commonName: "Glycérine", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratation intense"] },
  glycerol: { commonName: "Glycérine", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratation intense"] },
  "sodium hyaluronate": { commonName: "Acide hyaluronique (sel)", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratation profonde", "Repulpe"] },
  "hyaluronic acid": { commonName: "Acide hyaluronique", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratation intense"] },
  "butylene glycol": { commonName: "Butylène Glycol", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratant léger"] },
  "propylene glycol": { commonName: "Propylène Glycol", function: "Humectant", safetyLevel: "caution", concerns: ["Peut irriter les peaux sensibles"], flagSensitive: true },
  panthenol: { commonName: "Provitamine B5", function: "Humectant / Apaisant", safetyLevel: "safe", benefits: ["Cicatrisant", "Hydratant", "Apaisant"] },

  // Actives
  niacinamide: { commonName: "Vitamine B3 (Niacinamide)", function: "Actif multi-fonctions", safetyLevel: "safe", benefits: ["Réduit les pores", "Contrôle le sébum", "Anti-taches"] },
  retinol: { commonName: "Rétinol", function: "Anti-âge", safetyLevel: "caution", concerns: ["Peut irriter", "SPF obligatoire le matin"] },
  "ascorbic acid": { commonName: "Vitamine C", function: "Antioxydant", safetyLevel: "safe", benefits: ["Éclat", "Anti-oxydant", "Anti-taches"] },
  tocopherol: { commonName: "Vitamine E", function: "Antioxydant", safetyLevel: "safe", benefits: ["Antioxydant", "Hydratant"] },
  "salicylic acid": { commonName: "Acide salicylique (BHA)", function: "Exfoliant", safetyLevel: "caution", concerns: ["Photosensibilisant", "SPF obligatoire"] },
  allantoin: { commonName: "Allantoïne", function: "Apaisant", safetyLevel: "safe", benefits: ["Apaisant", "Cicatrisant", "Adoucissant"] },
  "centella asiatica": { commonName: "Centella Asiatica", function: "Apaisant / Réparateur", safetyLevel: "safe", benefits: ["Réparateur", "Apaisant", "Anti-inflammatoire"] },

  // Emollients / occlusives
  dimethicone: { commonName: "Diméthicone", function: "Silicone / Émollient", safetyLevel: "safe", benefits: ["Texture soyeuse", "Protecteur"], flagComedogenic: false },
  "petrolatum": { commonName: "Vaseline", function: "Occlusif", safetyLevel: "safe", benefits: ["Barrière protectrice", "Anti-dessèchement"] },
  "mineral oil": { commonName: "Huile minérale", function: "Occlusif", safetyLevel: "caution", concerns: ["Peut obstruer les pores sur peaux acnéiques"], flagComedogenic: true },
  ceramide: { commonName: "Céramide", function: "Lipide barrière", safetyLevel: "safe", benefits: ["Renforce la barrière cutanée", "Anti-déshydratation"] },

  // Preservatives
  phenoxyethanol: { commonName: "Phénoxyéthanol", function: "Conservateur", safetyLevel: "caution", concerns: ["Conservateur à surveiller en forte dose"], flagSensitive: true },
  methylparaben: { commonName: "Méthylparabène", function: "Conservateur", safetyLevel: "caution", concerns: ["Conservateur controversé"], flagSensitive: true },
  propylparaben: { commonName: "Propylparabène", function: "Conservateur", safetyLevel: "caution", concerns: ["Conservateur controversé"], flagSensitive: true },
  methylisothiazolinone: { commonName: "Méthylisothiazolinone (MI)", function: "Conservateur", safetyLevel: "avoid", isAllergen: true, concerns: ["Allergène fréquent", "Interdit dans les produits sans rinçage en EU"] },
  "benzyl alcohol": { commonName: "Alcool benzylique", function: "Conservateur / Solvant", safetyLevel: "caution", isAllergen: true, concerns: ["Allergène potentiel", "Peut irriter"] },

  // Fragrances and known allergens
  parfum: { commonName: "Parfum", function: "Masquant / Parfumant", safetyLevel: "avoid", isAllergen: true, flagFragrance: true, flagSensitive: true, concerns: ["Allergène potentiel", "Peut irriter les peaux sensibles"] },
  fragrance: { commonName: "Parfum", function: "Masquant / Parfumant", safetyLevel: "avoid", isAllergen: true, flagFragrance: true, flagSensitive: true, concerns: ["Allergène potentiel"] },
  limonene: { commonName: "Limonène", function: "Parfumant", safetyLevel: "caution", isAllergen: true, flagFragrance: true, concerns: ["Allergène UE déclaré"] },
  linalool: { commonName: "Linalol", function: "Parfumant", safetyLevel: "caution", isAllergen: true, flagFragrance: true, concerns: ["Allergène UE déclaré"] },
  citronellol: { commonName: "Citronellol", function: "Parfumant", safetyLevel: "caution", isAllergen: true, flagFragrance: true, concerns: ["Allergène UE déclaré"] },
  geraniol: { commonName: "Géraniol", function: "Parfumant", safetyLevel: "caution", isAllergen: true, flagFragrance: true, concerns: ["Allergène UE déclaré"] },
  eugenol: { commonName: "Eugénol", function: "Parfumant", safetyLevel: "caution", isAllergen: true, flagFragrance: true, concerns: ["Allergène UE déclaré"] },
  citral: { commonName: "Citral", function: "Parfumant", safetyLevel: "caution", isAllergen: true, flagFragrance: true, concerns: ["Allergène UE déclaré"] },
  "benzyl salicylate": { commonName: "Salicylate de benzyle", function: "Parfumant", safetyLevel: "caution", isAllergen: true, flagFragrance: true, concerns: ["Allergène UE déclaré"] },

  // Alcohols
  "alcohol denat": { commonName: "Alcool dénaturé", function: "Solvant / Antimicrobien", safetyLevel: "caution", flagAlcohol: true, flagSensitive: true, concerns: ["Peut assécher et irriter la peau"] },
  ethanol: { commonName: "Éthanol", function: "Solvant", safetyLevel: "caution", flagAlcohol: true, concerns: ["Peut assécher la peau"] },
  "isopropyl alcohol": { commonName: "Alcool isopropylique", function: "Solvant", safetyLevel: "caution", flagAlcohol: true, concerns: ["Irritant à forte concentration"] },

  // Surfactants
  "sodium lauryl sulfate": { commonName: "SLS", function: "Tensioactif", safetyLevel: "avoid", flagSensitive: true, concerns: ["Irritant", "Peut déséquilibrer le microbiome"] },
  "sodium laureth sulfate": { commonName: "SLES", function: "Tensioactif", safetyLevel: "caution", flagSensitive: true, concerns: ["Peut irriter à forte dose"] },

  // Zinc
  "zinc pca": { commonName: "Zinc PCA", function: "Régulateur sébum", safetyLevel: "safe", benefits: ["Contrôle le sébum", "Anti-bactérien"] },
};

function findIngredientRule(inci: string): IngredientRule | undefined {
  const lower = inci.toLowerCase().trim();
  if (INGREDIENT_DB[lower]) return INGREDIENT_DB[lower];
  return Object.entries(INGREDIENT_DB).find(([key]) =>
    lower.includes(key),
  )?.[1];
}

export function analyzeIngredients(
  ingredientsText: string,
): ProductAnalysisResult {
  if (!ingredientsText?.trim()) {
    return {
      summary: "Aucun ingrédient à analyser.",
      detectedIngredients: [],
      warnings: [],
      positivePoints: [],
      acneSafetyNotes: [],
      sensitiveSkinNotes: [],
      fragranceAlcoholNotes: [],
      comedogenicRiskLevel: "unknown",
      irritationRiskLevel: "unknown",
      confidenceScore: 0,
    };
  }

  const rawList = ingredientsText
    .split(/[,\n]/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 1 && s.length < 100)
    .slice(0, 40);

  const detectedIngredients: AnalyzedIngredient[] = rawList.map((inci) => {
    const rule = findIngredientRule(inci);
    return {
      inci: inci.charAt(0).toUpperCase() + inci.slice(1),
      commonName: rule?.commonName ?? inci.charAt(0).toUpperCase() + inci.slice(1),
      function: rule?.function ?? "Ingrédient cosmétique",
      safetyLevel: rule?.safetyLevel ?? "safe",
      isAllergen: rule?.isAllergen ?? false,
      benefits: rule?.benefits ?? [],
      concerns: rule?.concerns ?? [],
    };
  });

  const warnings: string[] = [];
  const positivePoints: string[] = [];
  const fragranceAlcoholNotes: string[] = [];
  const sensitiveSkinNotes: string[] = [];
  const acneSafetyNotes: string[] = [];

  let hasFragrance = false;
  let hasAlcohol = false;
  let hasComedogenic = false;
  let avoidCount = 0;
  let cautionCount = 0;
  let safeActives = 0;

  for (const [key, rule] of Object.entries(INGREDIENT_DB)) {
    const inciLower = ingredientsText.toLowerCase();
    if (!inciLower.includes(key)) continue;

    if (rule.flagFragrance && !hasFragrance) {
      hasFragrance = true;
      fragranceAlcoholNotes.push("Contient du parfum ou un composé parfumant — déconseillé pour les peaux sensibles et allergiques.");
    }
    if (rule.flagAlcohol && !hasAlcohol) {
      hasAlcohol = true;
      fragranceAlcoholNotes.push("Contient de l'alcool — peut assécher ou irriter les peaux sèches et sensibles.");
    }
    if (rule.flagComedogenic) {
      hasComedogenic = true;
      acneSafetyNotes.push(`${rule.commonName} peut boucher les pores sur les peaux acnéiques.`);
    }
    if (rule.flagSensitive && rule.safetyLevel !== "safe") {
      sensitiveSkinNotes.push(`${rule.commonName} : ${rule.concerns?.[0] ?? "à surveiller sur peau sensible"}.`);
    }
    if (rule.safetyLevel === "avoid") avoidCount++;
    if (rule.safetyLevel === "caution") cautionCount++;
  }

  // Positive detections
  const positiveKeys = ["niacinamide", "panthenol", "glycerin", "sodium hyaluronate", "hyaluronic acid", "ceramide", "centella asiatica", "allantoin", "ascorbic acid", "tocopherol"];
  for (const key of positiveKeys) {
    const inciLower = ingredientsText.toLowerCase();
    const rule = INGREDIENT_DB[key];
    if (rule && inciLower.includes(key) && rule.benefits?.length) {
      positivePoints.push(`${rule.commonName} : ${rule.benefits.slice(0, 2).join(", ")}.`);
      safeActives++;
    }
  }

  if (avoidCount > 0) {
    warnings.push(`${avoidCount} ingrédient(s) à éviter détecté(s).`);
  }
  if (cautionCount > 2) {
    warnings.push(`${cautionCount} ingrédients à surveiller.`);
  }

  const comedogenicRiskLevel: ComedogenicRiskLevel = hasComedogenic ? "medium" : "low";
  const irritationRiskLevel: IrritationRiskLevel =
    avoidCount > 0 ? "high" : cautionCount > 2 ? "medium" : "low";

  const knownCount = detectedIngredients.filter((i) =>
    findIngredientRule(i.inci),
  ).length;
  const confidenceScore = Math.round(
    (knownCount / Math.max(detectedIngredients.length, 1)) * 100,
  );

  const summary =
    avoidCount > 0
      ? `Ce produit contient des ingrédients déconseillés. Vérifiez les avertissements.`
      : safeActives > 2
        ? `Formule avec de bons actifs. ${cautionCount > 0 ? "Quelques ingrédients à surveiller." : "Globalement bien tolérée."}`
        : `Formule standard. ${cautionCount > 0 ? "Quelques ingrédients à surveiller." : "Pas d'ingrédients problématiques détectés."}`;

  return {
    summary,
    detectedIngredients,
    warnings,
    positivePoints,
    acneSafetyNotes,
    sensitiveSkinNotes,
    fragranceAlcoholNotes,
    comedogenicRiskLevel,
    irritationRiskLevel,
    confidenceScore,
  };
}
