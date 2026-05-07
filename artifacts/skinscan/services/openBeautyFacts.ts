import { Ingredient, Product } from "@/constants/mockData";

const BASE_URL = "https://world.openbeautyfacts.org";
const TIMEOUT_MS = 8000;

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
};

function findIngredient(inci: string) {
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
    .slice(0, 25)
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
        description: known
          ? `${known.commonName} — ${known.function}`
          : `${inci} — ingrédient cosmétique`,
      };
    });
}

function mapCategory(categories: string): { category: string; subcategory: string } {
  const cat = (categories || "").toLowerCase();
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
    if (cat.includes("mask") || cat.includes("masque")) return { category: "Cheveux", subcategory: "Masque cheveux" };
    return { category: "Cheveux", subcategory: "Soin cheveux" };
  }
  if (cat.includes("sun") || cat.includes("solaire") || cat.includes("spf")) return { category: "Solaire", subcategory: "SPF visage" };
  if (cat.includes("body") || cat.includes("corps")) {
    if (cat.includes("wash") || cat.includes("douche")) return { category: "Corps", subcategory: "Gel douche" };
    return { category: "Corps", subcategory: "Crème corps" };
  }
  if (cat.includes("eye") || cat.includes("yeux")) return { category: "Yeux", subcategory: "Contour yeux" };
  if (cat.includes("lip") || cat.includes("lèvre")) return { category: "Visage", subcategory: "Lèvres" };
  return { category: "Visage", subcategory: "Soin" };
}

export function mapObfToProduct(obfProduct: Record<string, unknown>): Product {
  const barcode = (obfProduct.code as string) || (obfProduct._id as string) || `obf_${Date.now()}`;
  const ingredientsText =
    (obfProduct.ingredients_text as string) ||
    (obfProduct.ingredients_text_fr as string) ||
    "";
  const categories =
    (obfProduct.categories as string) ||
    ((obfProduct.categories_tags as string[]) || []).join(", ") ||
    "";
  const { category, subcategory } = mapCategory(categories);
  const ingredients = parseIngredients(ingredientsText);
  const labels = ((obfProduct.labels as string) || "").toLowerCase();
  const inciLower = ingredientsText.toLowerCase();

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
      (obfProduct.image_url as string) ||
      (obfProduct.image_front_url as string) ||
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
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
    incompatibilities: ingredients
      .filter((i) => i.safetyLevel === "caution" || i.safetyLevel === "avoid")
      .flatMap((i) => i.concerns)
      .slice(0, 3),
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
    const fields = "product_name,product_name_fr,brands,categories,categories_tags,ingredients_text,ingredients_text_fr,image_url,image_front_url,labels,code";
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
