import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { VariantSelector } from "@/components/product/variant-selector";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: product.images[0]
      ? { images: [{ url: product.images[0].url }] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} />
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {product.category.name}
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
          </div>
          <VariantSelector product={product} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mt-16">
          <h2 className="font-heading mb-6 text-xl font-semibold tracking-tight">
            You might also like
          </h2>
          <ProductGrid products={related} />
        </div>
      ) : null}
    </div>
  );
}
