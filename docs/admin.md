# Admin

Internal-tool CRUD for products, categories, collections, orders, the
reference catalog, and custom-order requests. Everything under `/admin` is
gated by `requireAdmin()` (see [auth.md](./auth.md)) both at the layout level
and again inside every individual server action.

## Key files

- `app/admin/layout.tsx`, `components/admin/admin-nav.tsx` — the internal-tool shell (no storefront header/footer), `requireAdmin()`-gated
- `app/admin/page.tsx` — redirects to `/admin/products`

**Products** — `app/admin/products/{page,new/page,[id]/page,actions}.tsx`, `components/admin/product-form.tsx` (react-hook-form `useFieldArray` for `images[]`/`variants[]`, one transactional submit), `components/admin/delete-product-button.tsx`

**Categories / Collections** — same list/new/edit/delete pattern in `app/admin/categories/**` and `app/admin/collections/**`, `components/admin/category-form.tsx`, `collection-form.tsx`, `components/admin/confirm-delete-button.tsx` (generic — collections/categories reuse this; products has its own copy, see gaps below)

**Orders** — `app/admin/orders/{page,[id]/page,actions}.tsx`, `components/admin/mark-fulfilled-button.tsx` — `markOrderFulfilled` only allows `paid → fulfilled`

**Reference Catalog** — `app/admin/reference-catalog/{page,actions}.tsx`, `components/admin/reference-catalog-manager.tsx` (tabbed CRUD), `reference-item-form-dialog.tsx` — see [reference-catalog.md](./reference-catalog.md) for the full picture, shared with the public gallery

**Custom Requests** — `app/admin/custom-requests/{page,[id]/page,actions}.tsx`, `components/admin/custom-request-status-actions.tsx` — see [custom-order.md](./custom-order.md)

**Validation** — `lib/validations/{product,category,collection}.ts`; each validates image URLs against `ALLOWED_IMAGE_HOSTS` (`lib/constants.ts`, kept in sync with `next.config.ts`'s `images.remotePatterns`)

## Data model

No dedicated admin tables — this is a UI layer over the same `Product`/`Category`/`Collection`/`Order`/`ReferenceCatalogItem`/`CustomOrderRequest` models the storefront reads. `deleteProduct`/category/collection all check for dependent rows (order history, assigned products) before allowing delete, since none of those relations cascade.

## Known gaps

- `updateProduct` upserts each variant by `sku` alone (`where: { sku }`), not scoped to the product being edited — entering a SKU that belongs to a different product's variant silently reassigns it away from that product.
- `createProduct` pre-checks slug uniqueness but not SKU uniqueness, so a duplicate SKU crashes with an unhandled Prisma error instead of a friendly one.
- `updateProduct`'s cleanup step deletes any variant whose SKU was removed from the form without checking `OrderItem` history first (unlike `deleteProduct`, which does) — removing a variant that already has order history throws an unhandled FK-constraint error.
- `createReferenceItem`/`updateReferenceItem` don't pre-check the `(catalog, name)` uniqueness the schema enforces — unlike every sibling admin action, a duplicate name crashes instead of showing a friendly error.
- `updateCustomOrderStatus` validates its `status` argument against a hardcoded local array instead of a Zod schema, breaking the pattern every other admin action follows.
- The admin orders list supports pagination in `lib/orders.ts` (`getAllOrders({page, perPage})`) but the page never wires up page controls or checks `total` — orders past the first page are effectively invisible.
- `DeleteProductButton` duplicates the same confirm/delete/toast/redirect flow `ConfirmDeleteButton` already generalizes (categories/collections use the shared one).
- The categories/collections/products create-and-update actions each repeat the same `requireAdmin → parse → slug-uniqueness-check → write` skeleton by hand across 3 files — a bugfix to one (e.g. the uniqueness check, which reference-catalog's actions dropped entirely) doesn't automatically propagate to the others.
