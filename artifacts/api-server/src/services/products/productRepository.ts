import { and, eq, ilike, or } from "drizzle-orm";
import {
  db,
  productContributions,
  products,
  type DbProduct,
  type DbProductContribution,
  type InsertProduct,
  type InsertProductContribution,
} from "@workspace/db";

// ── Products ─────────────────────────────────────────────────────────────────

export async function findProductByBarcode(
  barcode: string,
): Promise<DbProduct | null> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.barcode, barcode))
    .limit(1);
  return rows[0] ?? null;
}

export async function findProductById(id: string): Promise<DbProduct | null> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createProduct(data: InsertProduct): Promise<DbProduct> {
  const rows = await db
    .insert(products)
    .values({ ...data, updatedAt: new Date() })
    .returning();
  return rows[0]!;
}

export async function updateProduct(
  id: string,
  data: Partial<InsertProduct>,
): Promise<DbProduct | null> {
  const rows = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function upsertProductByBarcode(
  data: InsertProduct & { barcode: string },
): Promise<DbProduct> {
  const rows = await db
    .insert(products)
    .values({ ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: products.barcode,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();
  return rows[0]!;
}

export async function searchProductsLocal(
  query: string,
  limit = 12,
): Promise<DbProduct[]> {
  const q = `%${query}%`;
  return db
    .select()
    .from(products)
    .where(or(ilike(products.name, q), ilike(products.brand, q)))
    .limit(limit);
}

// ── Contributions ─────────────────────────────────────────────────────────────

export async function createContribution(
  data: InsertProductContribution,
): Promise<DbProductContribution> {
  const rows = await db
    .insert(productContributions)
    .values({ ...data, updatedAt: new Date() })
    .returning();
  return rows[0]!;
}

export async function findContributionById(
  id: string,
): Promise<DbProductContribution | null> {
  const rows = await db
    .select()
    .from(productContributions)
    .where(eq(productContributions.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function listContributionsByStatus(
  status: string,
  limit = 50,
): Promise<DbProductContribution[]> {
  return db
    .select()
    .from(productContributions)
    .where(eq(productContributions.status, status))
    .limit(limit);
}

export async function updateContributionStatus(
  id: string,
  data: Partial<InsertProductContribution>,
): Promise<DbProductContribution | null> {
  const rows = await db
    .update(productContributions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productContributions.id, id))
    .returning();
  return rows[0] ?? null;
}
