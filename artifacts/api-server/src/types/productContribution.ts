export interface CreateContributionInput {
  barcode?: string;
  productId?: string;
  submittedByUserId?: string;
  proposedName?: string;
  proposedBrand?: string;
  proposedCategories?: string[];
  proposedIngredientsText?: string;
  proposedImageUrl?: string;
  proposedImageFrontUrl?: string;
  proposedImageIngredientsUrl?: string;
  proposedSourceUrl?: string;
  notes?: string;
}

export type ContributionStatus = "pending" | "approved" | "rejected" | "needs_more_info";

export interface ApiContribution {
  id: string;
  productId: string | null;
  barcode: string | null;
  submittedByUserId: string | null;
  proposedName: string | null;
  proposedBrand: string | null;
  proposedCategories: string[] | null;
  proposedIngredientsText: string | null;
  proposedImageUrl: string | null;
  status: ContributionStatus;
  reviewerId: string | null;
  reviewerNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface ReviewContributionInput {
  reviewerId: string;
  reviewerNotes?: string;
}
