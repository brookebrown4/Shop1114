"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import { collectionSchema, type CollectionInput } from "@/lib/validations/collection";

export async function createCollection(
  input: CollectionInput,
): Promise<{ error?: string } | void> {
  await requireAdmin();
  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid collection." };
  }
  const data = parsed.data;

  const existing = await db.collection.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "A collection with this slug already exists." };

  await db.collection.create({
    data: {
      name: data.name,
      slug: data.slug,
      heroImage: data.heroImage || null,
      products: {
        create: data.productIds.map((productId) => ({ productId })),
      },
    },
  });

  redirect("/admin/collections");
}

export async function updateCollection(
  id: string,
  input: CollectionInput,
): Promise<{ error?: string } | void> {
  await requireAdmin();
  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid collection." };
  }
  const data = parsed.data;

  const existing = await db.collection.findFirst({
    where: { slug: data.slug, id: { not: id } },
  });
  if (existing) return { error: "A collection with this slug already exists." };

  await db.$transaction(async (tx) => {
    await tx.collection.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        heroImage: data.heroImage || null,
      },
    });
    await tx.productCollection.deleteMany({ where: { collectionId: id } });
    await tx.productCollection.createMany({
      data: data.productIds.map((productId) => ({ productId, collectionId: id })),
    });
  });

  redirect("/admin/collections");
}

export async function deleteCollection(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  await db.collection.delete({ where: { id } });
  return {};
}
