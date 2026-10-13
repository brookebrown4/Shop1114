import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth-guards";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const order = await getOrderById(id, { userId: user.id });
  if (!order) notFound();

  let address: ShippingAddress | null = null;
  try {
    address = JSON.parse(order.shippingAddress) as ShippingAddress;
  } catch {
    address = null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Order #{order.id.slice(-8)}
        </h1>
        <Badge variant="secondary" className="capitalize">
          {order.status}
        </Badge>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Placed on {order.createdAt.toLocaleDateString()}
      </p>

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

      <Separator className="my-4" />

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
          <Separator className="my-4" />
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
