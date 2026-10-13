import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrderByStripeSessionId } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) notFound();

  const order = await getOrderByStripeSessionId(session_id);
  if (!order) notFound();

  const isPaid = order.status === "paid";

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-20 text-center sm:px-6 lg:px-8">
      {!isPaid ? <meta httpEquiv="refresh" content="3" /> : null}
      <ClearCartOnSuccess confirmed={isPaid} />

      {isPaid ? (
        <>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Order #{order.id.slice(-8)} &middot; {formatPrice(order.totalCents)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            A confirmation has been sent to {order.email}.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button nativeButton={false} render={<Link href="/shop" />}>
              Continue shopping
            </Button>
            {order.userId ? (
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={`/account/orders/${order.id}`} />}
              >
                View order
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Confirming your payment...
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page will update automatically once payment is confirmed.
          </p>
        </>
      )}
    </div>
  );
}
