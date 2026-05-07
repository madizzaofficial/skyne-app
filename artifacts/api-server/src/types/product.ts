export type ProductSource = "local" | "open_beauty_facts_api" | "not_found";
export type DataQualityStatus = "incomplete" | "usable" | "verified" | "rejected";
export type ComedogenicRiskLevel = "low" | "medium" | "high" | "unknown";
export type IrritationRiskLevel = "low" | "medium" | "high" | "unknown";

export interface AnalyzedIngredient {
  inci: string;
  commonName: string;
  function: string;
  safetyLevel: "safe" | "caution" | "avoid";
  isAllergen: boolean;
  benefits: string[];
  concerns: string[];
}

export interface ProductAnalysisResult {
  summary: string;
  detectedIngredients: AnalyzedIngredient[];
  warnings: string[];
  positivePoints: string[];
  acneSafetyNotes: string[];
  sensitiveSkinNotes: string[];
  fragranceAlcoholNotes: string[];
  comedogenicRiskLevel: ComedogenicRiskLevel;
  irritationRiskLevel: IrritationRiskLevel;
  confidenceScore: number;
}

export interface ApiProduct {
  id: string;
  barcode: string | null;
  name: string | null;
  brand: string | null;
  brands: string[] | null;
  categories: string[] | null;
  countries: string[] | null;
  ingredientsText: string | null;
  ingredientsTags: string[] | null;
  allergensTags: string[] | null;
  labelsTags: string[] | null;
  imageUrl: string | null;
  imageFrontUrl: string | null;
  imageIngredientsUrl: string | null;
  frontImageUrl100: string | null;
  frontImageUrl400: string | null;
  frontImageUrlFull: string | null;
  ingredientsImageUrl100: string | null;
  ingredientsImageUrl400: string | null;
  ingredientsImageUrlFull: string | null;
  source: string;
  completenessScore: number;
  dataQualityStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductLookupResult {
  product: ApiProduct | null;
  source: ProductSource;
  needsContribution: boolean;
  missingFields: string[];
  message: string;
  analysis?: ProductAnalysisResult;
}

export interface ProductSearchResult {
  id: string;
  barcode: string | null;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  imageFrontUrl: string | null;
  categories: string[] | null;
  completenessScore: number;
  dataQualityStatus: string;
}
