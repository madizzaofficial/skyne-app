export interface Ingredient {
  id: string;
  inci: string;
  commonName: string;
  function: string;
  safetyLevel: "safe" | "caution" | "avoid";
  isAllergen: boolean;
  isComedogenic: boolean;
  isFungalAcneSafe: boolean;
  benefits: string[];
  concerns: string[];
  concernIcons?: string[];
  description: string;
}

export interface ProductProperties {
  alcoholFree: boolean;
  fragranceFree: boolean;
  oilFree: boolean;
  siliconeFree: boolean;
  parabenFree: boolean;
  sulfateFree: boolean;
  euAllergenFree: boolean;
  fungalAcneSafe: boolean;
  vegan: boolean;
  crueltyFree: boolean;
  nonComedogenic: boolean;
}

export interface ReviewComment {
  id: string;
  pseudo: string;
  text: string;
  date: string;
}

export interface Review {
  id: string;
  pseudo: string;
  skinType: string;
  date: string;
  content: string;
  rating: number;
  likes: number;
  tags: string[];
  comments: ReviewComment[];
}

export interface RetailerInfo {
  name: string;
  price?: string;
  emoji: string;
  color: string;
  searchUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  image: string;
  barcode?: string;
  ingredients: Ingredient[];
  communityScore: number;
  reviewCount: number;
  properties: ProductProperties;
  reviews: Review[];
  price?: string;
  incompatibilities: string[];
  whereToBuy: RetailerInfo[];
}

