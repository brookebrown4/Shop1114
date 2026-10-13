// Client-safe: no `db` import here. Client Components (the admin manager,
// the item form dialog) import from this file, never from
// `lib/reference-catalog.ts`, which pulls in the better-sqlite3 driver and
// would otherwise get bundled into the browser.
export const REFERENCE_CATALOGS = [
  {
    slug: "thread-colors",
    name: "Thread Colors",
    description:
      "From everyday solids to specialty finishes like metallic and neon — if you don't see a shade you need, ask and we'll match it.",
  },
  {
    slug: "fonts",
    name: "Font Options",
    description: "Pick a lettering style, or tell us what you have in mind.",
  },
  {
    slug: "monogram-styles",
    name: "Monogram Styles",
    description: "How your initials get arranged, not the typeface itself.",
  },
  {
    slug: "designs",
    name: "Designs Available",
    description: "Stock designs you can use as-is, or as a starting point.",
  },
] as const;

export type ReferenceCatalogSlug = (typeof REFERENCE_CATALOGS)[number]["slug"];

export function isReferenceCatalogSlug(value: string): value is ReferenceCatalogSlug {
  return REFERENCE_CATALOGS.some((catalog) => catalog.slug === value);
}
