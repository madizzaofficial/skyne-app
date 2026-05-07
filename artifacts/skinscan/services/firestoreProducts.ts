import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { Product } from "@/constants/mockData";
import { db } from "@/lib/firebase";
import { mapObfToProduct } from "./openBeautyFacts";

export const PRODUCTS_COLLECTION = "products";

interface OBFCategory {
  slug: string;
  category: string;
  subcategory: string;
}

const OBF_CATEGORIES: OBFCategory[] = [
  { slug: "face-creams", category: "Visage", subcategory: "Hydratant" },
  { slug: "serums-for-the-face", category: "Visage", subcategory: "Sérum" },
  { slug: "facial-cleansers", category: "Visage", subcategory: "Nettoyant" },
  { slug: "toners", category: "Visage", subcategory: "Toner" },
  { slug: "face-masks", category: "Visage", subcategory: "Masque" },
  { slug: "sunscreens", category: "Solaire", subcategory: "SPF visage" },
  { slug: "body-lotions", category: "Corps", subcategory: "Lotion" },
  { slug: "body-creams", category: "Corps", subcategory: "Crème corps" },
  { slug: "shampoos", category: "Cheveux", subcategory: "Shampoing" },
  { slug: "conditioners", category: "Cheveux", subcategory: "Après-shampoing" },
  { slug: "hair-masks", category: "Cheveux", subcategory: "Masque cheveux" },
  { slug: "eye-creams", category: "Yeux", subcategory: "Contour yeux" },
  { slug: "lip-balms", category: "Visage", subcategory: "Lèvres" },
  { slug: "exfoliants-for-the-face", category: "Visage", subcategory: "Exfoliant" },
];

export async function getProductCount(): Promise<number> {
  try {
    const snap = await getDocs(query(collection(db, PRODUCTS_COLLECTION), limit(5)));
    return snap.size;
  } catch {
    return 0;
  }
}

export async function importOBFProducts(
  onProgress?: (imported: number, label: string) => void
): Promise<number> {
  let total = 0;

  for (const cat of OBF_CATEGORIES) {
    for (let page = 1; page <= 6; page++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(
          `https://world.openbeautyfacts.org/category/${cat.slug}/${page}.json`,
          { signal: controller.signal }
        );
        clearTimeout(timer);
        if (!res.ok) break;

        const data = await res.json();
        const products: Record<string, unknown>[] = data.products ?? [];
        if (products.length === 0) break;

        const batch = writeBatch(db);
        let batchCount = 0;

        for (const p of products) {
          const code = p.code as string;
          const name = (p.product_name as string) || (p.product_name_fr as string);
          if (!code || !name || name.trim().length === 0) continue;

          const product = mapObfToProduct(p);
          // Override with precise category from our import config
          product.category = cat.category;
          product.subcategory = cat.subcategory;

          batch.set(doc(db, PRODUCTS_COLLECTION, code), {
            ...product,
            importedAt: new Date().toISOString(),
            source: "obf",
          });
          batchCount++;
          total++;
          if (batchCount >= 100) break;
        }

        if (batchCount > 0) {
          await batch.commit();
          onProgress?.(total, cat.subcategory);
        }

        // Rate-limit: pause between OBF requests
        await new Promise((r) => setTimeout(r, 400));
      } catch {
        // Skip on timeout or network error, continue next category
      }
    }
  }

  return total;
}

export async function lookupProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, barcode));
    if (snap.exists()) return snap.data() as Product;
    return null;
  } catch {
    return null;
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const id = product.barcode || product.id;
    if (!id) return;
    await setDoc(
      doc(db, PRODUCTS_COLLECTION, id),
      { ...product, importedAt: new Date().toISOString(), source: "user" },
      { merge: true }
    );
  } catch {}
}

export async function getProductsByCategory(
  category: string,
  subcategory?: string,
  limitCount = 20
): Promise<Product[]> {
  try {
    const constraints: Parameters<typeof query>[1][] = [
      where("category", "==", category),
    ];
    if (subcategory) {
      constraints.push(where("subcategory", "==", subcategory));
    }
    const snap = await getDocs(
      query(collection(db, PRODUCTS_COLLECTION), ...constraints, limit(limitCount))
    );
    return snap.docs.map((d) => d.data() as Product);
  } catch {
    return [];
  }
}

export async function searchProductsInFirestore(
  queryStr: string,
  limitCount = 30
): Promise<Product[]> {
  try {
    const snap = await getDocs(
      query(collection(db, PRODUCTS_COLLECTION), limit(200))
    );
    const all = snap.docs.map((d) => d.data() as Product);
    if (!queryStr.trim()) return all.slice(0, limitCount);
    const q = queryStr.toLowerCase();
    return all
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
      .slice(0, limitCount);
  } catch {
    return [];
  }
}
