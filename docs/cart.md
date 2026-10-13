# Cart

Client-only shopping cart — no server model, no auth required to use it.
Persisted to `localStorage` so it survives a page refresh, but it's never the
source of truth for price: checkout always re-fetches authoritative prices
from the database before anything is charged.

## Key files

- `lib/store/cart.ts` — the Zustand store itself: `items`, `addItem`, `removeItem`, `setQuantity`, `clear`, persisted under the `shop1114-cart` localStorage key. Also exports `useCartHydrated()` (a `useSyncExternalStore`-based hook, not `useEffect`+`setState`, to read hydration state safely) and `cartSubtotalCents(items)`.
- `lib/store/cart-ui.ts` — a **separate, non-persisted** store just for cart-drawer open/close state (persisting this would pop the drawer open on every fresh page load).
- `components/cart/cart-trigger.tsx` — header cart icon + item-count badge
- `components/cart/cart-sheet.tsx` — the slide-out drawer
- `components/cart/cart-line-list.tsx` — shared row rendering, used by both the drawer and the full `/cart` page
- `components/product/add-to-cart-button.tsx` — wired into the variant selector; toasts on add and opens the drawer
- `app/cart/page.tsx` — full-page cart view, reuses `cart-line-list`

## How it works

Each cart line stores `variantId`, `quantity`, and enough display info (`productName`, `size`, `color`, `unitPriceCentsDisplay`) to render without a network call. Adding/removing/adjusting quantity all happen client-side against the Zustand store; nothing touches the database until checkout.

## Known gaps

- Cart quantity has no upper bound in the UI (only clamped at `<= 0`), while the server's `checkoutInputSchema` (see [checkout-and-orders.md](./checkout-and-orders.md)) caps quantity at 20 per line. Pushing past that via the "+" stepper produces a generic Zod validation error at checkout instead of the UI ever preventing it.
- Because `unitPriceCentsDisplay` is cached at add-to-cart time, it can go stale if a product's price changes before checkout — the checkout page still shows the old price even though the server will charge the current one. See the checkout doc's known-gaps section.
