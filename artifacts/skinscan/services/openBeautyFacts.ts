import { Ingredient, Product } from "@/constants/mockData";
import { COSING_DB } from "./cosing-db";

const BASE_URL = "https://world.openbeautyfacts.org";
const TIMEOUT_MS = 15000;

const INGREDIENT_DB: Record<
  string,
  {
    commonName: string;
    function: string;
    safetyLevel: "safe" | "caution" | "avoid";
    isAllergen?: boolean;
    concerns?: string[];
    benefits?: string[];
  }
> = {
  aqua: { commonName: "Eau", function: "Solvant", safetyLevel: "safe", benefits: ["Hydratation"] },
  water: { commonName: "Eau", function: "Solvant", safetyLevel: "safe", benefits: ["Hydratation"] },
  glycerin: { commonName: "Glycérine", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratation intense"] },
  glycerol: { commonName: "Glycérine", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratation intense"] },
  niacinamide: { commonName: "Vitamine B3", function: "Actif multi-fonction", safetyLevel: "safe", benefits: ["Réduit les pores", "Contrôle le sébum"] },
  retinol: { commonName: "Rétinol", function: "Anti-âge", safetyLevel: "caution", concerns: ["Peut irriter", "SPF obligatoire le matin"] },
  parfum: { commonName: "Parfum", function: "Masquant", safetyLevel: "avoid", isAllergen: true, concerns: ["Allergène potentiel", "Peut irriter les peaux sensibles"] },
  fragrance: { commonName: "Parfum", function: "Masquant", safetyLevel: "avoid", isAllergen: true, concerns: ["Allergène potentiel"] },
  "sodium lauryl sulfate": { commonName: "SLS", function: "Détergent", safetyLevel: "avoid", concerns: ["Irritant", "Assèche la peau"] },
  "sodium laureth sulfate": { commonName: "SLES", function: "Détergent", safetyLevel: "caution", concerns: ["Peut irriter"] },
  "salicylic acid": { commonName: "Acide salicylique (BHA)", function: "Exfoliant", safetyLevel: "caution", concerns: ["Photosensibilisant", "SPF obligatoire"] },
  "sodium hyaluronate": { commonName: "Acide hyaluronique", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratation intense", "Repulpe la peau"] },
  "hyaluronic acid": { commonName: "Acide hyaluronique", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratation intense"] },
  "ascorbic acid": { commonName: "Vitamine C", function: "Antioxydant", safetyLevel: "safe", benefits: ["Éclat", "Anti-oxydant"] },
  tocopherol: { commonName: "Vitamine E", function: "Antioxydant", safetyLevel: "safe", benefits: ["Antioxydant", "Hydratant"] },
  phenoxyethanol: { commonName: "Phénoxyéthanol", function: "Conservateur", safetyLevel: "caution", concerns: ["Conservateur à surveiller"] },
  "butylene glycol": { commonName: "Butylène Glycol", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratant léger"] },
  "propylene glycol": { commonName: "Propylène Glycol", function: "Humectant", safetyLevel: "caution", concerns: ["Peut irriter les peaux sensibles"] },
  dimethicone: { commonName: "Diméthicone (Silicone)", function: "Émollient", safetyLevel: "safe", benefits: ["Texture soyeuse"] },
  "zinc pca": { commonName: "Zinc PCA", function: "Régulateur de sébum", safetyLevel: "safe", benefits: ["Contrôle le sébum", "Anti-bactérien"] },
  alcohol: { commonName: "Alcool", function: "Solvant", safetyLevel: "caution", concerns: ["Peut assécher la peau"] },
  "denatured alcohol": { commonName: "Alcool dénaturé", function: "Solvant", safetyLevel: "caution", concerns: ["Peut assécher la peau"] },
  parabens: { commonName: "Parabènes", function: "Conservateur", safetyLevel: "caution", concerns: ["Controversé"] },
  "methylparaben": { commonName: "Méthylparabène", function: "Conservateur", safetyLevel: "caution", concerns: ["Conservateur controversé"] },
  "propylparaben": { commonName: "Propylparabène", function: "Conservateur", safetyLevel: "caution", concerns: ["Conservateur controversé"] },
  // Humectants & actifs
  panthenol: { commonName: "Panthénol (Pro-Vitamine B5)", function: "Hydratant", safetyLevel: "safe", benefits: ["Hydratant", "Cicatrisant", "Adoucissant"] },
  allantoin: { commonName: "Allantoïne", function: "Apaisant", safetyLevel: "safe", benefits: ["Cicatrisant", "Apaisant"] },
  betaine: { commonName: "Bétaïne", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratant doux"] },
  urea: { commonName: "Urée", function: "Kératolytique", safetyLevel: "safe", benefits: ["Exfoliant doux", "Hydratant profond"] },
  squalane: { commonName: "Squalane", function: "Émollient", safetyLevel: "safe", benefits: ["Hydratant", "Antioxydant"] },
  squalene: { commonName: "Squalène", function: "Émollient", safetyLevel: "safe", benefits: ["Hydratant"] },
  // Emollients / alcoôls gras
  "cetearyl alcohol": { commonName: "Alcool cétéarylique", function: "Émulsifiant", safetyLevel: "safe", benefits: ["Adoucissant"] },
  "cetyl alcohol": { commonName: "Alcool cétylique", function: "Émollient", safetyLevel: "safe", benefits: ["Adoucissant"] },
  "stearyl alcohol": { commonName: "Alcool stéarylique", function: "Émulsifiant", safetyLevel: "safe" },
  "stearic acid": { commonName: "Acide stéarique", function: "Émulsifiant", safetyLevel: "safe" },
  "palmitic acid": { commonName: "Acide palmitique", function: "Émulsifiant", safetyLevel: "safe" },
  "caprylic/capric triglyceride": { commonName: "Triglycérides capryliques", function: "Émollient", safetyLevel: "safe", benefits: ["Texture légère", "Hydratant"] },
  "isopropyl myristate": { commonName: "Myristate d'isopropyle", function: "Émollient", safetyLevel: "caution", concerns: ["Comédonique possible"] },
  petrolatum: { commonName: "Vaseline", function: "Occlusif", safetyLevel: "safe", benefits: ["Hydratant intense", "Protecteur"] },
  "mineral oil": { commonName: "Huile minérale", function: "Occlusif", safetyLevel: "caution", concerns: ["Peut obstruer les pores"] },
  "cera alba": { commonName: "Cire d'abeille", function: "Émollient", safetyLevel: "safe", benefits: ["Protecteur"] },
  beeswax: { commonName: "Cire d'abeille", function: "Émollient", safetyLevel: "safe", benefits: ["Protecteur", "Nourrissant"] },
  // Huiles végétales
  jojoba: { commonName: "Huile de jojoba", function: "Émollient", safetyLevel: "safe", benefits: ["Hydratant", "Régulateur de sébum"] },
  shea: { commonName: "Beurre de kariaté", function: "Émollient", safetyLevel: "safe", benefits: ["Nourrissant", "Protecteur"] },
  "argan": { commonName: "Huile d'argan", function: "Émollient", safetyLevel: "safe", benefits: ["Nourrissant", "Antioxydant"] },
  "rosehip": { commonName: "Huile de rose musquée", function: "Émollient", safetyLevel: "safe", benefits: ["Régénérant", "Anti-âge"] },
  // Émulsifiants / gélifiants
  carbomer: { commonName: "Carbomère", function: "Gélifiant", safetyLevel: "safe" },
  "xanthan gum": { commonName: "Gomme xanthane", function: "Gélifiant", safetyLevel: "safe" },
  "glyceryl stearate": { commonName: "Glycéryl stéarate", function: "Émulsifiant", safetyLevel: "safe" },
  "polysorbate 20": { commonName: "Polysorbate 20", function: "Émulsifiant", safetyLevel: "safe" },
  "polysorbate 80": { commonName: "Polysorbate 80", function: "Émulsifiant", safetyLevel: "safe" },
  "hydroxyethyl cellulose": { commonName: "Hydroxyeéthyl cellulose", function: "Gélifiant", safetyLevel: "safe" },
  // AHA / BHA
  "lactic acid": { commonName: "Acide lactique (AHA)", function: "Exfoliant chimique", safetyLevel: "caution", concerns: ["Photosensibilisant", "SPF obligatoire le matin"] },
  "glycolic acid": { commonName: "Acide glycolique (AHA)", function: "Exfoliant chimique", safetyLevel: "caution", concerns: ["Photosensibilisant", "Peut irriter"] },
  "mandelic acid": { commonName: "Acide mandélique (AHA)", function: "Exfoliant chimique", safetyLevel: "caution", concerns: ["Photosensibilisant modéré"] },
  "glucono lactone": { commonName: "Gluconolactone (PHA)", function: "Exfoliant doux", safetyLevel: "safe", benefits: ["Exfoliant très doux", "Humectant"] },
  // Dépigmentants / actifs éclat
  "azelaic acid": { commonName: "Acide azélaïque", function: "Anti-inflammatoire", safetyLevel: "safe", benefits: ["Anti-acné", "Anti-taches"] },
  "alpha-arbutin": { commonName: "Alpha-Arbutine", function: "Dépigmentant", safetyLevel: "safe", benefits: ["Éclat", "Anti-taches"] },
  "ascorbyl glucoside": { commonName: "Vit C stable (ascorbyl glucoside)", function: "Antioxydant", safetyLevel: "safe", benefits: ["Éclat", "Anti-taches"] },
  caffeine: { commonName: "Caféine", function: "Décongestionnant", safetyLevel: "safe", benefits: ["Anti-poches", "Antioxydant"] },
  bakuchiol: { commonName: "Bakuchiol", function: "Alternative au rétinol", safetyLevel: "safe", benefits: ["Anti-âge", "Fermeté"] },
  "tranexamic acid": { commonName: "Acide tranéxamique", function: "Dépigmentant", safetyLevel: "safe", benefits: ["Anti-taches"] },
  // Filtres UV
  "titanium dioxide": { commonName: "Dioxyde de titane", function: "Filtre UV minéral", safetyLevel: "safe", benefits: ["Protection solaire minérale"] },
  "zinc oxide": { commonName: "Oxyde de zinc", function: "Filtre UV minéral", safetyLevel: "safe", benefits: ["Protection solaire", "Apaisant"] },
  // Céramides
  "ceramide": { commonName: "Céramide", function: "Restructurant", safetyLevel: "safe", benefits: ["Renforce la barrière cutanée"] },
  "ceramide np": { commonName: "Céramide NP", function: "Restructurant", safetyLevel: "safe", benefits: ["Renforce la barrière cutanée"] },
  "ceramide ap": { commonName: "Céramide AP", function: "Restructurant", safetyLevel: "safe", benefits: ["Renforce la barrière cutanée"] },
  // Conservateurs
  ethylhexylglycerin: { commonName: "Éthylhexylglycérine", function: "Conservateur", safetyLevel: "safe" },
  "sodium benzoate": { commonName: "Benzoate de sodium", function: "Conservateur", safetyLevel: "caution", concerns: ["Peut former du benzène avec la Vitâmine C"] },
  "potassium sorbate": { commonName: "Sorbate de potassium", function: "Conservateur", safetyLevel: "safe" },
  "benzyl alcohol": { commonName: "Alcool benzylique", function: "Conservateur", safetyLevel: "caution", concerns: ["Peut irriter les peaux sensibles"] },
  "caprylyl glycol": { commonName: "Caprylyl Glycol", function: "Conservateur / Humectant", safetyLevel: "safe" },
  "1,2-hexanediol": { commonName: "1,2-Hexanediol", function: "Conservateur", safetyLevel: "safe" },
  // Parfums / allergènes EU
  limonene: { commonName: "Limonène", function: "Parfum", safetyLevel: "caution", isAllergen: true, concerns: ["Allergène EU", "Peut irriter"] },
  linalool: { commonName: "Linalool", function: "Parfum", safetyLevel: "caution", isAllergen: true, concerns: ["Allergène EU", "Peut irriter"] },
  geraniol: { commonName: "Géraniol", function: "Parfum", safetyLevel: "caution", isAllergen: true, concerns: ["Allergène EU"] },
  eugenol: { commonName: "Eugénol", function: "Parfum", safetyLevel: "caution", isAllergen: true, concerns: ["Allergène EU fort"] },
  citronellol: { commonName: "Citronellol", function: "Parfum", safetyLevel: "caution", isAllergen: true, concerns: ["Allergène EU"] },
  coumarin: { commonName: "Coumarine", function: "Parfum", safetyLevel: "caution", isAllergen: true, concerns: ["Allergène EU"] },
  // Régulateurs pH / chélateurs
  "citric acid": { commonName: "Acide citrique", function: "Régulateur pH", safetyLevel: "safe" },
  "sodium hydroxide": { commonName: "Hydroxyde de sodium", function: "Régulateur pH", safetyLevel: "safe" },
  "potassium hydroxide": { commonName: "Hydroxyde de potassium", function: "Régulateur pH", safetyLevel: "safe" },
  triethanolamine: { commonName: "Triéthanolamine", function: "Régulateur pH", safetyLevel: "caution", concerns: ["Peut irriter"] },
  "disodium edta": { commonName: "EDTA disodique", function: "Chélateur", safetyLevel: "safe" },
  "tetrasodium edta": { commonName: "EDTA tétrasodique", function: "Chélateur", safetyLevel: "safe" },
  "sodium chloride": { commonName: "Chlorure de sodium (sel)", function: "Régulateur de viscosité", safetyLevel: "safe" },
  // Tensioactifs doux
  "lauryl glucoside": { commonName: "Lauryl glucoside", function: "Tensioactif doux", safetyLevel: "safe", benefits: ["Nettoyant doux"] },
  "coco glucoside": { commonName: "Coco glucoside", function: "Tensioactif doux", safetyLevel: "safe", benefits: ["Nettoyant doux"] },
  "decyl glucoside": { commonName: "Décyl glucoside", function: "Tensioactif doux", safetyLevel: "safe", benefits: ["Nettoyant doux"] },
  "cocamidopropyl betaine": { commonName: "Cocoamidopropyl bétaïne", function: "Tensioactif", safetyLevel: "caution", concerns: ["Peut irriter les peaux sensibles"] },
  "sodium cocoyl isethionate": { commonName: "SCI", function: "Tensioactif doux", safetyLevel: "safe", benefits: ["Nettoyant doux", "Respectueux"] },
  // Actifs botaniques
  aloe: { commonName: "Aloe vera", function: "Apaisant", safetyLevel: "safe", benefits: ["Hydratant", "Apaisant", "Rafraîchissant"] },
  "aloe barbadensis": { commonName: "Aloe vera", function: "Apaisant", safetyLevel: "safe", benefits: ["Hydratant", "Apaisant"] },
  "centella asiatica": { commonName: "Centella asiatica", function: "Cicatrisant", safetyLevel: "safe", benefits: ["Cicatrisant", "Apaisant"] },
  madecassoside: { commonName: "Madécassoside (Centella)", function: "Cicatrisant", safetyLevel: "safe", benefits: ["Réparateur", "Apaisant"] },
  "green tea": { commonName: "Extrait de thé vert", function: "Antioxydant", safetyLevel: "safe", benefits: ["Antioxydant", "Protecteur"] },
  "chamomile": { commonName: "Extrait de camomille", function: "Apaisant", safetyLevel: "safe", benefits: ["Apaisant", "Anti-inflammatoire"] },
  "licorice": { commonName: "Extrait de réglisse", function: "Dépigmentant", safetyLevel: "safe", benefits: ["Éclat", "Anti-taches"] },
  // Silicones
  cyclopentasiloxane: { commonName: "Cyclopentasiloxane", function: "Solvant volatile", safetyLevel: "caution", concerns: ["Controversé, perturbateur endocrinien potentiel"] },
  cyclomethicone: { commonName: "Cyclométhicone", function: "Solvant volatile", safetyLevel: "safe" },
  // Divers
  mica: { commonName: "Mica", function: "Colorant / Illuminateur", safetyLevel: "safe" },
  talc: { commonName: "Talc", function: "Absorbant", safetyLevel: "caution", concerns: ["Controversé selon origine"] },
  "hexylene glycol": { commonName: "Hexylène Glycol", function: "Humectant", safetyLevel: "caution", concerns: ["Peut irriter les peaux sensibles"] },
  "polyglutamic acid": { commonName: "Acide polyglutamique", function: "Humectant", safetyLevel: "safe", benefits: ["Hydratation intense", "Repulpant"] },
  "nylon": { commonName: "Nylon (polymère)", function: "Filméogène", safetyLevel: "safe" },
};

function findIngredient(inci: string) {
  const lower = inci.toLowerCase().trim();
  // 1. Exact match in CosIng (richest descriptions)
  if (COSING_DB[lower]) return COSING_DB[lower];
  // 2. Exact match in local DB
  if (INGREDIENT_DB[lower]) return INGREDIENT_DB[lower];
  // 3. Partial match in CosIng
  const cosingPartial = Object.entries(COSING_DB).find(([key]) => lower.includes(key))?.[1];
  if (cosingPartial) return cosingPartial;
  // 4. Partial match in local DB
  return Object.entries(INGREDIENT_DB).find(([key]) => lower.includes(key))?.[1];
}

function buildDescription(
  inci: string,
  known?: {
    commonName: string;
    function: string;
    safetyLevel: "safe" | "caution" | "avoid";
    benefits?: string[];
    concerns?: string[];
  }
): string {
  if (!known) {
    return `${inci} est un ingrédient cosmétique. Aucune donnée détaillée disponible dans notre base.`;
  }
  const parts: string[] = [];
  parts.push(
    `${known.commonName} est un ingrédient de type « ${known.function} » utilisé dans les cosmétiques.`
  );
  if (known.safetyLevel === "safe") {
    parts.push("Généralement bien toléré par tous les types de peau.");
  } else if (known.safetyLevel === "caution") {
    parts.push("Conseillé avec vigilance : certains profils cutanés peuvent y réagir.");
  } else {
    parts.push("Ingrédient à éviter : potentiellement nocif ou fortement irritant.");
  }
  if (known.benefits && known.benefits.length > 0) {
    parts.push(`Bénéfices : ${known.benefits.join(", ")}.`);
  }
  if (known.concerns && known.concerns.length > 0) {
    parts.push(`Points de vigilance : ${known.concerns.join(", ")}.`);
  }
  return parts.join(" ");
}

function parseIngredients(inciText: string): Ingredient[] {
  if (!inciText) return [];
  return inciText
    .split(/[,\n]/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 1 && s.length < 80)
    .map((inci, index) => {
      const known = findIngredient(inci);
      return {
        id: `ing_${index}_${inci.replace(/\s+/g, "_").toLowerCase().slice(0, 20)}`,
        inci: inci.charAt(0).toUpperCase() + inci.slice(1),
        commonName: known?.commonName ?? inci.charAt(0).toUpperCase() + inci.slice(1),
        function: known?.function ?? "Ingrédient cosmétique",
        safetyLevel: known?.safetyLevel ?? "safe",
        isAllergen: known?.isAllergen ?? false,
        isComedogenic: false,
        isFungalAcneSafe: (known?.safetyLevel ?? "safe") === "safe",
        benefits: known?.benefits ?? [],
        concerns: known?.concerns ?? [],
        concernIcons: (known?.concerns ?? []).map(() => "⚠️"),
        description: buildDescription(inci, known),
      };
    });
}

function mapCategory(categories: string): { category: string; subcategory: string } {
  const cat = (categories || "").toLowerCase();
  const isOil = cat.includes("huile") || cat.includes("cleansing-oil") || cat.includes("-oils") || cat.includes(" oil");
  const isCleanser = cat.includes("cleanser") || cat.includes("cleansing") || cat.includes("nettoyant") || cat.includes("lavant") || cat.includes("wash");
  const isFace = cat.includes("face") || cat.includes("visage") || cat.includes("facial") || cat.includes("face-hygiene");
  const isBody = cat.includes("body") || cat.includes("corps") || cat.includes("bath") || cat.includes("bain") || cat.includes("shower") || cat.includes("douche");
  const isHair = cat.includes("hair") || cat.includes("cheveux") || cat.includes("shampoo");

  if (isFace) {
    if (isCleanser && isOil) return { category: "Visage", subcategory: "Huile nettoyante" };
    if (isCleanser) return { category: "Visage", subcategory: "Nettoyant" };
    if (cat.includes("serum") || cat.includes("sérum")) return { category: "Visage", subcategory: "Sérum" };
    if (cat.includes("moisturiz") || cat.includes("hydrat") || cat.includes("cream") || cat.includes("crème")) return { category: "Visage", subcategory: "Hydratant" };
    if (cat.includes("exfoliat") || cat.includes("scrub")) return { category: "Visage", subcategory: "Exfoliant" };
    if (cat.includes("toner") || cat.includes("lotion")) return { category: "Visage", subcategory: "Toner" };
    if (cat.includes("mask") || cat.includes("masque")) return { category: "Visage", subcategory: "Masque" };
    if (isOil) return { category: "Visage", subcategory: "Huile visage" };
    return { category: "Visage", subcategory: "Soin visage" };
  }
  if (isHair) {
    if (cat.includes("shampoo") || cat.includes("shampoing")) return { category: "Cheveux", subcategory: "Shampoing" };
    if (cat.includes("conditioner") || cat.includes("après")) return { category: "Cheveux", subcategory: "Après-shampoing" };
    if (cat.includes("mask") || cat.includes("masque")) return { category: "Cheveux", subcategory: "Masque cheveux" };
    if (isOil) return { category: "Cheveux", subcategory: "Huile capillaire" };
    return { category: "Cheveux", subcategory: "Soin cheveux" };
  }
  if (cat.includes("sun") || cat.includes("solaire") || cat.includes("spf")) return { category: "Solaire", subcategory: "SPF" };
  if (isBody) {
    if (isCleanser || cat.includes("shower") || cat.includes("bain") || cat.includes("bath")) {
      if (isOil) return { category: "Corps", subcategory: "Huile nettoyante" };
      return { category: "Corps", subcategory: "Gel douche" };
    }
    if (isOil) return { category: "Corps", subcategory: "Huile corps" };
    return { category: "Corps", subcategory: "Crème corps" };
  }
  if (cat.includes("eye") || cat.includes("yeux")) return { category: "Yeux", subcategory: "Contour yeux" };
  if (cat.includes("lip") || cat.includes("lèvre")) return { category: "Visage", subcategory: "Lèvres" };
  if (isCleanser) {
    if (isOil) return { category: "Corps", subcategory: "Huile nettoyante" };
    return { category: "Corps", subcategory: "Nettoyant" };
  }
  if (isOil) return { category: "Corps", subcategory: "Huile soin" };
  return { category: "Corps", subcategory: "Soin" };
}

export function mapObfToProduct(obfProduct: Record<string, unknown>): Product {
  const barcode = (obfProduct.code as string) || (obfProduct._id as string) || `obf_${Date.now()}`;

  // ── Ingredients: prefer raw text; fall back to OBF's pre-parsed ingredients[] array
  const rawText =
    (obfProduct.ingredients_text as string) ||
    (obfProduct.ingredients_text_fr as string) ||
    "";
  const obfIngrArr = (obfProduct.ingredients as Array<{ text?: string; id?: string }>) || [];
  const reconstructed = obfIngrArr
    .map((i) => i.text || (i.id as string || "").replace(/^\w+:/, ""))
    .filter(Boolean)
    .join(", ");
  const ingredientsText = rawText.length >= reconstructed.length ? rawText : reconstructed;

  const categories =
    (obfProduct.categories as string) ||
    ((obfProduct.categories_tags as string[]) || []).join(", ") ||
    "";
  const { category, subcategory } = mapCategory(categories);
  const ingredients = parseIngredients(ingredientsText);
  const labels = ((obfProduct.labels as string) || "").toLowerCase();
  const inciLower = ingredientsText.toLowerCase();

  // ── Image: try every known field including selected_images
  const sel = obfProduct.selected_images as
    | Record<string, Record<string, Record<string, string>>>
    | undefined;
  const selFrontUrl =
    Object.values(sel?.front?.display ?? {})[0] ||
    Object.values(sel?.front?.small ?? {})[0] ||
    "";

  return {
    id: barcode,
    name:
      (obfProduct.product_name as string) ||
      (obfProduct.product_name_fr as string) ||
      "Produit inconnu",
    brand: (obfProduct.brands as string) || "Marque inconnue",
    category,
    subcategory,
    image:
      (obfProduct.image_front_url as string) ||
      (obfProduct.image_front_small_url as string) ||
      selFrontUrl ||
      (obfProduct.image_url as string) ||
      (obfProduct.image_thumb_url as string) ||
      "",
    barcode,
    ingredients,
    communityScore: 0,
    reviewCount: 0,
    properties: {
      alcoholFree: !inciLower.includes("alcohol denat") && !inciLower.includes("ethanol"),
      fragranceFree: !inciLower.includes("parfum") && !inciLower.includes("fragrance"),
      oilFree: !inciLower.includes(" oil") && !inciLower.includes("huile"),
      siliconeFree: !inciLower.includes("silicone") && !inciLower.includes("dimethicone"),
      parabenFree: !inciLower.includes("paraben"),
      sulfateFree: !inciLower.includes("sulfate"),
      euAllergenFree: !inciLower.includes("parfum") && !inciLower.includes("fragrance"),
      fungalAcneSafe: ingredients.every((i) => i.safetyLevel !== "avoid"),
      vegan: labels.includes("vegan"),
      crueltyFree: labels.includes("cruelty-free") || labels.includes("cruelty free"),
      nonComedogenic: false,
    },
    reviews: [],
    price: "",
    incompatibilities: [...new Set(
      ingredients
        .filter((i) => i.safetyLevel === "caution" || i.safetyLevel === "avoid")
        .flatMap((i) => i.concerns)
        .filter(Boolean)
    )].slice(0, 4),
    whereToBuy: [],
  };
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function lookupByBarcode(barcode: string): Promise<Product | null> {
  try {
    const fields = [
      "product_name", "product_name_fr", "brands",
      "categories", "categories_tags",
      "ingredients_text", "ingredients_text_fr", "ingredients",
      "image_url", "image_front_url", "image_front_small_url", "image_thumb_url",
      "selected_images",
      "labels", "code",
    ].join(",");
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/v2/product/${barcode}.json?fields=${fields}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    return mapObfToProduct(data.product as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function fetchProductsByCategory(slug: string, limit = 40): Promise<Product[]> {
  const fields = "product_name,product_name_fr,brands,categories,categories_tags,ingredients_text,ingredients_text_fr,image_url,image_front_url,image_front_small_url,labels,code";
  const fetchPage = async (page: number): Promise<Record<string, unknown>[]> => {
    try {
      const res = await fetchWithTimeout(
        `${BASE_URL}/category/${slug}/${page}.json?fields=${fields}&page_size=40`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.products ?? []) as Record<string, unknown>[];
    } catch {
      return [];
    }
  };
  try {
    const page1 = await fetchPage(1);
    let all = page1;
    if (all.length < limit) {
      const page2 = await fetchPage(2);
      all = [...all, ...page2];
    }
    return all
      .filter((p) => (p.product_name as string) || (p.product_name_fr as string))
      .map(mapObfToProduct)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function searchProducts(query: string, limit = 12): Promise<Product[]> {
  try {
    const fields = "product_name,product_name_fr,brands,categories,categories_tags,ingredients_text,ingredients_text_fr,image_url,image_front_url,labels,code";
    const params = new URLSearchParams({
      search_terms: query,
      json: "1",
      page_size: String(limit),
      fields,
    });
    const res = await fetchWithTimeout(`${BASE_URL}/cgi/search.pl?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const products: Record<string, unknown>[] = data.products || [];
    return products
      .filter((p) => p.product_name || p.product_name_fr)
      .map(mapObfToProduct);
  } catch {
    return [];
  }
}
