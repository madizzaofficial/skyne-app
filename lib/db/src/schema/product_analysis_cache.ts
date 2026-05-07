import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";

export const productAnalysisCache = pgTable(
  "product_analysis_cache",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    ingredientsHash: text("ingredients_hash").notNull(),
    analysis: jsonb("analysis").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("product_analysis_cache_product_id_idx").on(t.productId),
    index("product_analysis_cache_hash_idx").on(t.ingredientsHash),
  ],
);

export type DbProductAnalysisCache = typeof productAnalysisCache.$inferSelect;
