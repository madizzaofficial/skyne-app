import type { InsertProduct } from "@workspace/db";
import type { ObfProduct } from "../../types/openBeautyFacts";
import {
  calculateCompletenessScore,
  getDataQualityStatus,
} from "./productCompletenessService";
import { extractBestImageUrls } from "./productImageUtils";

export function mapObfProductToInsert(
  obf: ObfProduct,
  overrideBarcode?: string,
): InsertProduct {
  const barcode =
    overrideBarcode ??
    obf.code?.trim() ??
    (obf._id as string | undefined)?.trim() ??
    null;

  const name =
    obf.product_name?.trim() || obf.product_name_fr?.trim() || null;

  const brand = obf.brands?.split(",")[0]?.trim() || null;
  const brands =
    obf.brands_tags?.map((t) => t.replace(/^[a-z]{2}:/, "")) ?? null;

  const categories =
    obf.categories_tags?.map((t) => t.replace(/^[a-z]{2}:/, "")) ?? null;

  const countries =
    obf.countries_tags?.map((t) => t.replace(/^[a-z]{2}:/, "")) ?? null;

  const ingredientsText =
    obf.ingredients_text?.trim() || obf.ingredients_text_fr?.trim() || null;

  const ingredientsTags = obf.ingredients_tags ?? null;
  const allergensTags = obf.allergens_tags ?? null;
  const labelsTags = obf.labels_tags ?? null;

  const stores =
    obf.stores
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? null;

  const imageUrls = extractBestImageUrls(obf, barcode ?? undefined);

  const sourceUrl = obf.sources?.[0]?.url ?? null;
  const sourceUpdatedAt = obf.last_modified_t
    ? new Date(obf.last_modified_t * 1000)
    : null;

  const partial = {
    barcode,
    name,
    brand,
    imageFrontUrl: imageUrls.imageFrontUrl,
    imageUrl: imageUrls.imageUrl,
    imageIngredientsUrl: imageUrls.imageIngredientsUrl,
    ingredientsText,
    categories,
  };

  const completenessScore = calculateCompletenessScore(partial);
  const dataQualityStatus = getDataQualityStatus(completenessScore, "incomplete");

  return {
    barcode,
    name,
    brand,
    brands,
    categories,
    countries,
    ingredientsText,
    ingredientsTags,
    allergensTags,
    labelsTags,
    stores,
    ...imageUrls,
    imagesRaw: obf.images ? (obf.images as Record<string, unknown>) : null,
    source: "open_beauty_facts_api",
    sourceUrl,
    raw: obf as Record<string, unknown>,
    completenessScore,
    dataQualityStatus,
    lastFetchedFromApiAt: new Date(),
    sourceUpdatedAt,
  };
}
