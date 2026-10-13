# Account

Customer-facing order history. Requires sign-in; every page here is
ownership-scoped so one customer can never see another's orders.

## Key files

- `app/account/page.tsx` — profile + most recent orders, gated by `requireUser()`
- `app/account/orders/page.tsx` — full order history for the signed-in user
- `app/account/orders/[id]/page.tsx` — single order detail; looks up via `getOrderById(id, {userId})` so requesting someone else's order id 404s rather than leaking it
- `lib/orders.ts` — `getOrdersForUser`, `getOrderById` (shared with admin, but the `userId` scoping option is what makes this page safe)

## Known gaps

- Guest-checkout orders never retroactively attach to an account created later with the same email — intentional, avoids an email-match account-takeover vector, but worth knowing if a customer asks "why don't my past guest orders show up now that I made an account."
- Order dates render via `order.createdAt.toLocaleDateString()` with no explicit locale/timeZone, so the calendar day shown is formatted using the server's local timezone rather than the customer's.
