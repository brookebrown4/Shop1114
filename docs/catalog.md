# Catalog

Product browsing: the homepage, `/shop`, category and collection pages, product
detail pages, and the `/catalog` overview. Everything here is public and reads
only — no auth required.

## Key files

**Pages**
- `app/page.tsx` — homepage: hero, "How custom orders work", featured products
- `app/shop/page.tsx` — full catalog with filters, search, sort, pagination, `CategorySidebar`
- `app/category/[slug]/page.tsx`, `app/collection/[slug]/page.tsx` — scoped listings, 404 on unknown slug, both also render `CategorySidebar` (same layout as `/shop`) so it's persistent across every listing page, not just `/shop`
- `app/product/[slug]/page.tsx` — detail page: gallery, variant selector, add-to-cart, related products
- `app/catalog/page.tsx` — one section per category, "View all" links (the `/shop1114.com/catalog`-style overview)

**Components**
- `components/product/product-card.tsx`, `product-grid.tsx`, `product-listing.tsx` — shared listing pieces used by shop/category/collection/catalog. `product-listing.tsx` exports `ProductListingSearchParams`, the shared search-params shape (`q`, `sort`, `page`, `sale`, `size`, `color`, `minPrice`, `maxPrice`) all three listing pages type their `searchParams` prop as.
- `components/product/filter-sort-bar.tsx` — search, sort, size, color, and min/max price ($, converted to cents server-side), plus a "Clear filters" button (shown only when a filter is active). Size/color options are fetched per-request via `getProductFilterOptions()` so the dropdowns only ever offer values that actually exist within the current category/collection scope. All of it round-trips through `searchParams` via `router.push`, same pattern as before. The Search and Min/Max `Input`s are keyed by their current URL-derived value (`key={...}`) so they properly reset when a filter changes elsewhere (e.g. "Clear filters") — base-ui's `Input` warns if an uncontrolled input's `defaultValue` changes without a key forcing a remount.
- `components/product/product-pagination.tsx` — preserves every existing query param (except `page`) when building page links, so it doesn't need to know about new filter params to keep working.
- `components/product/category-sidebar.tsx` — persistent left-nav across all three listing pages: "Shop all" / "On sale" / one link per category. Takes explicit `activeShopAll`/`activeSale`/`activeCategorySlug` props (each page passes only the one that applies) rather than inferring active state, since a collection page has none of the three active and shouldn't highlight "Shop all" by default.
- `components/product/product-gallery.tsx`, `variant-selector.tsx` — product detail page (variant selector disables add-to-cart when the selected size/color has 0 inventory)
- `components/product/hero-category-carousel.tsx` — auto-rotating category image on the homepage

**Data layer**
- `lib/products.ts` — `getFeaturedProducts`, `getProductBySlug` (filters `isPublished`), `listProducts({categorySlug?, collectionSlug?, q?, sale?, size?, color?, minPriceCents?, maxPriceCents?, sort?, page?, perPage?})`, `getProductFilterOptions({categorySlug?, collectionSlug?})` (distinct sizes/colors + price min/max scoped to the current listing, used to populate the filter dropdowns), `getRelatedProducts`, `getCatalogSections`. When both `size` and `color` are given, they're combined into one `variants: { some: { size, color } }` clause (not two separate `some` clauses) so a match requires a single variant with both, not any variant with the size and any (possibly different) variant with the color.
- `lib/categories.ts`, `lib/collections.ts` — list/get-by-slug helpers
- `lib/format.ts` — `formatPrice(cents)`, used everywhere a price renders

## Data model

`Category` → `Product` (many) · `Collection` ↔ `Product` via `ProductCollection` join · `Product` → `ProductImage[]`, `ProductVariant[]`. Sale pricing is just `compareAtCents` on `Product` being non-null; `ProductVariant` carries `size`/`color`/`colorHex`/`sku`/`inventory`.

## Known gaps

- `listProducts`'s `sale` filter only checks `compareAtCents` is non-null; `ProductCard`'s own "is this on sale" check additionally requires `compareAtCents > priceCents`. A misconfigured product (compareAt lower than price) would appear in `/shop?sale=true` without actually showing a Sale badge.
- Listing queries (`PRODUCT_INCLUDE`) always join the full `variants` relation even though card/grid rendering never reads it — fine at this data volume, worth trimming if the catalog grows.
- `generateMetadata` and the page component on product/category/collection detail pages each independently query the same row (not wrapped in React's `cache()`), so each page view does 2 DB round-trips instead of 1.
