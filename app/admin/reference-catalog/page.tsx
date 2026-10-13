import type { Metadata } from "next";

import { ReferenceCatalogManager } from "@/components/admin/reference-catalog-manager";
import { getReferenceCatalogSections } from "@/lib/reference-catalog";

export const metadata: Metadata = {
  title: "Reference Catalog",
};

export default async function AdminReferenceCatalogPage() {
  const sections = await getReferenceCatalogSections();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Reference Catalog
      </h1>
      <p className="text-sm text-muted-foreground">
        Thread colors, fonts, monogram styles, and designs customers browse
        when placing a custom embroidery order.
      </p>
      <ReferenceCatalogManager sections={sections} />
    </div>
  );
}
