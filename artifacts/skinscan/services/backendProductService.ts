/**
 * Backend product service — all product lookups go through Skyne's own backend.
 * The backend handles: local DB → Open Beauty Facts API fallback → caching.
 * Never call Open Beauty Facts directly from the mobile app.
 */
import type { Ingredient, Product } from "@/constants/mockData";

// ── API base URL ──────────────────────────────────────────────────────────────
// Set EXPO_PUBLIC_API_BASE_URL in Replit secrets to your backend URL.
// e.g. https://<your-repl-domain>.worf.replit.dev/api
const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

const TIMEOUT_MS = 12_000;

// ── Types from backend ────────────────────────────────────────────────────────

interface ApiProduct {
  id: string;
  barcode: string | null;
  name: string | null;
  brand: string | null;
  brands: string[] | null;
  categories: string[] | null;
  ingredientsText: string | null;
  ingredientsTags: string[] | null;
  allergensTags: string[] | null;
  labelsTags: string[] | null;
  imageUrl: string | null;
  imageFrontUrl: string | null;
  imageIngredientsUrl: string | null;
  frontImageUrl400: string | null;
  source: string;
  completenessScore: number;
  dataQualityStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendAnalysisResult {
  summary: string;
  warnings: string[];
  positivePoints: string[];
  fragranceAlcoholNotes: string[];
  acneSafetyNotes: string[];
  sensitiveSkinNotes: string[];
  comedogenicRiskLevel: "low" | "medium" | "high" | "unknown";
  irritationRiskLevel: "low" | "medium" | "high" | "unknown";
  confidenceScore: number;
}

interface ProductLookupResult {
  product: ApiProduct | null;
  source: "local" | "open_beauty_facts_api" | "not_found";
  needsContribution: boolean;
  missingFields: string[];
  message: string;
  analysis?: BackendAnalysisResult;
}

interface ProductSearchResponse {
  results: Array<{
    id: string;
    barcode: string | null;
    name: string | null;
    brand: string | null;
    imageUrl: string | null;
    imageFrontUrl: string | null;
    categories: string[] | null;
    completenessScore: number;
    dataQualityStatus: string;
  }>;
  count: number;
}

// ── Ingredient DB (rule-based for mobile-side display) ───────────────────────

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
  "alcohol denat": { commonName: "Alcool dénaturé", function: "Solvant", safetyLevel: "caution", concerns: ["Peut assécher la peau"] },
  methylparaben: { commonName: "Méthylparabène", function: "Conservateur", safetyLevel: "caution", concerns: ["Conservateur controversé"] },
  propylparaben: { commonName: "Propylparabène", function: "Conservateur", safetyLevel: "caution", concerns: ["Conservateur controversé"] },
  panthenol: { commonName: "Provitamine B5", function: "Humectant / Apaisant", safetyLevel: "safe", benefits: ["Cicatrisant", "Hydratant"] },
  allantoin: { commonName: "Allantoïne", function: "Apaisant", safetyLevel: "safe", benefits: ["Apaisant", "Cicatrisant"] },
  "centella asiatica": { commonName: "Centella Asiatica", function: "Apaisant", safetyLevel: "safe", benefits: ["Réparateur", "Apaisant"] },
  ceramide: { commonName: "Céramide", function: "Lipide barrière", safetyLevel: "safe", benefits: ["Renforce la barrière cutanée"] },
  limonene: { commonName: "Limonène", function: "Parfumant", safetyLevel: "caution", isAllergen: true, concerns: ["Allergène UE déclaré"] },
  linalool: { commonName: "Linalol", function: "Parfumant", safetyLevel: "caution", isAllergen: true, concerns: ["Allergène UE déclaré"] },
};

function findIngredientRule(inci: string) {
  const lower = inci.toLowerCase().trim();
  if (INGREDIENT_DB[lower]) return INGREDIENT_DB[lower];
  return Object.entries(INGREDIENT_DB).find(([key]) => lower.includes(key))?.[1];
}

function parseIngredients(inciText: string): Ingredient[] {
  if (!inciText) return [];
  return inciText
    .split(/[,\n]/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 1 && s.length < 80)
    .slice(0, 30)
    .map((inci, index) => {
      const rule = findIngredientRule(inci);
      return {
        id: `ing_${index}_${inci.replace(/\s+/g, "_").toLowerCase().slice(0, 20)}`,
        inci: inci.charAt(0).toUpperCase() + inci.slice(1),
        commonName: rule?.commonName ?? inci.charAt(0).toUpperCase() + inci.slice(1),
        function: rule?.function ?? "Ingrédient cosmétique",
        safetyLevel: rule?.safetyLevel ?? "safe",
        isAllergen: rule?.isAllergen ?? false,
        isComedogenic: false,
        isFungalAcneSafe: (rule?.safetyLevel ?? "safe") === "safe",
        benefits: rule?.benefits ?? [],
        concerns: rule?.concerns ?? [],
        concernIcons: (rule?.concerns ?? []).map(() => "⚠️"),
        description: rule
          ? `${rule.commonName} — ${rule.function}`
          : `${inci} — ingrédient cosmétique`,
      };
    });
}

