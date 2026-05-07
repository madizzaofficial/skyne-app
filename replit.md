# Skyne — SkinScan

A React Native / Expo mobile app that helps users analyse cosmetic product ingredients for safety, allergens, and skin compatibility.

## Run & Operate

- `pnpm --filter @workspace/skinscan run dev` — run the Expo mobile app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: React Native + Expo (Expo Router, file-based routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Animations: react-native-reanimated ~4.1.1
- Auth/User data: Firebase

## Where things live

- `artifacts/skinscan/` — Expo mobile app
- `artifacts/skinscan/app/` — Expo Router screens
- `artifacts/skinscan/app/(tabs)/` — Tab screens (home, catalogue, scanner, favoris, profile, routine)
- `artifacts/skinscan/app/import-product.tsx` — Share intent / URL import & analysis screen
- `artifacts/skinscan/types/product.ts` — Canonical product TypeScript types (Product, ProductAnalysisResult, etc.)
- `artifacts/skinscan/services/products/` — Product data service layer (repository pattern)
- `artifacts/skinscan/services/import/` — Share intent / URL import service
- `artifacts/skinscan/components/animations/` — Reusable animation components
- `artifacts/skinscan/components/product/ManualIngredientsInput.tsx` — Manual INCI ingredient analyser
- `artifacts/skinscan/constants/mockData.ts` — Legacy types and mock product data
- `artifacts/skinscan/services/firestoreProducts.ts` — Firebase product CRUD (legacy, kept for user data)
- `artifacts/api-server/` — Express API server

## Architecture decisions

- **Repository pattern for products**: The frontend never calls Firebase directly for products. All product access goes through `IProductRepository`. Currently backed by `MockProductRepository`; swap to a Supabase/Postgres/Meilisearch repository later without touching the UI.
- **Firebase stays for user data only**: Auth, scan history, saved products, routines, preferences — all stay on Firebase. The product catalogue itself is abstracted away.
- **Product page scraping is server-side only**: The `sharedProductImportService` exposes `analyzeProductFromUrl()` as a stub that must be wired to a backend endpoint. Never scrape from the mobile app (CORS, anti-bot, performance).
- **Deep links use `skinscan://` scheme**: `skinscan://import-product?url=...` opens the import/analysis screen. The Expo Router handles this automatically.
- **Animations use react-native-reanimated**: All catalogue transitions and press feedback use Reanimated v4 for 60fps performance on the UI thread.

## Product

- Barcode scanning for cosmetic products
- INCI ingredient list analysis (safety, allergens, skin compatibility)
- Product catalogue with multi-level category navigation
- Saved products / favourites
- Skincare routine management
- Share-to-Skyne flow: share a URL from any retailer → Skyne opens and analyses the product
- Manual ingredient paste for direct INCI analysis

## User preferences

- French-language UI throughout
- Premium, calm aesthetic — no cartoonish effects
- Keep Firebase for user data, not for product catalogue
- No medical claims in ingredient analysis

## Gotchas

- Run `pnpm --filter @workspace/skinscan install` before `typecheck` if packages are missing
- `ProductPreviewModal.tsx` has 10 pre-existing type errors from the original repo (property mismatches on legacy Ingredient type) — do not break other screens trying to fix it
- The `warningDim` / `successDim` / `dangerDim` colours exist in `constants/colors.ts` and are always available via `useColors()`
- Deep link test commands:
  ```
  npx uri-scheme open "skinscan://import-product?url=https%3A%2F%2Fwww.sephora.fr%2Fp%2Fexample" --ios
  npx uri-scheme open "skinscan://import-product?url=https%3A%2F%2Fwww.sephora.fr%2Fp%2Fexample" --android
  ```

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo-specific patterns
