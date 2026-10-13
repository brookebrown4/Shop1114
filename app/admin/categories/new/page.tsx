import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "@/app/admin/categories/actions";

export const metadata: Metadata = {
  title: "New Category",
};

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        New category
      </h1>
      <CategoryForm action={createCategory} />
    </div>
  );
}
