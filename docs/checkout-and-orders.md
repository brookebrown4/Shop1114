# Checkout & Orders

Guest-friendly checkout via Stripe hosted Checkout Sessions, fulfilled
asynchronously by a Stripe webhook. Prices are **always** recomputed
server-side from the database — the cart's cached display price is never
trusted.

## Key files

- `app/checkout/page.tsx` + `components/checkout/checkout-form.tsx` — client shipping-address form (react-hook-form + Zod); redirects to `/cart` if the cart is empty; hands off to Stripe with a full `window.location.href` navigation once a session URL comes back
- `app/checkout/actions.ts` — `createCheckoutSession(input)`: validates input, re-fetches each variant, rejects unpublished products or insufficient stock, computes subtotal/shipping/tax, creates a `pending` `Order` + snapshotted `OrderItem`s, creates the Stripe Checkout Session (`metadata.orderId` is the webhook join key), saves `stripeSessionId` back onto the order
- `app/api/webhooks/stripe/route.ts` — verifies the Stripe signature, and on `checkout.session.completed`: flips the order to `"paid"`, decrements each line item's inventory, and calls `sendOrderEmails()` (see [email-and-contact.md](./email-and-contact.md)) — all inside one guard checking `order.status !== "paid"` so Stripe's redelivered webhooks can't double-fulfill
- `app/checkout/success/page.tsx` — reads `session_id`, looks up the order by `stripeSessionId`, polls (`<meta http-equiv="refresh">`) until the webhook has flipped it to `"paid"`
- `app/checkout/cancel/page.tsx` — cart is left untouched
- `components/checkout/clear-cart-on-success.tsx` — clears the cart client-side, but only once the order is confirmed `"paid"`
- `lib/stripe.ts` — the Stripe SDK client, constructed conditionally (`stripe = key ? new Stripe(key) : null`) since the SDK throws synchronously if the key is empty; every call site null-checks it and fails gracefully
- `lib/pricing.ts` — `resolveVariantPriceCents` (variant override or product base price), `computeShippingCents` (free over `FREE_SHIPPING_THRESHOLD_CENTS`, else `STANDARD_SHIPPING_CENTS`), `computeTaxCents` (**placeholder, always returns 0** — not a real tax engine)
- `lib/orders.ts` — `getOrdersForUser`, `getOrderById(id, {userId?})` (ownership-scoped), `getAllOrders` (admin, paginated), `getOrderWithItems`, `getOrderByStripeSessionId`

## Data model

`Order` (`status`: `pending → paid → fulfilled`/`cancelled`, `stripeSessionId` unique, `shippingAddress` stored as a JSON string snapshot — not an FK) → `OrderItem[]` (snapshots `productName`/`variantLabel`/`unitPriceCents` so a later catalog edit never changes order history). `Address` model exists in the schema but is unused — checkout takes a one-time shipping form instead of a saved address book.

## Environment variables

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (test-mode only — see `.env.example`). Locally, webhooks only reach the app while `stripe listen --forward-to localhost:3002/api/webhooks/stripe` is running; in production this is a real webhook endpoint registered in the Stripe Dashboard instead.

## Known gaps

- **Inventory oversell**: the webhook's inventory decrement is unconditional with no floor check or re-validation. Two concurrent orders on a low-stock variant can both get charged before either decrements, driving inventory negative.
- The webhook doesn't check `checkoutSession.payment_status` before fulfilling, and there's no `async_payment_failed` handler — irrelevant today (only card payments are in play) but would matter if a delayed payment method (ACH, SEPA Debit) were ever enabled.
- The stock check in `createCheckoutSession` compares each line item independently without aggregating duplicate `variantId`s in one request, so a request with the same variant listed twice can buy more units than exist.
- Creating the `Order`, creating the Stripe session, and persisting `stripeSessionId` back onto the order are three non-atomic steps — if that last write fails after Stripe already created the session, a charged customer lands on a 404 instead of the confirmation page.
- `computeTaxCents()` returning a hardcoded 0 flows unconditionally into the order total and the confirmation email as a real "Tax: $0.00" line, with nothing gating that once real charges go live.
- Checkout's displayed subtotal comes from the cart's cached price, not a live re-check — see [cart.md](./cart.md).
