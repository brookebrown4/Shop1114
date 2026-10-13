import type { Metadata } from "next";

import { ReferenceItemCard } from "@/components/reference/reference-item-card";
import { getReferenceCatalogSections } from "@/lib/reference-catalog";

export const metadata: Metadata = {
  title: "Reference Catalogs",
};

export default async function ReferenceCatalogsPage() {
  const sections = await getReferenceCatalogSections();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Reference Catalogs
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse thread colors, fonts, monogram styles, and stock designs to
          help you decide what to request for your custom embroidery order.
        </p>
      </div>

      <div className="space-y-16">
        {sections.map(({ catalog, items }) => (
          <section key={catalog.slug}>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {catalog.name}
            </h2>
            {catalog.description ? (
              <p className="mt-1 mb-6 max-w-xl text-sm text-muted-foreground">
                {catalog.description}
              </p>
            ) : null}
            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                Not uploaded yet
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                {items.map((item) => (
                  <ReferenceItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
