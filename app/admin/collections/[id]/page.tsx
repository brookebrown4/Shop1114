import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { CollectionForm } from "@/components/admin/collection-form";
import { updateCollection } from "@/app/admin/collections/actions";

export const metadata: Metadata = {
  title: "Edit Collection",
};

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collection, products] = await Promise.all([
    db.collection.findUnique({
      where: { id },
      include: { products: true },
    }),
    db.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Edit collection
      </h1>
      <CollectionForm
        products={products}
        defaultValues={{
          name: collection.name,
          slug: collection.slug,
          heroImage: collection.heroImage ?? "",
          productIds: collection.products.map((p) => p.productId),
        }}
        action={updateCollection.bind(null, collection.id)}
      />
    </div>
  );
}
