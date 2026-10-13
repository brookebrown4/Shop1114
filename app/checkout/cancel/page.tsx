import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Checkout cancelled
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No payment was made. Your cart is still saved.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/cart" />}>
          Back to cart
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/shop" />}>
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
