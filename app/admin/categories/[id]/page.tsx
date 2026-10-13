import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategory } from "@/app/admin/categories/actions";

export const metadata: Metadata = {
  title: "Edit Category",
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await db.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Edit category
      </h1>
      <CategoryForm
        defaultValues={{ name: category.name, slug: category.slug }}
        action={updateCategory.bind(null, category.id)}
      />
    </div>
  );
}
