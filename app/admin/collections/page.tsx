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
import { deleteCollection } from "@/app/admin/collections/actions";

export const metadata: Metadata = {
  title: "Collections",
};

export default async function AdminCollectionsPage() {
  const collections = await db.collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Collections
        </h1>
        <Button nativeButton={false} render={<Link href="/admin/collections/new" />}>
          New collection
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
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell className="font-medium">{collection.name}</TableCell>
              <TableCell className="text-muted-foreground">{collection.slug}</TableCell>
              <TableCell>{collection._count.products}</TableCell>
              <TableCell>
                <Link
                  href={`/admin/collections/${collection.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  Edit
                </Link>
              </TableCell>
              <TableCell>
                <ConfirmDeleteButton
                  confirmMessage={`Delete collection "${collection.name}"?`}
                  onDelete={deleteCollection.bind(null, collection.id)}
                  redirectTo="/admin/collections"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
