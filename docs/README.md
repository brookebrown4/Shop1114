# SHOP1114 — Module Documentation

A local custom-embroidery storefront: Next.js 16 (App Router) + Prisma 7
(SQLite) + Auth.js v5 + Stripe Checkout + Resend. Each doc below covers one
feature area — what it does, the key files, the relevant data model, and any
known gaps worth knowing about before extending it.

- [Catalog](./catalog.md) — homepage, `/shop`, category/collection/product pages, `/catalog` overview
- [Cart](./cart.md) — client-only Zustand cart, persisted to localStorage
- [Auth](./auth.md) — Auth.js v5, Credentials provider, role-based route guards
- [Checkout & Orders](./checkout-and-orders.md) — Stripe Checkout Sessions, the fulfillment webhook, order lifecycle
- [Account](./account.md) — customer-facing order history
- [Admin](./admin.md) — internal CRUD for products/categories/collections/orders/reference-catalog/custom-requests
- [Custom Order](./custom-order.md) — the `/custom` configurator: logo upload, live preview, quote requests
- [Reference Catalog](./reference-catalog.md) — Thread Colors / Font Options / Monogram Styles / Designs Available
- [Email & Contact](./email-and-contact.md) — Resend-powered order emails and the `/contact` form

## Cross-cutting conventions

- **Data reads** are centralized in `lib/*.ts` query modules — pages never call `db.x.findMany` directly.
- **Server actions** live in an `actions.ts` colocated next to the page that uses them; every admin action calls `requireAdmin()` as its first line.
- **Prices are computed server-side only** — the client cart carries display info, but checkout always recomputes from the database.
- **Validation** lives in `lib/validations/*.ts` Zod schemas, shared by client forms (via `zodResolver` or direct `safeParse`) and the server action that's the real trust boundary.
- **Client/server module separation**: a few areas (reference catalog, custom-order preview) split a `*-constants.ts` file out specifically so Client Components never accidentally import something that pulls in `better-sqlite3`.

Seeded dev accounts (see `prisma/seed.ts`): `admin@shop1114.test` / `Admin123!` and `customer@shop1114.test` / `Customer123!`.
