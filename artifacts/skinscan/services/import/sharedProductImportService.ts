export type RetailerSlug =
  | "amazon"
  | "sephora"
  | "atida"
  | "nocibe"
  | "notino"
  | "yesstyle"
  | "stylevana"
  | "other";

export interface RetailerInfo {
  slug: RetailerSlug;
  displayName: string;
}

export interface SharedProductInput {
  url?: string;
  text?: string;
}

export interface ParsedProductInput {
  url: string | null;
  retailer: RetailerInfo | null;
  isValid: boolean;
  errorReason?: string;
}

export interface ImportedProductMetadata {
  name?: string;
  brand?: string;
  imageUrl?: string;
  description?: string;
  price?: string;
  retailer: RetailerInfo | null;
  sourceUrl: string;
  rawIngredients?: string;
}

const RETAILER_MAP: Record<string, RetailerInfo> = {
  "amazon.fr": { slug: "amazon", displayName: "Amazon" },
  "amazon.com": { slug: "amazon", displayName: "Amazon" },
  "amazon.co.uk": { slug: "amazon", displayName: "Amazon" },
  "sephora.fr": { slug: "sephora", displayName: "Sephora" },
  "sephora.com": { slug: "sephora", displayName: "Sephora" },
  "atida.fr": { slug: "atida", displayName: "Atida" },
  "mifarma.es": { slug: "atida", displayName: "Atida / mifarma" },
  "nocibe.fr": { slug: "nocibe", displayName: "Nocibé" },
  "notino.fr": { slug: "notino", displayName: "Notino" },
  "notino.com": { slug: "notino", displayName: "Notino" },
  "yesstyle.com": { slug: "yesstyle", displayName: "YesStyle" },
  "yesstyle.fr": { slug: "yesstyle", displayName: "YesStyle" },
  "stylevana.com": { slug: "stylevana", displayName: "Stylevana" },
};

const URL_REGEX = /https?:\/\/[^\s"'<>]+/gi;

export function extractUrlFromSharedText(text: string): string | null {
  const matches = text.match(URL_REGEX);
  return matches?.[0] ?? null;
}

export function detectRetailerFromUrl(url: string): RetailerInfo | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (RETAILER_MAP[hostname]) return RETAILER_MAP[hostname];
    const partialMatch = Object.keys(RETAILER_MAP).find((key) =>
      hostname.includes(key.split(".")[0])
    );
    if (partialMatch) return RETAILER_MAP[partialMatch];
    return { slug: "other", displayName: "Autre site" };
  } catch {
    return null;
  }
}

export function parseSharedProductInput(
  input: SharedProductInput
): ParsedProductInput {
  let url: string | null = input.url ?? null;

  if (!url && input.text) {
    url = extractUrlFromSharedText(input.text);
  }

  if (!url) {
    return {
      url: null,
      retailer: null,
      isValid: false,
      errorReason: "Aucune URL valide trouvée dans le contenu partagé.",
    };
  }

  try {
    new URL(url);
  } catch {
    return {
      url,
      retailer: null,
      isValid: false,
      errorReason: "L'URL fournie n'est pas valide.",
    };
  }

  const retailer = detectRetailerFromUrl(url);

  return {
    url,
    retailer,
    isValid: true,
  };
}

export function normalizeImportedProduct(rawData: {
  title?: string;
  description?: string;
  image?: string;
  url: string;
  retailer: RetailerInfo | null;
}): ImportedProductMetadata {
  return {
    name: rawData.title?.trim(),
    imageUrl: rawData.image,
    description: rawData.description?.trim(),
    retailer: rawData.retailer,
    sourceUrl: rawData.url,
  };
}

/**
 * TODO (native): This function is a placeholder for a real backend call.
 * Product page scraping must happen server-side because:
 * - CORS restrictions on mobile HTTP clients
 * - Anti-bot protections on retailer sites
 * - HTML parsing performance impact on the device
 * - Security: do not expose scraping logic client-side
 *
 * Replace this with: POST /api/products/analyze-url { url }
 */
export async function analyzeProductFromUrl(
  url: string
): Promise<ImportedProductMetadata> {
  await new Promise((r) => setTimeout(r, 1200));

  const retailer = detectRetailerFromUrl(url);

  return normalizeImportedProduct({
    title: undefined,
    description: undefined,
    image: undefined,
    url,
    retailer,
  });
}

/**
 * TODO (native): Fetch real Open Graph / meta tags from the product page.
 * Must be done via a backend proxy — not directly from the mobile app.
 */
export async function fetchProductPageMetadata(
  url: string
): Promise<ImportedProductMetadata> {
  return analyzeProductFromUrl(url);
}
