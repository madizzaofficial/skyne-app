import type { DbProduct } from "@workspace/db";

export function calculateCompletenessScore(
  product: Partial<DbProduct>,
): number {
  let score = 0;
  if (product.barcode) score += 10;
  if (product.name?.trim()) score += 15;
  if (product.brand?.trim()) score += 15;
  if (product.ingredientsText && product.ingredientsText.trim().length > 30)
    score += 30;
  if (product.imageFrontUrl || product.imageUrl) score += 15;
  if (product.imageIngredientsUrl) score += 10;
  if (product.categories && product.categories.length > 0) score += 5;
  return Math.min(score, 100);
}

export function getMissingProductFields(
  product: Partial<DbProduct>,
): string[] {
  const missing: string[] = [];
  if (!product.name?.trim()) missing.push("name");
  if (!product.brand?.trim()) missing.push("brand");
  if (
    !product.ingredientsText ||
    product.ingredientsText.trim().length <= 30
  )
    missing.push("ingredients_text");
  if (!product.imageFrontUrl && !product.imageUrl)
    missing.push("front_image");
  if (!product.imageIngredientsUrl) missing.push("ingredients_image");
  if (!product.categories || product.categories.length === 0)
    missing.push("categories");
  return missing;
}

export function getDataQualityStatus(
  score: number,
  currentStatus: string,
): "incomplete" | "usable" | "verified" {
  if (currentStatus === "verified") return "verified";
  return score >= 70 ? "usable" : "incomplete";
}
