"use server";

import { headers } from "next/headers";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { checkoutInputSchema, type CheckoutInput } from "@/lib/validations/checkout";
import {
  computeShippingCents,
  computeTaxCents,
  resolveVariantPriceCents,
} from "@/lib/pricing";

export type CheckoutResult = { url: string } | { error: string };

export async function createCheckoutSession(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid checkout input." };
  }

  if (!stripe) {
    return {
      error: "Payment processing is not configured yet. Set STRIPE_SECRET_KEY to enable checkout.",
    };
  }

  const session = await auth();
  const variantIds = parsed.data.items.map((item) => item.variantId);

  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  const lineItems: {
    variantId: string;
    quantity: number;
    unitPriceCents: number;
    productName: string;
    variantLabel: string;
  }[] = [];

  for (const item of parsed.data.items) {
    const variant = variantById.get(item.variantId);
    if (!variant || !variant.product.isPublished) {
      return { error: "One of the items in your cart is no longer available." };
    }
    if (variant.inventory < item.quantity) {
      return {
        error: `Not enough stock for ${variant.product.name} (${variant.size} / ${variant.color}).`,
      };
    }
    lineItems.push({
      variantId: variant.id,
      quantity: item.quantity,
      unitPriceCents: resolveVariantPriceCents(variant, variant.product),
      productName: variant.product.name,
      variantLabel: `${variant.size} / ${variant.color}`,
    });
  }

  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const shippingCents = computeShippingCents(subtotalCents);
  const taxCents = computeTaxCents();
  const totalCents = subtotalCents + shippingCents + taxCents;

  const order = await db.order.create({
    data: {
      userId: session?.user?.id,
      email: parsed.data.address.email,
      status: "pending",
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
      shippingAddress: JSON.stringify(parsed.data.address),
      items: {
        create: lineItems.map((item) => ({
          variantId: item.variantId,
          productName: item.productName,
          variantLabel: item.variantLabel,
          unitPriceCents: item.unitPriceCents,
          quantity: item.quantity,
        })),
      },
    },
  });

  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    `${headersList.get("x-forwarded-proto") ?? "http"}://${headersList.get("host")}`;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.productName },
          unit_amount: item.unitPriceCents,
        },
        quantity: item.quantity,
      })),
      shipping_options:
        shippingCents > 0
          ? [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: shippingCents, currency: "usd" },
                  display_name: "Standard shipping",
                },
              },
            ]
          : undefined,
      customer_email: parsed.data.address.email,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: { orderId: order.id },
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    await db.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });
    return {
      error: "Payment processing is currently unavailable. Please try again later.",
    };
  }
}
