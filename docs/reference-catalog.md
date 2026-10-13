# Reference Catalog

The browsable library of Thread Colors, Font Options, Monogram Styles, and
Designs Available that customers pick from on `/custom` and browse directly
on `/reference`. Admin-manageable, one shared data shape across all four
catalog types rather than four near-identical models.

## Key files

- `app/reference/page.tsx` — public gallery, grouped by catalog with an empty-state ("Not uploaded yet") per section
- `app/admin/reference-catalog/{page,actions}.tsx` — admin CRUD
- `components/admin/reference-catalog-manager.tsx` — tabbed admin UI (one tab per catalog), `reference-item-form-dialog.tsx` — the add/edit dialog
- `components/reference/reference-item-card.tsx` — public gallery card (image/swatch/name/description)
- `components/reference/reference-item-preview.tsx` — the actual preview renderer, shared by both the public card and the admin manager so they never show different things for the same item. For **fonts** and **monogram styles** — neither of which has a real uploaded asset — this renders a *live* sample instead of a blank box: an "Aa" glyph in the font's approximated `font-family` for fonts, and sample initials ("J D M") arranged per style name (single/stacked/diamond/circle) for monogram styles.
- `lib/reference-catalog.ts` — server-only (`db`-importing): `listReferenceCatalogItems`, `getReferenceCatalogSections`, `getReferenceCatalogItem`
- `lib/reference-catalog-constants.ts` — **client-safe**, no `db` import: `REFERENCE_CATALOGS` (slug/name/description per catalog type), `isReferenceCatalogSlug()`. Client Components (the admin manager, the item form dialog) import from here, never from `lib/reference-catalog.ts` — importing anything from a `db`-touching module into a Client Component bundles `better-sqlite3` into the browser and crashes.
- `lib/validations/reference-catalog.ts` — Zod schema

## Data model

`ReferenceCatalogItem` — `catalog` (`"thread-colors" | "fonts" | "monogram-styles" | "designs"`), `name`, optional `description`/`swatchHex`/`imageUrl`, `position` (manual ordering), unique on `(catalog, name)`.

## Known gaps

- `createReferenceItem`/`updateReferenceItem` don't pre-check the `(catalog, name)` uniqueness the schema enforces, unlike every sibling admin action — a duplicate name (e.g. two "Navy" thread colors) crashes with an unhandled Prisma error instead of a friendly one. See [admin.md](./admin.md).