const sampleIngredients: Ingredient[] = [
  {
    id: "water",
    inci: "Aqua",
    commonName: "Eau",
    function: "Solvant",
    safetyLevel: "safe",
    isAllergen: false,
    isComedogenic: false,
    isFungalAcneSafe: true,
    benefits: ["Hydratation", "Solvant universel"],
    concerns: [],
    concernIcons: [],
    description: "Base de la plupart des formules cosmétiques. Totalement sûre et hydratante.",
  },
  {
    id: "glycerin",
    inci: "Glycerin",
    commonName: "Glycérine",
    function: "Humectant",
    safetyLevel: "safe",
    isAllergen: false,
    isComedogenic: false,
    isFungalAcneSafe: false,
    benefits: ["Hydratation intense", "Renforcement de la barrière cutanée"],
    concerns: [],
    concernIcons: [],
    description: "Humectant puissant qui attire l'eau dans la peau. Excellent pour l'hydratation.",
  },
  {
    id: "niacinamide",
    inci: "Niacinamide",
    commonName: "Vitamine B3",
    function: "Actif multi-fonction",
    safetyLevel: "safe",
    isAllergen: false,
    isComedogenic: false,
    isFungalAcneSafe: true,
    benefits: ["Réduit les pores", "Contrôle le sébum", "Uniformise le teint", "Anti-acné"],
    concerns: [],
    concernIcons: [],
    description: "Vitamine B3 aux multiples bénéfices. Idéale pour les peaux grasses et acnéiques.",
  },
  {
    id: "salicylicacid",
    inci: "Salicylic Acid",
    commonName: "Acide salicylique (BHA)",
    function: "Exfoliant chimique",
    safetyLevel: "caution",
    isAllergen: false,
    isComedogenic: false,
    isFungalAcneSafe: true,
    benefits: ["Exfolie les pores", "Anti-acné", "Réduit les points noirs"],
    concerns: ["Peut être irritant en concentration élevée", "Photosensibilisant — SPF obligatoire"],
    concernIcons: ["⚡", "☀️"],
    description: "Acide bêta-hydroxy (BHA) qui pénètre dans les pores et les désobstrue en profondeur.",
  },
  {
    id: "retinol",
    inci: "Retinol",
    commonName: "Rétinol (Vitamine A)",
    function: "Anti-âge, renouvellement cellulaire",
    safetyLevel: "caution",
    isAllergen: false,
    isComedogenic: false,
    isFungalAcneSafe: false,
    benefits: ["Anti-âge", "Lisse la peau", "Réduit les cicatrices d'acné"],
    concerns: ["Irritant en début d'utilisation", "Ne pas associer avec AHA/BHA le même soir", "SPF obligatoire le matin"],
    concernIcons: ["⚡", "🚫", "☀️"],
    description: "Dérivé de la vitamine A reconnu pour ses effets anti-âge et régénérants.",
  },
  {
    id: "fragrance",
    inci: "Parfum",
    commonName: "Parfum",
    function: "Masquant",
    safetyLevel: "avoid",
    isAllergen: true,
    isComedogenic: false,
    isFungalAcneSafe: false,
    benefits: [],
    concerns: ["Allergène potentiel", "Peut irriter les peaux sensibles", "Réaction cutanée possible"],
    concernIcons: ["⚠️", "🌶️", "💥"],
    description: "Mélange de substances aromatiques. Allergène fréquent pour les peaux sensibles.",
  },
  {
    id: "sls",
    inci: "Sodium Lauryl Sulfate",
    commonName: "SLS (tensioactif fort)",
    function: "Détergent, émulsifiant",
    safetyLevel: "avoid",
    isAllergen: false,
    isComedogenic: false,
    isFungalAcneSafe: true,
    benefits: ["Nettoyant puissant", "Mousse abondante"],
    concerns: ["Peut altérer la barrière cutanée", "Irritant pour peaux sensibles", "Assèche la peau"],
    concernIcons: ["🛡️", "🌶️", "🌵"],
    description: "Tensioactif fort qui nettoie efficacement mais peut être agressif pour la peau.",
  },
  {
    id: "zinc",
    inci: "Zinc PCA",
    commonName: "Zinc PCA",
    function: "Régulateur de sébum",
    safetyLevel: "safe",
    isAllergen: false,
    isComedogenic: false,
    isFungalAcneSafe: true,
    benefits: ["Contrôle le sébum", "Anti-bactérien", "Réduit l'acné"],
    concerns: [],
    concernIcons: [],
    description: "Combinaison de zinc et d'acide pyrrolidone carboxylique. Excellent pour les peaux grasses.",
  },
  {
    id: "hyaluronic",
    inci: "Sodium Hyaluronate",
    commonName: "Acide hyaluronique",
    function: "Humectant, repulpant",
    safetyLevel: "safe",
    isAllergen: false,
    isComedogenic: false,
    isFungalAcneSafe: true,
    benefits: ["Hydratation intense", "Repulpe la peau", "Lisse les ridules"],
    concerns: [],
    concernIcons: [],
    description: "Molécule capable de retenir jusqu'à 1000x son poids en eau. Idéal pour tous types de peau.",
  },
  {
    id: "caprylyl",
    inci: "Caprylyl Glycol",
    commonName: "Caprylyl Glycol",
    function: "Conservateur, émollient",
    safetyLevel: "caution",
    isAllergen: false,
    isComedogenic: false,
    isFungalAcneSafe: false,
    benefits: ["Conservateur doux"],
    concerns: ["Peut aggraver certaines dermatites"],
    concernIcons: ["🌶️"],
    description: "Conservateur doux et émollient d'origine naturelle.",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Oil Control Face Wash",
    brand: "Clinique For Men",
    category: "Visage",
    subcategory: "Nettoyant",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    barcode: "3614228935951",
    ingredients: [
      sampleIngredients[0],
      sampleIngredients[1],
      sampleIngredients[2],
      sampleIngredients[7],
      sampleIngredients[5],
    ],
    communityScore: 4.2,
    reviewCount: 847,
    properties: {
      alcoholFree: true,
      fragranceFree: false,
      oilFree: true,
      siliconeFree: true,
      parabenFree: true,
      sulfateFree: false,
      euAllergenFree: false,
      fungalAcneSafe: false,
      vegan: false,
      crueltyFree: false,
      nonComedogenic: true,
    },
    reviews: [
      {
        id: "r1",
        pseudo: "Thomas_B",
        skinType: "Grasse",
        date: "Il y a 2 jours",
        content: "Excellent nettoyant pour peau grasse. La mousse est bien nettoyante sans dessécher. Je l'utilise matin et soir.",
        rating: 5,
        likes: 24,
        tags: ["peau grasse", "efficace", "bon rapport qualité-prix"],
        comments: [
          { id: "c1", pseudo: "MaxR", text: "Tu l'utilises en quelle quantité ? Une noisette suffit ?", date: "Il y a 1 jour" },
          { id: "c2", pseudo: "Thomas_B", text: "Oui une noisette c'est largement suffisant !", date: "Il y a 1 jour" },
        ],
      },
      {
        id: "r2",
        pseudo: "MaxR",
        skinType: "Mixte",
        date: "Il y a 1 semaine",
        content: "Bien mais le parfum m'a légèrement irrité au bout de quelques semaines. Sinon ça nettoie bien.",
        rating: 3,
        likes: 12,
        tags: ["irritation", "peau mixte"],
        comments: [
          { id: "c3", pseudo: "Alex_K", text: "Pareil pour moi, j'ai switché sur Bulldog à cause de ça.", date: "Il y a 5 jours" },
        ],
      },
    ],
    price: "18,50€",
    incompatibilities: ["Ne pas associer avec un exfoliant acide fort le même soir"],
    whereToBuy: [
      { name: "Sephora", price: "18,50€", emoji: "💄", color: "#000000" },
      { name: "Amazon", price: "16,99€", emoji: "📦", color: "#FF9900" },
      { name: "Nocibé", price: "19,90€", emoji: "🌸", color: "#E91E8C" },
      { name: "Douglas", price: "21,00€", emoji: "🌿", color: "#006B3C" },
    ],
  },
  {
    id: "2",
    name: "Original Face Wash",
    brand: "Bulldog",
    category: "Visage",
    subcategory: "Nettoyant",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80",
    barcode: "5060098014326",
    ingredients: [
      sampleIngredients[0],
      sampleIngredients[1],
      sampleIngredients[8],
      sampleIngredients[2],
      sampleIngredients[3],
    ],
    communityScore: 4.5,
    reviewCount: 1243,
    properties: {
      alcoholFree: true,
      fragranceFree: true,
      oilFree: true,
      siliconeFree: true,
      parabenFree: true,
      sulfateFree: true,
      euAllergenFree: true,
      fungalAcneSafe: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    reviews: [
      {
        id: "r3",
        pseudo: "Alex_K",
        skinType: "Sensible",
        date: "Il y a 3 jours",
        content: "Le meilleur nettoyant pour peau sensible. Sans parfum, sans paraben. Ma peau adore.",
        rating: 5,
        likes: 56,
        tags: ["peau sensible", "sans parfum", "naturel"],
        comments: [
          { id: "c4", pseudo: "Nico_V", text: "Tu l'achètes où ? J'ai du mal à le trouver en magasin.", date: "Il y a 2 jours" },
          { id: "c5", pseudo: "Alex_K", text: "Je commande direct sur Amazon, livré en 24h.", date: "Il y a 2 jours" },
          { id: "c6", pseudo: "Marc_D", text: "Disponible aussi chez Monoprix maintenant !", date: "Il y a 1 jour" },
        ],
      },
    ],
    price: "8,99€",
    incompatibilities: [],
    whereToBuy: [
      { name: "Amazon", price: "8,99€", emoji: "📦", color: "#FF9900" },
      { name: "Monoprix", price: "9,50€", emoji: "🏪", color: "#E30613" },
      { name: "iHerb", price: "7,80€", emoji: "🌿", color: "#5B9BD5" },
    ],
  },
  {
    id: "3",
    name: "2% BHA Liquid Exfoliant",
    brand: "Paula's Choice",
    category: "Visage",
    subcategory: "Exfoliant",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
    barcode: "5060098014444",
    ingredients: [
      sampleIngredients[0],
      sampleIngredients[3],
      sampleIngredients[1],
      sampleIngredients[2],
      sampleIngredients[9],
    ],
    communityScore: 4.7,
    reviewCount: 3891,
    properties: {
      alcoholFree: true,
      fragranceFree: true,
      oilFree: true,
      siliconeFree: true,
      parabenFree: true,
      sulfateFree: true,
      euAllergenFree: true,
      fungalAcneSafe: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    reviews: [
      {
        id: "r4",
        pseudo: "JB_Skin",
        skinType: "Grasse",
        date: "Il y a 5 jours",
        content: "Produit culte à juste titre. Désobstrue les pores en 2-3 semaines. Attention à bien mettre du SPF le matin.",
        rating: 5,
        likes: 102,
        tags: ["pores dilatés", "acné", "efficace"],
        comments: [
          { id: "c7", pseudo: "Thomas_B", text: "Combien de fois par semaine tu l'utilises ?", date: "Il y a 4 jours" },
          { id: "c8", pseudo: "JB_Skin", text: "3x par semaine le soir, c'est largement suffisant pour commencer.", date: "Il y a 4 jours" },
        ],
      },
    ],
    price: "32,00€",
    incompatibilities: [
      "Ne pas associer avec du rétinol le même soir",
      "Ne pas utiliser avec AHA en même temps",
      "SPF obligatoire le matin",
    ],
    whereToBuy: [
      { name: "Paula's Choice", price: "32,00€", emoji: "🏷️", color: "#C41E3A" },
      { name: "Amazon", price: "29,90€", emoji: "📦", color: "#FF9900" },
      { name: "Lookfantastic", price: "31,50€", emoji: "✨", color: "#000000" },
    ],
  },
  {
    id: "4",
    name: "Hydro Boost Water Gel",
    brand: "Neutrogena Men",
    category: "Visage",
    subcategory: "Crème hydratante",
    image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=800&q=80",
    ingredients: [
      sampleIngredients[0],
      sampleIngredients[8],
      sampleIngredients[1],
      sampleIngredients[2],
      sampleIngredients[7],
    ],
    communityScore: 4.3,
    reviewCount: 2156,
    properties: {
      alcoholFree: true,
      fragranceFree: false,
      oilFree: true,
      siliconeFree: false,
      parabenFree: true,
      sulfateFree: true,
      euAllergenFree: false,
      fungalAcneSafe: false,
      vegan: false,
      crueltyFree: false,
      nonComedogenic: true,
    },
    reviews: [
      {
        id: "r5",
        pseudo: "Marc_D",
        skinType: "Mixte",
        date: "Il y a 1 semaine",
        content: "Texture gel ultra légère, parfaite pour l'été. S'absorbe en 30 secondes, pas de film gras.",
        rating: 4,
        likes: 78,
        tags: ["texture légère", "hydratation", "été"],
        comments: [
          { id: "c9", pseudo: "Nico_V", text: "Pareil, super pour les peaux mixtes ! Tu l'utilises le matin ou soir ?", date: "Il y a 6 jours" },
          { id: "c10", pseudo: "Marc_D", text: "Matin obligatoirement, c'est parfait sous le SPF.", date: "Il y a 6 jours" },
        ],
      },
    ],
    price: "14,90€",
    incompatibilities: [],
    whereToBuy: [
      { name: "Pharmacie", price: "14,90€", emoji: "💊", color: "#2196F3" },
      { name: "Amazon", price: "13,50€", emoji: "📦", color: "#FF9900" },
      { name: "Carrefour", price: "15,20€", emoji: "🛒", color: "#0070C0" },
    ],
  },
  {
    id: "5",
    name: "Retinol Serum 0.5%",
    brand: "The Ordinary",
    category: "Visage",
    subcategory: "Sérum",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
    ingredients: [
      sampleIngredients[0],
      sampleIngredients[4],
      sampleIngredients[1],
      sampleIngredients[9],
    ],
    communityScore: 4.0,
    reviewCount: 5234,
    properties: {
      alcoholFree: true,
      fragranceFree: true,
      oilFree: true,
      siliconeFree: true,
      parabenFree: true,
      sulfateFree: true,
      euAllergenFree: true,
      fungalAcneSafe: false,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: false,
    },
    reviews: [
      {
        id: "r6",
        pseudo: "Nico_V",
        skinType: "Normale",
        date: "Il y a 2 semaines",
        content: "Commencer doucement — 2x par semaine. Au bout d'un mois les cicatrices d'acné s'estompent vraiment.",
        rating: 4,
        likes: 145,
        tags: ["cicatrices", "anti-âge", "efficace"],
        comments: [
          { id: "c11", pseudo: "JB_Skin", text: "Est-ce que tu as eu des irritations au début ?", date: "Il y a 10 jours" },
          { id: "c12", pseudo: "Nico_V", text: "Oui les 2 premières semaines, un peu de rougeurs. Après ça disparaît.", date: "Il y a 10 jours" },
          { id: "c13", pseudo: "Thomas_B", text: "Bien penser au SPF le matin sinon c'est contre-productif !", date: "Il y a 8 jours" },
        ],
      },
    ],
    price: "6,50€",
    incompatibilities: [
      "Ne pas associer avec AHA/BHA le même soir",
      "Ne pas associer avec Benzoyle de peroxyde",
      "SPF obligatoire le matin",
    ],
    whereToBuy: [
      { name: "The Ordinary", price: "6,50€", emoji: "🧪", color: "#1A1A1A" },
      { name: "ASOS", price: "6,50€", emoji: "🛍️", color: "#000000" },
      { name: "Amazon", price: "7,20€", emoji: "📦", color: "#FF9900" },
      { name: "Lookfantastic", price: "6,90€", emoji: "✨", color: "#000000" },
    ],
  },
];

export const CATEGORIES = [
  { id: "visage", name: "Visage", icon: "user" },
  { id: "corps", name: "Corps", icon: "activity" },
  { id: "cheveux", name: "Cheveux", icon: "scissors" },
  { id: "solaire", name: "Solaire", icon: "sun" },
  { id: "deodorant", name: "Déodorant", icon: "wind" },
];

export const SUBCATEGORIES: Record<string, string[]> = {
  visage: ["Nettoyant", "Sérum", "Crème hydratante", "Exfoliant", "Contour des yeux"],
  corps: ["Crème corps", "Gommage", "Huile"],
  cheveux: ["Shampoing", "Après-shampoing", "Masque"],
  solaire: ["SPF visage", "SPF corps"],
  deodorant: ["Déodorant", "Anti-transpirant"],
};
