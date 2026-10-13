import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendOrderEmails } from "@/lib/emails/order-emails";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSession.metadata?.orderId;

    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      // Idempotency guard: Stripe may redeliver this event.
      if (order && order.status !== "paid") {
        await db.$transaction([
          db.order.update({
            where: { id: orderId },
            data: { status: "paid" },
          }),
          ...order.items.map((item) =>
            db.productVariant.update({
              where: { id: item.variantId },
              data: { inventory: { decrement: item.quantity } },
            }),
          ),
        ]);

        await sendOrderEmails(order);
      }
    }
  }

  return NextResponse.json({ received: true });
}
