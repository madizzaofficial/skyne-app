import type { ObfProduct, ObfProductImages } from "../../types/openBeautyFacts";

export interface ProductImageUrls {
  imageUrl: string | null;
  imageFrontUrl: string | null;
  imageIngredientsUrl: string | null;
  frontImageUrl100: string | null;
  frontImageUrl400: string | null;
  frontImageUrlFull: string | null;
  ingredientsImageUrl100: string | null;
  ingredientsImageUrl400: string | null;
  ingredientsImageUrlFull: string | null;
}

const IMAGE_CDN = "https://images.openfoodfacts.org/images/products";

export function cleanBarcode(barcode: string): string | null {
  const clean = barcode.replace(/\D/g, "");
  if (clean.length < 8 || clean.length > 14) return null;
  return clean;
}

export function buildOpenFactsImagePath(barcode: string): string | null {
  const clean = cleanBarcode(barcode);
  if (!clean) return null;
  if (clean.length === 13) {
    return `${clean.slice(0, 3)}/${clean.slice(3, 6)}/${clean.slice(6, 9)}/${clean.slice(9)}`;
  }
  return clean;
}

export function buildOpenFactsImageBaseUrl(barcode: string): string | null {
  const path = buildOpenFactsImagePath(barcode);
  if (!path) return null;
  return `${IMAGE_CDN}/${path}`;
}

export function buildSelectedImageUrl(
  barcode: string,
  imageKey: string,
  rev: string,
  size: "100" | "400" | "full",
): string | null {
  const path = buildOpenFactsImagePath(barcode);
  if (!path) return null;
  return `${IMAGE_CDN}/${path}/${imageKey}.${rev}.${size}.jpg`;
}

export function buildRawImageUrl(
  barcode: string,
  imgid: string,
  size: "100" | "400" | "full",
): string | null {
  const path = buildOpenFactsImagePath(barcode);
  if (!path) return null;
  return `${IMAGE_CDN}/${path}/${imgid}.${size}.jpg`;
}

function pickImageKey(
  images: ObfProductImages,
  prefixes: string[],
): string | undefined {
  for (const prefix of prefixes) {
    const key = Object.keys(images).find((k) => k.startsWith(prefix));
    if (key) return key;
  }
  return undefined;
}

function extractSizedUrls(
  barcode: string,
  images: ObfProductImages,
  key: string,
): { url100: string | null; url400: string | null; urlFull: string | null } {
  const img = images[key];
  if (!img) return { url100: null, url400: null, urlFull: null };

  const rev = img.rev ?? "1";

  const url100 =
    img.sizes?.["100"]?.url ??
    buildSelectedImageUrl(barcode, key, rev, "100");
  const url400 =
    img.sizes?.["400"]?.url ??
    buildSelectedImageUrl(barcode, key, rev, "400");
  const urlFull =
    img.sizes?.full?.url ??
    buildSelectedImageUrl(barcode, key, rev, "full");

  return { url100, url400, urlFull };
}

export function extractBestImageUrls(
  rawProduct: ObfProduct,
  barcode?: string,
): ProductImageUrls {
  const bc = barcode ?? rawProduct.code ?? rawProduct._id ?? "";
  const images = (rawProduct.images ?? {}) as ObfProductImages;

  // ── Front image ──────────────────────────────────────────────────────────
  const frontDirect = rawProduct.image_front_url ?? rawProduct.image_url ?? null;

  let frontKey: string | undefined;
  if (images.front_fr) frontKey = "front_fr";
  else if (images.front_en) frontKey = "front_en";
  else frontKey = pickImageKey(images, ["front_"]);
  if (!frontKey) {
    frontKey = Object.keys(images).find((k) => /^\d+$/.test(k));
  }

  const frontUrls = frontKey
    ? extractSizedUrls(bc, images, frontKey)
    : { url100: null, url400: null, urlFull: null };

  const imageFrontUrl = frontDirect ?? frontUrls.urlFull;

  // ── Ingredients image ────────────────────────────────────────────────────
  const ingredientsDirect = rawProduct.image_ingredients_url ?? null;

  let ingredientsKey: string | undefined;
  if (images.ingredients_fr) ingredientsKey = "ingredients_fr";
  else if (images.ingredients_en) ingredientsKey = "ingredients_en";
  else ingredientsKey = pickImageKey(images, ["ingredients_"]);

  const ingredientsUrls = ingredientsKey
    ? extractSizedUrls(bc, images, ingredientsKey)
    : { url100: null, url400: null, urlFull: null };

  const imageIngredientsUrl = ingredientsDirect ?? ingredientsUrls.urlFull;

  return {
    imageUrl: rawProduct.image_url ?? imageFrontUrl,
    imageFrontUrl,
    imageIngredientsUrl,
    frontImageUrl100: frontUrls.url100,
    frontImageUrl400: frontUrls.url400,
    frontImageUrlFull: frontUrls.urlFull,
    ingredientsImageUrl100: ingredientsUrls.url100,
    ingredientsImageUrl400: ingredientsUrls.url400,
    ingredientsImageUrlFull: ingredientsUrls.urlFull,
  };
}
