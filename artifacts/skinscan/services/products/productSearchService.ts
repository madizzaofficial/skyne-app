import { Product } from "@/types/product";
import { IProductRepository, ProductSearchParams } from "./productRepository";

export interface SearchResult {
  products: Product[];
  total: number;
  source: "local" | "remote" | "mixed";
}

export async function searchProducts(
  repository: IProductRepository,
  params: ProductSearchParams
): Promise<SearchResult> {
  const products = await repository.search(params);
  return {
    products,
    total: products.length,
    source: "local",
  };
}

export async function getProductsByCategory(
  repository: IProductRepository,
  category: string,
  subcategory?: string,
  limit = 20
): Promise<Product[]> {
  return repository.getByCategory(category, subcategory, limit);
}

export async function lookupBarcode(
  repository: IProductRepository,
  barcode: string
): Promise<Product | null> {
  return repository.getByBarcode(barcode);
}
