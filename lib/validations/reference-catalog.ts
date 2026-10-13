import { z } from "zod";

import { ALLOWED_IMAGE_HOSTS } from "@/lib/constants";
import { REFERENCE_CATALOGS } from "@/lib/reference-catalog-constants";

function isAllowedImageUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

const catalogSlugs = REFERENCE_CATALOGS.map((catalog) => catalog.slug) as [
  string,
  ...string[],
];

export const referenceCatalogItemSchema = z.object({
  catalog: z.enum(catalogSlugs),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  swatchHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color, e.g. #1e2a3a")
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .union([z.url().refine(isAllowedImageUrl, "Unsupported image host"), z.literal("")])
    .optional(),
});

export type ReferenceCatalogItemInput = z.infer<typeof referenceCatalogItemSchema>;
