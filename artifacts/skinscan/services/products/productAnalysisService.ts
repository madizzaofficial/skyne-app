import {
  AnalysisWarning,
  DetectedIngredient,
  ProductAnalysisResult,
} from "@/types/product";

const FRAGRANCE_TRIGGERS = ["parfum", "fragrance", "aroma", "flavor", "flavour"];

const ALCOHOL_TRIGGERS = [
  "alcohol denat",
  "denatured alcohol",
  "ethanol",
  "isopropyl alcohol",
  "sd alcohol",
];

const ESSENTIAL_OIL_TRIGGERS = [
  "lavandula angustifolia",
  "melaleuca alternifolia",
  "citrus aurantium",
  "eucalyptus globulus",
  "rosmarinus officinalis",
  "mentha piperita",
  "peppermint oil",
  "lavender oil",
  "tea tree oil",
  "eucalyptus oil",
  "rosemary oil",
];

const EU_ALLERGEN_TRIGGERS = [
  "limonene",
  "linalool",
  "citronellol",
  "geraniol",
  "eugenol",
  "cinnamal",
  "benzyl alcohol",
  "benzyl salicylate",
  "amyl cinnamal",
  "coumarin",
  "isoeugenol",
  "hydroxycitronellal",
  "anise alcohol",
];

const HELPFUL_INGREDIENTS: Record<string, string> = {
  niacinamide: "Vitamine B3 — multi-action, réduit les pores et contrôle le sébum",
  panthenol: "Pro-vitamine B5 — hydratant et apaisant",
  glycerin: "Glycérine — humectant puissant",
  glycerol: "Glycérine — humectant puissant",
  ceramide: "Céramide — renforce la barrière cutanée",
  "centella asiatica": "Centella Asiatica — apaisant et cicatrisant",
  "sodium hyaluronate": "Acide hyaluronique — hydratation intense",
  "hyaluronic acid": "Acide hyaluronique — hydratation intense",
  allantoin: "Allantoïne — apaisant et cicatrisant",
  "tocopherol": "Vitamine E — antioxydant",
  "ascorbic acid": "Vitamine C — antioxydant et éclat",
  "green tea": "Thé vert — antioxydant",
  "camellia sinensis": "Thé vert — antioxydant",
  "aloe barbadensis": "Aloe vera — apaisant et hydratant",
  "aloe vera": "Aloe vera — apaisant et hydratant",
  "zinc pca": "Zinc PCA — régulateur de sébum",
  squalane: "Squalane — émollient léger et non comédogène",
  "beta-glucan": "Bêta-glucane — hydratant et immunomodulateur",
};

const COMEDOGENIC_TRIGGERS = [
  "isopropyl myristate",
  "isopropyl palmitate",
  "coconut oil",
  "cocos nucifera",
  "cocoa butter",
  "theobroma cacao",
  "wheat germ oil",
  "triticum vulgare",
  "flaxseed oil",
  "linum usitatissimum",
  "acetylated lanolin",
];

function normalizeIngredientText(text: string): string {
  return text.toLowerCase().replace(/[()*/]/g, " ").replace(/\s+/g, " ").trim();
}

function containsAny(text: string, triggers: string[]): string[] {
  return triggers.filter((t) => text.includes(t));
}

