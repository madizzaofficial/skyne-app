import { Product } from "@/types/product";

export interface ProductSearchParams {
  query?: string;
  category?: string;
  subcategory?: string;
  limit?: number;
  offset?: number;
}

export interface IProductRepository {
  getById(id: string): Promise<Product | null>;
  getByBarcode(barcode: string): Promise<Product | null>;
  search(params: ProductSearchParams): Promise<Product[]>;
  getByCategory(category: string, subcategory?: string, limit?: number): Promise<Product[]>;
  save(product: Product): Promise<void>;
}

let _repository: IProductRepository | null = null;

export function setProductRepository(repo: IProductRepository): void {
  _repository = repo;
}

export function getProductRepository(): IProductRepository {
  if (!_repository) {
    throw new Error(
      "ProductRepository not initialized. Call setProductRepository() first."
    );
  }
  return _repository;
}
