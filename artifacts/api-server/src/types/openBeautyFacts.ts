export interface ObfImageSize {
  h?: number;
  w?: number;
  url?: string;
}

export interface ObfImage {
  sizes?: {
    "100"?: ObfImageSize;
    "400"?: ObfImageSize;
    full?: ObfImageSize;
  };
  rev?: string;
  imgid?: string;
  angle?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export interface ObfProductImages {
  front_fr?: ObfImage;
  front_en?: ObfImage;
  ingredients_fr?: ObfImage;
  ingredients_en?: ObfImage;
  [key: string]: ObfImage | undefined;
}

export interface ObfProduct {
  code?: string;
  _id?: string;
  product_name?: string;
  product_name_fr?: string;
  brands?: string;
  brands_tags?: string[];
  categories?: string;
  categories_tags?: string[];
  countries?: string;
  countries_tags?: string[];
  ingredients_text?: string;
  ingredients_text_fr?: string;
  ingredients_tags?: string[];
  allergens_tags?: string[];
  labels?: string;
  labels_tags?: string[];
  stores?: string;
  image_url?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  image_front_thumb_url?: string;
  image_ingredients_url?: string;
  images?: ObfProductImages;
  last_modified_t?: number;
  sources?: Array<{ id?: string; url?: string }>;
}

export interface ObfApiResponse {
  status: 0 | 1;
  status_verbose?: string;
  product?: ObfProduct;
}

export interface ObfSearchResponse {
  count?: number;
  page?: number;
  page_size?: number;
  products?: ObfProduct[];
}
