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

export const collectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  heroImage: z
    .union([z.url().refine(isAllowedImageUrl, "Unsupported image host"), z.literal("")])
    .optional(),
  productIds: z.array(z.string()),
});

export type CollectionInput = z.infer<typeof collectionSchema>;
