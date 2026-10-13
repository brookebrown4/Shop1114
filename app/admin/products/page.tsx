import type { Metadata } from "next";
import Link from "next/link";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Products
        </h1>
        <Button nativeButton={false} render={<Link href="/admin/products/new" />}>
          New product
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>{formatPrice(product.priceCents)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Badge variant={product.isPublished ? "default" : "secondary"}>
                    {product.isPublished ? "Published" : "Draft"}
                  </Badge>
                  {product.isFeatured ? (
                    <Badge variant="outline">Featured</Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  Edit
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
