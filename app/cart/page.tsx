"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CartLineList } from "@/components/cart/cart-line-list";
import { cartSubtotalCents, useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = cartSubtotalCents(items);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
        Your Cart
      </h1>
      <CartLineList />
      {items.length > 0 ? (
        <div className="mt-8 space-y-4 border-t border-border pt-6">
          <div className="flex items-center justify-between text-base font-medium">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Shipping and taxes calculated at checkout.
          </p>
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href="/checkout" />}
          >
            Checkout
          </Button>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Button nativeButton={false} render={<Link href="/shop" />}>
            Continue shopping
          </Button>
        </div>
      )}
    </div>
  );
}
