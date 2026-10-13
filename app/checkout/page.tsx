import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading mb-8 text-2xl font-semibold tracking-tight">
        Checkout
      </h1>
      <CheckoutForm />
    </div>
  );
}
