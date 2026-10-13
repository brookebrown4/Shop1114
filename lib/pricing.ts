import type { Product, ProductVariant } from "@/lib/generated/prisma/client";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
} from "@/lib/constants";

export function resolveVariantPriceCents(
  variant: Pick<ProductVariant, "priceCents">,
  product: Pick<Product, "priceCents">,
): number {
  return variant.priceCents ?? product.priceCents;
}

export function computeShippingCents(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : STANDARD_SHIPPING_CENTS;
}

// No real tax engine wired up yet — this is a placeholder, not a compliance
// solution. Flag before any real money moves through checkout.
export function computeTaxCents(): number {
  return 0;
}
