import Stripe from "stripe";

// The Stripe SDK throws synchronously in its constructor when the key is
// missing/empty, so this stays null instead of crashing at module load —
// callers must check for null and fail gracefully (see app/checkout/actions.ts).
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
    })
  : null;
