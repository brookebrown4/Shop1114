"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createCheckoutSession } from "@/app/checkout/actions";
import { FormField } from "@/components/form/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { cartSubtotalCents, useCartHydrated, useCartStore } from "@/lib/store/cart";
import {
  shippingAddressSchema,
  type ShippingAddressInput,
} from "@/lib/validations/checkout";

export function CheckoutForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const hydrated = useCartHydrated();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      email: session?.user?.email ?? "",
      country: "US",
    },
  });

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  // Stripe Checkout is an external destination, so this hands off with a
  // full navigation once we have a URL, rather than a router push.
  useEffect(() => {
    if (redirectUrl) window.location.href = redirectUrl;
  }, [redirectUrl]);

  if (!hydrated || items.length === 0) return null;

  const subtotal = cartSubtotalCents(items);

  async function onSubmit(address: ShippingAddressInput) {
    setIsSubmitting(true);
    const result = await createCheckoutSession({
      address,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });
    if ("error" in result) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }
    setRedirectUrl(result.url);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} autoFocus />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FormField>
        <FormField label="Address" htmlFor="line1" error={errors.line1?.message}>
          <Input id="line1" {...register("line1")} />
        </FormField>
        <FormField
          label="Apartment, suite, etc. (optional)"
          htmlFor="line2"
          error={errors.line2?.message}
        >
          <Input id="line2" {...register("line2")} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" htmlFor="city" error={errors.city?.message}>
            <Input id="city" {...register("city")} />
          </FormField>
          <FormField label="State" htmlFor="state" error={errors.state?.message}>
            <Input id="state" {...register("state")} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Postal code"
            htmlFor="postalCode"
            error={errors.postalCode?.message}
          >
            <Input id="postalCode" {...register("postalCode")} />
          </FormField>
          <FormField label="Country" htmlFor="country" error={errors.country?.message}>
            <Input id="country" {...register("country")} />
          </FormField>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Redirecting to payment..." : "Continue to payment"}
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Order summary
        </h2>
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.variantId} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.size} / {item.color} &times; {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatPrice(item.unitPriceCentsDisplay * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border pt-4 text-base font-medium">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Shipping and any applicable tax are calculated on the next step.
        </p>
      </div>
    </div>
  );
}
