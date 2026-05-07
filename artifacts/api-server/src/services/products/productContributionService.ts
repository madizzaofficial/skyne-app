import type { DbProductContribution } from "@workspace/db";
import type {
  ApiContribution,
  ContributionStatus,
  CreateContributionInput,
  ReviewContributionInput,
} from "../../types/productContribution";
import { logger } from "../../lib/logger";
import {
  calculateCompletenessScore,
  getDataQualityStatus,
} from "./productCompletenessService";
import {
  createContribution,
  createProduct,
  findContributionById,
  findProductByBarcode,
  findProductById,
  listContributionsByStatus,
  updateContributionStatus,
  updateProduct,
} from "./productRepository";

// ── Mapper ────────────────────────────────────────────────────────────────────

function toApiContribution(c: DbProductContribution): ApiContribution {
  return {
    id: c.id,
    productId: c.productId,
    barcode: c.barcode,
    submittedByUserId: c.submittedByUserId,
    proposedName: c.proposedName,
    proposedBrand: c.proposedBrand,
    proposedCategories: c.proposedCategories,
    proposedIngredientsText: c.proposedIngredientsText,
    proposedImageUrl: c.proposedImageUrl,
    status: c.status as ContributionStatus,
    reviewerId: c.reviewerId,
    reviewerNotes: c.reviewerNotes,
    reviewedAt: c.reviewedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createProductContribution(
  input: CreateContributionInput,
): Promise<ApiContribution> {
  const row = await createContribution({
    productId: input.productId ?? null,
    barcode: input.barcode ?? null,
    submittedByUserId: input.submittedByUserId ?? null,
    proposedName: input.proposedName ?? null,
    proposedBrand: input.proposedBrand ?? null,
    proposedCategories: input.proposedCategories ?? null,
    proposedIngredientsText: input.proposedIngredientsText ?? null,
    proposedImageUrl: input.proposedImageUrl ?? null,
    proposedImageFrontUrl: input.proposedImageFrontUrl ?? null,
    proposedImageIngredientsUrl: input.proposedImageIngredientsUrl ?? null,
    proposedSourceUrl: input.proposedSourceUrl ?? null,
    notes: input.notes ?? null,
    status: "pending",
  });

  logger.info({ id: row.id, barcode: row.barcode }, "contribution: created");
  return toApiContribution(row);
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getPendingContributions(): Promise<ApiContribution[]> {
  const rows = await listContributionsByStatus("pending");
  return rows.map(toApiContribution);
}

// ── Review helpers ────────────────────────────────────────────────────────────

async function applyContributionToProduct(
  contribution: DbProductContribution,
): Promise<void> {
  let productId = contribution.productId;

  // Find product by barcode if no productId
  if (!productId && contribution.barcode) {
    const found = await findProductByBarcode(contribution.barcode);
    if (found) {
      productId = found.id;
    } else {
      // Create stub product
      const created = await createProduct({
        barcode: contribution.barcode,
        source: "user_contribution",
        completenessScore: 0,
        dataQualityStatus: "incomplete",
      });
      productId = created.id;
    }
  }

  if (!productId) return;

  const existing = await findProductById(productId);
  if (!existing) return;

  // Only fill fields that are currently missing
  const patch: Record<string, unknown> = {};
  if (!existing.name && contribution.proposedName)
    patch.name = contribution.proposedName;
  if (!existing.brand && contribution.proposedBrand)
    patch.brand = contribution.proposedBrand;
  if (!existing.categories?.length && contribution.proposedCategories?.length)
    patch.categories = contribution.proposedCategories;
  if (!existing.ingredientsText && contribution.proposedIngredientsText)
    patch.ingredientsText = contribution.proposedIngredientsText;
  if (!existing.imageUrl && contribution.proposedImageUrl)
    patch.imageUrl = contribution.proposedImageUrl;
  if (!existing.imageFrontUrl && contribution.proposedImageFrontUrl)
    patch.imageFrontUrl = contribution.proposedImageFrontUrl;
  if (!existing.imageIngredientsUrl && contribution.proposedImageIngredientsUrl)
    patch.imageIngredientsUrl = contribution.proposedImageIngredientsUrl;
  if (!existing.sourceUrl && contribution.proposedSourceUrl)
    patch.sourceUrl = contribution.proposedSourceUrl;

  if (Object.keys(patch).length === 0) return;

  const merged = { ...existing, ...patch };
  const score = calculateCompletenessScore(merged);
  const status = getDataQualityStatus(score, existing.dataQualityStatus);

  await updateProduct(productId, {
    ...patch,
    completenessScore: score,
    dataQualityStatus: status,
  });

  logger.info({ productId, patch: Object.keys(patch), score }, "contribution: applied to product");
}

// ── Approve ───────────────────────────────────────────────────────────────────

export async function approveContribution(
  contributionId: string,
  { reviewerId, reviewerNotes }: ReviewContributionInput,
): Promise<ApiContribution | null> {
  const contribution = await findContributionById(contributionId);
  if (!contribution || contribution.status !== "pending") return null;

  await applyContributionToProduct(contribution);

  const updated = await updateContributionStatus(contributionId, {
    status: "approved",
    reviewerId,
    reviewerNotes: reviewerNotes ?? null,
    reviewedAt: new Date(),
  });

  logger.info({ id: contributionId, reviewerId }, "contribution: approved");
  return updated ? toApiContribution(updated) : null;
}

// ── Reject ────────────────────────────────────────────────────────────────────

export async function rejectContribution(
  contributionId: string,
  { reviewerId, reviewerNotes }: ReviewContributionInput,
): Promise<ApiContribution | null> {
  const contribution = await findContributionById(contributionId);
  if (!contribution || contribution.status !== "pending") return null;

  const updated = await updateContributionStatus(contributionId, {
    status: "rejected",
    reviewerId,
    reviewerNotes: reviewerNotes ?? null,
    reviewedAt: new Date(),
  });

  logger.info({ id: contributionId, reviewerId }, "contribution: rejected");
  return updated ? toApiContribution(updated) : null;
}

// ── Request more info ─────────────────────────────────────────────────────────

export async function requestMoreInfo(
  contributionId: string,
  { reviewerId, reviewerNotes }: ReviewContributionInput,
): Promise<ApiContribution | null> {
  const contribution = await findContributionById(contributionId);
  if (!contribution || contribution.status !== "pending") return null;

  const updated = await updateContributionStatus(contributionId, {
    status: "needs_more_info",
    reviewerId,
    reviewerNotes: reviewerNotes ?? null,
    reviewedAt: new Date(),
  });

  return updated ? toApiContribution(updated) : null;
}
