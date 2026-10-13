# Custom Order

The `/custom` page: pick a base product, customize it (upload a logo, type
text with a font/monogram style, or pick a stock design), see a live preview
overlaid on a real product photo, and submit a request. This is a **quote
request, not a checkout** — no price is charged here; a human reviews it and
follows up. See [checkout-and-orders.md](./checkout-and-orders.md) for the
separate, instant-purchase flow.

## Key files

- `app/custom/page.tsx` — fetches products + reference-catalog sections, renders the "How custom orders work" steps (shared with the homepage via `lib/site-content.ts`) and an FAQ accordion (plain `<details>/<summary>`, no component dependency)
- `app/custom/actions.ts` — `uploadCustomOrderLogo(formData)` (saves the file, returns its URL) and `submitCustomOrderRequest(input)` (validates + writes a `CustomOrderRequest` row)
- `components/custom/custom-order-configurator.tsx` — the whole interactive piece: product picker, live preview, size/color/placement/thread-color pickers, the three customization modes (text / design / logo), and the contact form
- `lib/custom-order-preview.ts` — client-safe preview helpers: `PLACEMENTS`, `fontFamilyFor()` (maps a Font Option's name to a close web-safe approximation, since no real font files are uploaded yet), `placementPoint(placement, imageUrl)` (**per-photo calibrated** coordinates — see below), `isLightColor()`
- `lib/uploads.ts` — `saveCustomOrderLogo(file)`: validates type (PNG/JPG/WEBP/SVG) and size (5MB max), writes to `public/uploads/custom-logos/` with a random filename, returns the public URL
- `lib/validations/custom-order.ts` — Zod schema; `mode` is `"text" | "design" | "logo"`, with a `.refine()` per mode requiring the field that mode actually needs
- `lib/custom-orders.ts` — admin read helpers (`getAllCustomOrderRequests`, `getCustomOrderRequest`)

## Why placement is per-photo, not one generic zone

Early versions used one set of "left chest / center front / center back" CSS
zones shared by every product photo. That broke as soon as different photos
were checked in the browser — a hanging shirt, a worn hoodie, a cluttered
jacket shot, and a tote bag with straps crossing the front all frame the
garment completely differently. `placementPoint()` in
`lib/custom-order-preview.ts` instead keys a `{top, left}` percentage point
off the photo's Unsplash id (with a sane default profile for any photo not
explicitly calibrated), each hand-verified by rendering it and confirming the
overlay actually lands on fabric.

## Data model

`CustomOrderRequest` — every selection is snapshotted as a plain string (not
an FK to the reference catalog), so a later catalog edit never changes a past
request. `logoUrl` points at an uploaded file; `basePriceCents` snapshots the
base product's price at submission time for the admin's reference.

## Known gaps

- Logo uploads save to the local filesystem (`public/uploads/custom-logos/`), which is fine for this single-instance dev setup but won't survive a multi-server production deployment — swap for real object storage (S3, Vercel Blob, etc.) before scaling past one instance.
- The 4-step "how it works" copy promises a design proof by email before anything is stitched — that promise isn't backed by an actual proof-generation feature yet, it's a process description for the admin to follow manually.
