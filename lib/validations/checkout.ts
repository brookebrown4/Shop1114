import { z } from "zod";

export const shippingAddressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

export const checkoutInputSchema = z.object({
  address: shippingAddressSchema,
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