export function analyzeIngredients(
  ingredientsText: string,
  productName = "Produit",
  brand?: string,
  productId?: string
): ProductAnalysisResult {
  const normalized = normalizeIngredientText(ingredientsText);

  const detectedIngredients: DetectedIngredient[] = [];
  const warnings: AnalysisWarning[] = [];
  const positivePoints: string[] = [];
  const acneSafetyNotes: string[] = [];
  const sensitiveSkinNotes: string[] = [];
  const fragranceAlcoholNotes: string[] = [];

  const foundFragrance = containsAny(normalized, FRAGRANCE_TRIGGERS);
  foundFragrance.forEach((f) => {
    detectedIngredients.push({
      inci: f,
      commonName: "Parfum / Fragrance",
      reason: "Allergène potentiel pour les peaux sensibles",
      category: "fragrance",
    });
    fragranceAlcoholNotes.push(
      `Parfum détecté (${f}) — peut irriter les peaux sensibles ou réactives`
    );
  });
  if (foundFragrance.length > 0) {
    warnings.push({
      level: "caution",
      message:
        "Ce produit contient du parfum, allergène potentiel pour les peaux sensibles.",
      relatedIngredients: foundFragrance,
    });
    sensitiveSkinNotes.push("Présence de parfum — déconseillé pour les peaux très réactives");
  }

  const foundAlcohol = containsAny(normalized, ALCOHOL_TRIGGERS);
  foundAlcohol.forEach((a) => {
    detectedIngredients.push({
      inci: a,
      commonName: "Alcool dénaturé / Éthanol",
      reason: "Peut assécher et irriter la peau en cas d'utilisation prolongée",
      category: "alcohol",
    });
    fragranceAlcoholNotes.push(
      `Alcool détecté (${a}) — peut assécher la peau en usage fréquent`
    );
  });
  if (foundAlcohol.length > 0) {
    warnings.push({
      level: "caution",
      message: "Alcool dénaturé présent — peut assécher les peaux sèches.",
      relatedIngredients: foundAlcohol,
    });
    sensitiveSkinNotes.push("Alcool présent — surveiller la tolérance cutanée");
  }

  const foundOils = containsAny(normalized, ESSENTIAL_OIL_TRIGGERS);
  foundOils.forEach((o) => {
    detectedIngredients.push({
      inci: o,
      commonName: "Huile essentielle",
      reason: "Peut irriter les peaux sensibles et réactives",
      category: "essentialOil",
    });
  });
  if (foundOils.length > 0) {
    warnings.push({
      level: "caution",
      message: "Huiles essentielles présentes — irritantes pour certaines peaux.",
      relatedIngredients: foundOils,
    });
    sensitiveSkinNotes.push(
      "Huiles essentielles détectées — à éviter pour les peaux réactives"
    );
  }

  const foundAllergens = containsAny(normalized, EU_ALLERGEN_TRIGGERS);
  foundAllergens.forEach((a) => {
    detectedIngredients.push({
      inci: a,
      commonName: `Allergène UE (${a})`,
      reason: "Allergène européen réglementé — déclaration obligatoire au-dessus d'un certain seuil",
      category: "allergen",
    });
  });
  if (foundAllergens.length > 0) {
    warnings.push({
      level: "caution",
      message: `${foundAllergens.length} allergène(s) UE détecté(s).`,
      relatedIngredients: foundAllergens,
    });
    sensitiveSkinNotes.push(
      `Allergènes UE présents : ${foundAllergens.join(", ")}`
    );
  }

  Object.entries(HELPFUL_INGREDIENTS).forEach(([key, desc]) => {
    if (normalized.includes(key)) {
      detectedIngredients.push({
        inci: key,
        commonName: desc.split(" — ")[0],
        reason: desc.split(" — ")[1] ?? "",
        category: "helpful",
      });
      positivePoints.push(`✓ ${desc}`);
    }
  });

  const foundComedogenic = containsAny(normalized, COMEDOGENIC_TRIGGERS);
  if (foundComedogenic.length > 0) {
    acneSafetyNotes.push(
      `Ingrédients potentiellement comédogènes détectés : ${foundComedogenic.join(", ")}`
    );
    warnings.push({
      level: "caution",
      message: "Ingrédients potentiellement comédogènes présents.",
      relatedIngredients: foundComedogenic,
    });
  } else {
    acneSafetyNotes.push(
      "Aucun ingrédient fortement comédogène détecté dans la liste analysée"
    );
  }

  const hasParaben = normalized.includes("paraben");
  if (hasParaben) {
    warnings.push({
      level: "info",
      message: "Contient des parabènes (conservateurs controversés).",
      relatedIngredients: ["paraben"],
    });
  }

  const avoidCount = warnings.filter((w) => w.level === "avoid").length;
  const cautionCount = warnings.filter((w) => w.level === "caution").length;
  const irritationRiskLevel: ProductAnalysisResult["irritationRiskLevel"] =
    avoidCount > 0 || cautionCount >= 3
      ? "high"
      : cautionCount >= 1
      ? "medium"
      : "low";

  const comedogenicRiskLevel: ProductAnalysisResult["comedogenicRiskLevel"] =
    foundComedogenic.length >= 2
      ? "high"
      : foundComedogenic.length === 1
      ? "medium"
      : "low";

  const helpfulCount = positivePoints.length;
  const warningCount = cautionCount + avoidCount;
  const rawScore = Math.max(
    0,
    Math.min(100, 60 + helpfulCount * 8 - warningCount * 12)
  );
  const confidenceScore = ingredientsText.length > 30 ? rawScore : 0;

  const summaryParts: string[] = [];
  if (positivePoints.length > 0) {
    summaryParts.push(
      `Ce produit contient ${positivePoints.length} ingrédient(s) bénéfique(s).`
    );
  }
  if (foundFragrance.length > 0 || foundAlcohol.length > 0) {
    summaryParts.push("Présence de parfum et/ou d'alcool — à surveiller pour les peaux sensibles.");
  }
  if (foundAllergens.length > 0) {
    summaryParts.push(
      `${foundAllergens.length} allergène(s) UE identifié(s).`
    );
  }
  if (summaryParts.length === 0) {
    summaryParts.push("Analyse basée sur la liste INCI fournie. Résultats indicatifs, non médicaux.");
  }

  const summary = summaryParts.join(" ");

  return {
    productId,
    productName,
    brand,
    ingredientsText,
    detectedIngredients,
    warnings,
    positivePoints,
    acneSafetyNotes,
    sensitiveSkinNotes,
    fragranceAlcoholNotes,
    comedogenicRiskLevel,
    irritationRiskLevel,
    summary,
    confidenceScore,
  };
}
