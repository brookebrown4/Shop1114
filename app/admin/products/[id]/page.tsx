import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { updateProduct } from "@/app/admin/products/actions";
import type { ProductInput } from "@/lib/validations/product";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, variants: true },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const defaultValues: ProductInput = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.priceCents,
    compareAtCents: product.compareAtCents ?? undefined,
    categoryId: product.categoryId,
    isFeatured: product.isFeatured,
    isPublished: product.isPublished,
    images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
    variants: product.variants.map((variant) => ({
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex ?? undefined,
      sku: variant.sku,
      priceCents: variant.priceCents ?? undefined,
      inventory: variant.inventory,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Edit product
        </h1>
        <DeleteProductButton productId={product.id} />
      </div>
      <ProductForm
        categories={categories}
        defaultValues={defaultValues}
        action={updateProduct.bind(null, product.id)}
      />
    </div>
  );
}
