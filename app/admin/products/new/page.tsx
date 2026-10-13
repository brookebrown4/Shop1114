import type { Metadata } from "next";

import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/app/admin/products/actions";

export const metadata: Metadata = {
  title: "New Product",
};

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        New product
      </h1>
      <ProductForm categories={categories} action={createProduct} />
    </div>
  );
}
