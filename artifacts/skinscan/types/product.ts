export type ProductSource = "obf" | "user" | "api" | "mock";

export interface ProductImage {
  url: string;
  type: "front" | "ingredients" | "nutrition" | "other";
  altText?: string;
}

export interface ProductIngredient {
  id: string;
  inci: string;
  commonName: string;
  function: string;
  safetyLevel: "safe" | "caution" | "avoid";
  isAllergen: boolean;
  isComedogenic: boolean;
  isFungalAcneSafe: boolean;
  benefits: string[];
  concerns: string[];
  concernIcons?: string[];
  description: string;
}

export interface ProductCategory {
  id: string;
  label: string;
  subcategoryId?: string;
  subcategoryLabel?: string;
}

export interface Product {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  categories: ProductCategory[];
  subcategories?: string[];
  ingredientsText?: string;
  ingredients: ProductIngredient[];
  imageUrl?: string;
  imageIngredientsUrl?: string;
  source: ProductSource;
  sourceUrl?: string;
  lastUpdatedAt?: string;
  communityScore?: number;
  reviewCount?: number;
}

export interface DetectedIngredient {
  inci: string;
  commonName: string;
  reason: string;
  category: "fragrance" | "alcohol" | "essentialOil" | "allergen" | "helpful" | "other";
}

export interface AnalysisWarning {
  level: "info" | "caution" | "avoid";
  message: string;
  relatedIngredients: string[];
}

export interface ProductAnalysisResult {
  productId?: string;
  productName: string;
  brand?: string;
  ingredientsText: string;
  detectedIngredients: DetectedIngredient[];
  warnings: AnalysisWarning[];
  positivePoints: string[];
  acneSafetyNotes: string[];
  sensitiveSkinNotes: string[];
  fragranceAlcoholNotes: string[];
  comedogenicRiskLevel: "low" | "medium" | "high" | "unknown";
  irritationRiskLevel: "low" | "medium" | "high" | "unknown";
  summary: string;
  confidenceScore: number;
}
