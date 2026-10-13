import type { Metadata } from "next";
import Link from "next/link";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategory } from "@/app/admin/categories/actions";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Categories
        </h1>
        <Button nativeButton={false} render={<Link href="/admin/categories/new" />}>
          New category
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Products</TableHead>
            <TableHead />
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-muted-foreground">{category.slug}</TableCell>
              <TableCell>{category._count.products}</TableCell>
              <TableCell>
                <Link
                  href={`/admin/categories/${category.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  Edit
                </Link>
              </TableCell>
              <TableCell>
                <ConfirmDeleteButton
                  confirmMessage={`Delete category "${category.name}"?`}
                  onDelete={deleteCategory.bind(null, category.id)}
                  redirectTo="/admin/categories"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
