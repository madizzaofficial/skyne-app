import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db, productAnalysisCache, products } from "@workspace/db";
import type { ProductAnalysisResult } from "../../types/product";
import { analyzeIngredients } from "./productAnalysisService";

export function hashIngredients(ingredientsText: string): string {
  return crypto
    .createHash("sha256")
    .update(ingredientsText.trim().toLowerCase())
    .digest("hex");
}

export async function getCachedAnalysis(
  productId: string,
  ingredientsText: string,
): Promise<ProductAnalysisResult | null> {
  const hash = hashIngredients(ingredientsText);
  const rows = await db
    .select()
    .from(productAnalysisCache)
    .where(
      and(
        eq(productAnalysisCache.productId, productId),
        eq(productAnalysisCache.ingredientsHash, hash),
      ),
    )
    .limit(1);
  return rows[0] ? (rows[0].analysis as ProductAnalysisResult) : null;
}

export async function saveAnalysisToCache(
  productId: string,
  ingredientsText: string,
  analysis: ProductAnalysisResult,
): Promise<void> {
  const hash = hashIngredients(ingredientsText);
  await db
    .insert(productAnalysisCache)
    .values({
      productId,
      ingredientsHash: hash,
      analysis: analysis as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  // Mark product as analysis-cached
  await db
    .update(products)
    .set({ analysisCachedAt: new Date(), updatedAt: new Date() })
    .where(eq(products.id, productId));
}

export async function getOrComputeAnalysis(
  productId: string,
  ingredientsText: string,
): Promise<ProductAnalysisResult> {
  const cached = await getCachedAnalysis(productId, ingredientsText);
  if (cached) return cached;

  const analysis = analyzeIngredients(ingredientsText);
  await saveAnalysisToCache(productId, ingredientsText, analysis);
  return analysis;
}
