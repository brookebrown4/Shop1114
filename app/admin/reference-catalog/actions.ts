"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import {
  referenceCatalogItemSchema,
  type ReferenceCatalogItemInput,
} from "@/lib/validations/reference-catalog";

export async function createReferenceItem(
  input: ReferenceCatalogItemInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = referenceCatalogItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid item." };
  }
  const data = parsed.data;

  const maxPosition = await db.referenceCatalogItem.aggregate({
    where: { catalog: data.catalog },
    _max: { position: true },
  });

  await db.referenceCatalogItem.create({
    data: {
      catalog: data.catalog,
      name: data.name,
      description: data.description || null,
      swatchHex: data.swatchHex || null,
      imageUrl: data.imageUrl || null,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

  revalidatePath("/admin/reference-catalog");
  revalidatePath("/reference");
  return {};
}

export async function updateReferenceItem(
  id: string,
  input: ReferenceCatalogItemInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = referenceCatalogItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid item." };
  }
  const data = parsed.data;

  await db.referenceCatalogItem.update({
    where: { id },
    data: {
      catalog: data.catalog,
      name: data.name,
      description: data.description || null,
      swatchHex: data.swatchHex || null,
      imageUrl: data.imageUrl || null,
    },
  });

  revalidatePath("/admin/reference-catalog");
  revalidatePath("/reference");
  return {};
}

export async function deleteReferenceItem(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  await db.referenceCatalogItem.delete({ where: { id } });
  revalidatePath("/admin/reference-catalog");
  revalidatePath("/reference");
  return {};
}
