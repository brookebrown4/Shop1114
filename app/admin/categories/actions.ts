"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

export async function createCategory(
  input: CategoryInput,
): Promise<{ error?: string } | void> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category." };
  }

  const existing = await db.category.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) return { error: "A category with this slug already exists." };

  await db.category.create({ data: parsed.data });
  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<{ error?: string } | void> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category." };
  }

  const existing = await db.category.findFirst({
    where: { slug: parsed.data.slug, id: { not: id } },
  });
  if (existing) return { error: "A category with this slug already exists." };

  await db.category.update({ where: { id }, data: parsed.data });
  redirect("/admin/categories");
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return {
      error: "This category still has products assigned to it.",
    };
  }

  await db.category.delete({ where: { id } });
  return {};
}
