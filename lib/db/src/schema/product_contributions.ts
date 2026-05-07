import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { products } from "./products";

export const productContributions = pgTable(
  "product_contributions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id),
    barcode: text("barcode"),
    submittedByUserId: text("submitted_by_user_id"),
    proposedName: text("proposed_name"),
    proposedBrand: text("proposed_brand"),
    proposedCategories: text("proposed_categories").array(),
    proposedIngredientsText: text("proposed_ingredients_text"),
    proposedImageUrl: text("proposed_image_url"),
    proposedImageFrontUrl: text("proposed_image_front_url"),
    proposedImageIngredientsUrl: text("proposed_image_ingredients_url"),
    proposedSourceUrl: text("proposed_source_url"),
    notes: text("notes"),
    status: text("status").default("pending").notNull(),
    reviewerId: text("reviewer_id"),
    reviewerNotes: text("reviewer_notes"),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("product_contributions_status_idx").on(t.status)],
);

export const insertProductContributionSchema = createInsertSchema(productContributions);
export type InsertProductContribution = z.infer<typeof insertProductContributionSchema>;
export type DbProductContribution = typeof productContributions.$inferSelect;
