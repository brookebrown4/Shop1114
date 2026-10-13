import { z } from "zod";

import { ALLOWED_IMAGE_HOSTS } from "@/lib/constants";

function isAllowedImageUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

export const productImageSchema = z.object({
  url: z.url().refine(isAllowedImageUrl, {
    message: `Image host must be one of: ${ALLOWED_IMAGE_HOSTS.join(", ")}`,
  }),
  alt: z.string().min(1, "Alt text is required"),
});

export const productVariantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  colorHex: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  priceCents: z.number().int().min(0).optional(),
  inventory: z.number().int().min(0),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().min(1, "Description is required"),
  priceCents: z.number().int().min(0),
  compareAtCents: z.number().int().min(0).optional(),
  categoryId: z.string().min(1, "Category is required"),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  images: z.array(productImageSchema).min(1, "At least one image is required"),
  variants: z
    .array(productVariantSchema)
    .min(1, "At least one variant is required"),
});

export type ProductInput = z.infer<typeof productSchema>;
