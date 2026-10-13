import type { Metadata } from "next";
import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { getCatalogSections } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catalog",
};

export default async function CatalogPage() {
  const sections = await getCatalogSections();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Catalog
        </h1>
        <p className="mt-2 text-muted-foreground">
          Every base we stock, ready for custom embroidery — for personal,
          business, or team orders.
        </p>
      </div>

      <div className="space-y-16">
        {sections.map(({ category, products, total }) => (
          <section key={category.id}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                {category.name}
              </h2>
              <Link
                href={`/category/${category.slug}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                View all{total > products.length ? ` (${total})` : ""}
              </Link>
            </div>
            <ProductGrid products={products} />
          </section>
        ))}
      </div>
    </div>
  );
}