function mapCategory(categories: string[] | null): { category: string; subcategory: string } {
  const cat = (categories?.join(", ") ?? "").toLowerCase();
  if (cat.includes("face") || cat.includes("visage") || cat.includes("facial")) {
    if (cat.includes("cleanser") || cat.includes("wash") || cat.includes("nettoyant")) return { category: "Visage", subcategory: "Nettoyant" };
    if (cat.includes("serum") || cat.includes("sérum")) return { category: "Visage", subcategory: "Sérum" };
    if (cat.includes("moisturiz") || cat.includes("hydrat") || cat.includes("cream") || cat.includes("crème")) return { category: "Visage", subcategory: "Hydratant" };
    if (cat.includes("exfoliat") || cat.includes("scrub")) return { category: "Visage", subcategory: "Exfoliant" };
    if (cat.includes("toner") || cat.includes("lotion")) return { category: "Visage", subcategory: "Toner" };
    if (cat.includes("mask") || cat.includes("masque")) return { category: "Visage", subcategory: "Masque" };
    return { category: "Visage", subcategory: "Soin visage" };
  }
  if (cat.includes("hair") || cat.includes("cheveux") || cat.includes("shampoo")) {
    if (cat.includes("shampoo") || cat.includes("shampoing")) return { category: "Cheveux", subcategory: "Shampoing" };
    if (cat.includes("conditioner") || cat.includes("après")) return { category: "Cheveux", subcategory: "Après-shampoing" };
    return { category: "Cheveux", subcategory: "Soin cheveux" };
  }
  if (cat.includes("sun") || cat.includes("solaire") || cat.includes("spf")) return { category: "Solaire", subcategory: "SPF visage" };
  if (cat.includes("body") || cat.includes("corps")) {
    if (cat.includes("wash") || cat.includes("douche")) return { category: "Corps", subcategory: "Gel douche" };
    return { category: "Corps", subcategory: "Crème corps" };
  }
  return { category: "Visage", subcategory: "Soin" };
}

function apiProductToProduct(p: ApiProduct): Product {
  const ingredientsText = p.ingredientsText ?? "";
  const ingredients = parseIngredients(ingredientsText);
  const { category, subcategory } = mapCategory(p.categories);
  const inciLower = ingredientsText.toLowerCase();
  const labelStr = (p.labelsTags ?? []).join(" ").toLowerCase();

  return {
    id: p.id,
    name: p.name ?? "Produit inconnu",
    brand: p.brand ?? (p.brands?.[0] ?? "Marque inconnue"),
    category,
    subcategory,
    image:
      p.imageFrontUrl ??
      p.imageUrl ??
      p.frontImageUrl400 ??
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    barcode: p.barcode ?? undefined,
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
      vegan: labelStr.includes("vegan"),
      crueltyFree: labelStr.includes("cruelty"),
      nonComedogenic: false,
    },
    reviews: [],
    price: "",
    incompatibilities: ingredients
      .filter((i) => i.safetyLevel === "caution" || i.safetyLevel === "avoid")
      .flatMap((i) => i.concerns)
      .filter(Boolean)
      .slice(0, 3),
    whereToBuy: [],
  };
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T | null> {
  if (!API_BASE) {
    console.warn("[backendProductService] EXPO_PUBLIC_API_BASE_URL is not set.");
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function lookupProductByBarcodeViaBackend(
  barcode: string,
): Promise<{ product: Product | null; needsContribution: boolean; missingFields: string[]; message: string }> {
  const result = await apiFetch<ProductLookupResult>(
    `/products/barcode/${encodeURIComponent(barcode)}`,
  );

  if (!result || !result.product) {
    return {
      product: null,
      needsContribution: result?.needsContribution ?? true,
      missingFields: result?.missingFields ?? [],
      message: result?.message ?? "Produit introuvable.",
    };
  }

  return {
    product: apiProductToProduct(result.product),
    needsContribution: result.needsContribution,
    missingFields: result.missingFields,
    message: result.message,
  };
}

export async function searchProductsViaBackend(
  query: string,
  limit = 12,
): Promise<Product[]> {
  const result = await apiFetch<ProductSearchResponse>(
    `/products/search?q=${encodeURIComponent(query)}&limit=${limit}`,
  );

  if (!result?.results?.length) return [];

  return result.results
    .filter((r) => r.name)
    .map((r) =>
      apiProductToProduct({
        id: r.id,
        barcode: r.barcode,
        name: r.name,
        brand: null,
        brands: null,
        categories: r.categories,
        ingredientsText: null,
        ingredientsTags: null,
        allergensTags: null,
        labelsTags: null,
        imageUrl: r.imageUrl,
        imageFrontUrl: r.imageFrontUrl,
        imageIngredientsUrl: null,
        frontImageUrl400: r.imageFrontUrl,
        source: "api",
        completenessScore: r.completenessScore,
        dataQualityStatus: r.dataQualityStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
}

export async function submitProductContribution(input: {
  barcode?: string;
  productId?: string;
  submittedByUserId?: string;
  proposedName?: string;
  proposedBrand?: string;
  proposedIngredientsText?: string;
  proposedImageUrl?: string;
  notes?: string;
}): Promise<boolean> {
  if (!API_BASE) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/products/contributions`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.status === 201;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
