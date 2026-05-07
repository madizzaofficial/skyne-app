import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    barcode: text("barcode").unique(),
    name: text("name"),
    brand: text("brand"),
    brands: text("brands").array(),
    categories: text("categories").array(),
    countries: text("countries").array(),
    ingredientsText: text("ingredients_text"),
    ingredientsTags: text("ingredients_tags").array(),
    allergensTags: text("allergens_tags").array(),
    labelsTags: text("labels_tags").array(),
    stores: text("stores").array(),
    imageUrl: text("image_url"),
    imageFrontUrl: text("image_front_url"),
    imageIngredientsUrl: text("image_ingredients_url"),
    imagesRaw: jsonb("images_raw"),
    frontImageUrl100: text("front_image_url_100"),
    frontImageUrl400: text("front_image_url_400"),
    frontImageUrlFull: text("front_image_url_full"),
    ingredientsImageUrl100: text("ingredients_image_url_100"),
    ingredientsImageUrl400: text("ingredients_image_url_400"),
    ingredientsImageUrlFull: text("ingredients_image_url_full"),
    source: text("source").default("unknown").notNull(),
    sourceUrl: text("source_url"),
    raw: jsonb("raw"),
    completenessScore: integer("completeness_score").default(0).notNull(),
    dataQualityStatus: text("data_quality_status").default("incomplete").notNull(),
    lastFetchedFromApiAt: timestamp("last_fetched_from_api_at"),
    sourceUpdatedAt: timestamp("source_updated_at"),
    analysisCachedAt: timestamp("analysis_cached_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("products_name_lower_idx").on(sql`lower(${t.name})`),
    index("products_brand_lower_idx").on(sql`lower(${t.brand})`),
    index("products_ingredients_tags_gin_idx").using("gin", t.ingredientsTags),
    index("products_categories_gin_idx").using("gin", t.categories),
  ],
);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type DbProduct = typeof products.$inferSelect;
