import type {
  ObfApiResponse,
  ObfProduct,
  ObfSearchResponse,
} from "../../types/openBeautyFacts";
import { logger } from "../../lib/logger";

const BASE_URL = "https://world.openbeautyfacts.org";
const TIMEOUT_MS = 10_000;
const USER_AGENT = "Skyne/1.0 (contact@skyne.app)";

const PRODUCT_FIELDS = [
  "code",
  "_id",
  "product_name",
  "product_name_fr",
  "brands",
  "brands_tags",
  "categories",
  "categories_tags",
  "countries",
  "countries_tags",
  "ingredients_text",
  "ingredients_text_fr",
  "ingredients_tags",
  "allergens_tags",
  "labels",
  "labels_tags",
  "stores",
  "image_url",
  "image_front_url",
  "image_ingredients_url",
  "images",
  "last_modified_t",
  "sources",
].join(",");

async function fetchOBF(url: string, retry = true): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });

    if (res.status === 503 && retry) {
      await new Promise((r) => setTimeout(r, 1500));
      return fetchOBF(url, false);
    }

    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function getProductByBarcode(
  barcode: string,
): Promise<ObfProduct | null> {
  try {
    const url = `${BASE_URL}/api/v2/product/${barcode}.json?fields=${PRODUCT_FIELDS}`;
    const res = await fetchOBF(url);

    if (res.status === 404) return null;
    if (res.status === 429) {
      logger.warn({ barcode }, "obf: rate limited");
      return null;
    }
    if (!res.ok) {
      logger.warn({ barcode, status: res.status }, "obf: non-ok response");
      return null;
    }

    const data = (await res.json()) as ObfApiResponse;
    if (data.status !== 1 || !data.product) return null;
    return data.product;
  } catch (err) {
    logger.warn(
      { barcode, err: err instanceof Error ? err.message : String(err) },
      "obf: lookup failed",
    );
    return null;
  }
}

export interface ObfSearchOptions {
  limit?: number;
  page?: number;
}

export async function searchObfProducts(
  query: string,
  options: ObfSearchOptions = {},
): Promise<ObfProduct[]> {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      json: "1",
      page_size: String(options.limit ?? 12),
      page: String(options.page ?? 1),
      fields: PRODUCT_FIELDS,
    });

    const res = await fetchOBF(`${BASE_URL}/cgi/search.pl?${params}`);

    if (!res.ok) {
      logger.warn({ query, status: res.status }, "obf: search failed");
      return [];
    }

    const data = (await res.json()) as ObfSearchResponse;
    return data.products ?? [];
  } catch (err) {
    logger.warn(
      { query, err: err instanceof Error ? err.message : String(err) },
      "obf: search error",
    );
    return [];
  }
}
