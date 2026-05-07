import { MOCK_PRODUCTS } from "@/constants/mockData";
import { Product } from "@/types/product";
import {
  IProductRepository,
  ProductSearchParams,
} from "./productRepository";

function legacyToProduct(p: (typeof MOCK_PRODUCTS)[0]): Product {
  return {
    id: p.id,
    barcode: p.barcode,
    name: p.name,
    brand: p.brand,
    categories: [
      {
        id: p.category?.toLowerCase().replace(/\s+/g, "_") ?? "unknown",
        label: p.category ?? "Inconnu",
        subcategoryId: p.subcategory?.toLowerCase().replace(/\s+/g, "_"),
        subcategoryLabel: p.subcategory,
      },
    ],
    ingredientsText: p.ingredients.map((i) => i.inci).join(", "),
    ingredients: p.ingredients,
    imageUrl: p.image,
    source: "mock",
    lastUpdatedAt: new Date().toISOString(),
    communityScore: p.communityScore,
    reviewCount: p.reviewCount,
  };
}

export class MockProductRepository implements IProductRepository {
  private products: Product[] = MOCK_PRODUCTS.map(legacyToProduct);

  async getById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async getByBarcode(barcode: string): Promise<Product | null> {
    return this.products.find((p) => p.barcode === barcode) ?? null;
  }

  async search(params: ProductSearchParams): Promise<Product[]> {
    let results = [...this.products];

    if (params.query) {
      const q = params.query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.ingredientsText?.toLowerCase().includes(q)
      );
    }

    if (params.category) {
      results = results.filter((p) =>
        p.categories.some(
          (c) =>
            c.label.toLowerCase() === params.category!.toLowerCase() ||
            c.id === params.category!.toLowerCase()
        )
      );
    }

    if (params.subcategory) {
      results = results.filter((p) =>
        p.categories.some(
          (c) =>
            c.subcategoryLabel?.toLowerCase() ===
            params.subcategory!.toLowerCase()
        )
      );
    }

    const offset = params.offset ?? 0;
    const limit = params.limit ?? 20;
    return results.slice(offset, offset + limit);
  }

  async getByCategory(
    category: string,
    subcategory?: string,
    limit = 20
  ): Promise<Product[]> {
    let results = this.products.filter((p) =>
      p.categories.some(
        (c) =>
          c.label.toLowerCase() === category.toLowerCase() ||
          c.id === category.toLowerCase()
      )
    );

    if (subcategory) {
      results = results.filter((p) =>
        p.categories.some(
          (c) =>
            c.subcategoryLabel?.toLowerCase() === subcategory.toLowerCase()
        )
      );
    }

    return results.slice(0, limit);
  }

  async save(product: Product): Promise<void> {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.products[idx] = product;
    } else {
      this.products.push(product);
    }
  }
}
