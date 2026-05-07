import type { DbProduct, InsertProduct } from "@workspace/db";
import type { ApiProduct, ProductLookupResult, ProductSearchResult } from "../../types/product";
import { logger } from "../../lib/logger";
import { getProductByBarcode, searchObfProducts } from "../openBeautyFacts/openBeautyFactsApiClient";
import { getOrComputeAnalysis } from "./productAnalysisCacheService";
import {
  calculateCompletenessScore,
  getDataQualityStatus,
  getMissingProductFields,
} from "./productCompletenessService";
import { mapObfProductToInsert } from "./productImportMapper";
import {
  createProduct,
  findProductByBarcode,
  searchProductsLocal,
  updateProduct,
  upsertProductByBarcode,
} from "./productRepository";

// ── Mappers ───────────────────────────────────────────────────────────────────

export function dbProductToApi(p: DbProduct): ApiProduct {
  return {
    id: p.id,
    barcode: p.barcode,
    name: p.name,
    brand: p.brand,
    brands: p.brands,
    categories: p.categories,
    countries: p.countries,
    ingredientsText: p.ingredientsText,
    ingredientsTags: p.ingredientsTags,
    allergensTags: p.allergensTags,
    labelsTags: p.labelsTags,
    imageUrl: p.imageUrl,
    imageFrontUrl: p.imageFrontUrl,
    imageIngredientsUrl: p.imageIngredientsUrl,
    frontImageUrl100: p.frontImageUrl100,
    frontImageUrl400: p.frontImageUrl400,
    frontImageUrlFull: p.frontImageUrlFull,
    ingredientsImageUrl100: p.ingredientsImageUrl100,
    ingredientsImageUrl400: p.ingredientsImageUrl400,
    ingredientsImageUrlFull: p.ingredientsImageUrlFull,
    source: p.source,
    completenessScore: p.completenessScore,
    dataQualityStatus: p.dataQualityStatus,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ── Safe merge: keep verified local data, fill missing from API ───────────────

function safeMerge(
  existing: DbProduct,
  fresh: InsertProduct,
): Partial<InsertProduct> {
  const verified = existing.dataQualityStatus === "verified";

  const pick = <T>(local: T | null | undefined, api: T | null | undefined): T | null | undefined => {
    if (verified && local != null) return local;
    if (local == null) return api ?? null;
    if (!verified && api != null) return api;
    return local;
  };

  return {
    name: pick(existing.name, fresh.name),
    brand: pick(existing.brand, fresh.brand),
    brands: pick(existing.brands, fresh.brands),
    categories: pick(existing.categories, fresh.categories),
    countries: pick(existing.countries, fresh.countries),
    ingredientsText: pick(existing.ingredientsText, fresh.ingredientsText),
    ingredientsTags: pick(existing.ingredientsTags, fresh.ingredientsTags),
    allergensTags: pick(existing.allergensTags, fresh.allergensTags),
    labelsTags: pick(existing.labelsTags, fresh.labelsTags),
    stores: pick(existing.stores, fresh.stores),
    imageUrl: pick(existing.imageUrl, fresh.imageUrl),
    imageFrontUrl: pick(existing.imageFrontUrl, fresh.imageFrontUrl),
    imageIngredientsUrl: pick(existing.imageIngredientsUrl, fresh.imageIngredientsUrl),
    imagesRaw: (verified && existing.imagesRaw != null
      ? existing.imagesRaw
      : (fresh.imagesRaw ?? existing.imagesRaw)) as Record<string, unknown> | null,
    frontImageUrl100: pick(existing.frontImageUrl100, fresh.frontImageUrl100),
    frontImageUrl400: pick(existing.frontImageUrl400, fresh.frontImageUrl400),
    frontImageUrlFull: pick(existing.frontImageUrlFull, fresh.frontImageUrlFull),
    ingredientsImageUrl100: pick(existing.ingredientsImageUrl100, fresh.ingredientsImageUrl100),
    ingredientsImageUrl400: pick(existing.ingredientsImageUrl400, fresh.ingredientsImageUrl400),
    ingredientsImageUrlFull: pick(existing.ingredientsImageUrlFull, fresh.ingredientsImageUrlFull),
    raw: (verified && existing.raw != null
      ? existing.raw
      : (fresh.raw ?? existing.raw)) as Record<string, unknown> | null,
    sourceUrl: pick(existing.sourceUrl, fresh.sourceUrl),
    lastFetchedFromApiAt: new Date(),
    sourceUpdatedAt: fresh.sourceUpdatedAt,
  };
}

// ── Core lookup ───────────────────────────────────────────────────────────────

export async function lookupProductByBarcode(
  rawBarcode: string,
): Promise<ProductLookupResult> {
  const barcode = rawBarcode.trim().replace(/\D/g, "");

  if (!barcode || barcode.length < 8 || barcode.length > 14) {
    return {
      product: null,
      source: "not_found",
      needsContribution: false,
      missingFields: [],
      message: "Code-barres invalide.",
    };
  }

  // 1. Local DB
  let existing = await findProductByBarcode(barcode);

  if (existing && existing.completenessScore >= 70) {
    logger.info({ barcode, id: existing.id }, "product: found locally (complete)");
    const apiProduct = dbProductToApi(existing);
    const analysis = existing.ingredientsText
      ? await getOrComputeAnalysis(existing.id, existing.ingredientsText)
      : undefined;
    return {
      product: apiProduct,
      source: "local",
      needsContribution: false,
      missingFields: getMissingProductFields(existing),
      message: "Produit trouvé.",
      analysis,
    };
  }

  // 2. Call OBF API (product missing or incomplete locally)
  logger.info({ barcode, localExists: !!existing }, "product: fetching from OBF API");
  const obfProduct = await getProductByBarcode(barcode);

  if (obfProduct) {
    const mapped = mapObfProductToInsert(obfProduct, barcode);

    let saved: DbProduct;

    if (existing) {
      // Merge safely into existing record
      const mergedData = safeMerge(existing, mapped);
      const score = calculateCompletenessScore({ ...existing, ...mergedData });
      const status = getDataQualityStatus(score, existing.dataQualityStatus);
      const updated = await updateProduct(existing.id, {
        ...mergedData,
        completenessScore: score,
        dataQualityStatus: status,
      });
      saved = updated ?? existing;
    } else {
      // Create new record
      saved = await createProduct(mapped);
    }

    logger.info({ barcode, id: saved.id, score: saved.completenessScore }, "product: saved from OBF API");

    const apiProduct = dbProductToApi(saved);
    const analysis = saved.ingredientsText
      ? await getOrComputeAnalysis(saved.id, saved.ingredientsText)
      : undefined;

    return {
      product: apiProduct,
      source: "open_beauty_facts_api",
      needsContribution: saved.completenessScore < 70,
      missingFields: getMissingProductFields(saved),
      message:
        saved.completenessScore >= 70
          ? "Produit trouvé sur Open Beauty Facts."
          : "Produit trouvé mais incomplet. Des informations manquent.",
      analysis,
    };
  }

  // 3. Not found anywhere
  return {
    product: existing ? dbProductToApi(existing) : null,
    source: "not_found",
    needsContribution: true,
    missingFields: existing ? getMissingProductFields(existing) : ["name", "brand", "ingredients_text", "front_image"],
    message: "Produit introuvable. Tu peux contribuer en ajoutant ses informations.",
  };
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchProducts(
  query: string,
  limit = 12,
): Promise<ProductSearchResult[]> {
  if (!query?.trim() || query.trim().length < 2) return [];

  // 1. Local first
  const localResults = await searchProductsLocal(query.trim(), limit);
  const localIds = new Set(localResults.map((p) => p.id));

  // 2. OBF API if local results are weak (< 3) and query is long enough
  let merged = [...localResults];

  if (localResults.length < 3 && query.trim().length >= 3) {
    const obfResults = await searchObfProducts(query.trim(), { limit });
    for (const obf of obfResults) {
      const barcode = obf.code ?? obf._id;
      if (!barcode) continue;

      // Check if already in local results
      const existing = localResults.find((p) => p.barcode === barcode);
      if (existing) continue;

      // Save to local DB for future lookups
      const mapped = mapObfProductToInsert(obf);
      try {
        if (mapped.barcode) {
          const saved = await upsertProductByBarcode(mapped as InsertProduct & { barcode: string });
          if (!localIds.has(saved.id)) {
            merged.push(saved);
          }
        }
      } catch {
        // Non-fatal: just skip this product
      }
    }
  }

  return merged.slice(0, limit).map((p) => ({
    id: p.id,
    barcode: p.barcode,
    name: p.name,
    brand: p.brand,
    imageUrl: p.imageUrl,
    imageFrontUrl: p.imageFrontUrl,
    categories: p.categories,
    completenessScore: p.completenessScore,
    dataQualityStatus: p.dataQualityStatus,
  }));
}
