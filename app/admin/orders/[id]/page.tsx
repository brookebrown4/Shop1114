import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getOrderWithItems } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkFulfilledButton } from "@/components/admin/mark-fulfilled-button";

export const metadata: Metadata = {
  title: "Order Detail",
};

type ShippingAddress = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderWithItems(id);
  if (!order) notFound();

  let address: ShippingAddress | null = null;
  try {
    address = JSON.parse(order.shippingAddress) as ShippingAddress;
  } catch {
    address = null;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Order #{order.id.slice(-8)}
          </h1>
          <p className="text-sm text-muted-foreground">{order.email}</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {order.status}
        </Badge>
      </div>

      {order.status === "paid" ? <MarkFulfilledButton orderId={order.id} /> : null}

      <ul className="divide-y divide-border">
        {order.items.map((item) => {
          const image = item.variant.product.images[0];
          return (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {image ? (
                  <Image
                    src={image.url}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.variantLabel} &times; {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      <Separator />

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(order.subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{formatPrice(order.shippingCents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatPrice(order.taxCents)}</span>
        </div>
        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>{formatPrice(order.totalCents)}</span>
        </div>
      </div>

      {address ? (
        <>
          <Separator />
          <div>
            <h2 className="mb-2 text-sm font-medium">Shipping address</h2>
            <p className="text-sm text-muted-foreground">
              {address.name}
              <br />
              {address.line1}
              {address.line2 ? <> {address.line2}</> : null}
              <br />
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.country}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
