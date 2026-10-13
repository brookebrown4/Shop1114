"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import { productSchema, type ProductInput } from "@/lib/validations/product";

export async function createProduct(
  input: ProductInput,
): Promise<{ error?: string } | void> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product." };
  }
  const data = parsed.data;

  const existing = await db.product.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { error: "A product with this slug already exists." };
  }

  await db.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      priceCents: data.priceCents,
      compareAtCents: data.compareAtCents ?? null,
      categoryId: data.categoryId,
      isFeatured: data.isFeatured,
      isPublished: data.isPublished,
      images: {
        create: data.images.map((image, index) => ({
          url: image.url,
          alt: image.alt,
          position: index,
        })),
      },
      variants: {
        create: data.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex || null,
          sku: variant.sku,
          priceCents: variant.priceCents ?? null,
          inventory: variant.inventory,
        })),
      },
    },
  });

  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<{ error?: string } | void> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product." };
  }
  const data = parsed.data;

  const existing = await db.product.findFirst({
    where: { slug: data.slug, id: { not: id } },
  });
  if (existing) {
    return { error: "A product with this slug already exists." };
  }

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        compareAtCents: data.compareAtCents ?? null,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
      },
    });

    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productImage.createMany({
      data: data.images.map((image, index) => ({
        productId: id,
        url: image.url,
        alt: image.alt,
        position: index,
      })),
    });

    for (const variant of data.variants) {
      await tx.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          productId: id,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex || null,
          priceCents: variant.priceCents ?? null,
          inventory: variant.inventory,
        },
        create: {
          productId: id,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex || null,
          sku: variant.sku,
          priceCents: variant.priceCents ?? null,
          inventory: variant.inventory,
        },
      });
    }

    const keepSkus = data.variants.map((v) => v.sku);
    await tx.productVariant.deleteMany({
      where: { productId: id, sku: { notIn: keepSkus } },
    });
  });

  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const orderItemCount = await db.orderItem.count({
    where: { variant: { productId: id } },
  });
  if (orderItemCount > 0) {
    return {
      error:
        "This product has order history and can't be deleted. Unpublish it instead.",
    };
  }

  await db.product.delete({ where: { id } });
  return {};
}
