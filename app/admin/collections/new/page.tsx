import type { Metadata } from "next";

import { db } from "@/lib/db";
import { CollectionForm } from "@/components/admin/collection-form";
import { createCollection } from "@/app/admin/collections/actions";

export const metadata: Metadata = {
  title: "New Collection",
};

export default async function NewCollectionPage() {
  const products = await db.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        New collection
      </h1>
      <CollectionForm products={products} action={createCollection} />
    </div>
  );
}
