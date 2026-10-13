import type { Metadata } from "next";
import Link from "next/link";

import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Orders",
};

const STATUSES = ["pending", "paid", "fulfilled", "cancelled"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { orders } = await getAllOrders({ status });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Orders</h1>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/orders">
          <Badge variant={!status ? "default" : "outline"}>All</Badge>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`}>
            <Badge variant={status === s ? "default" : "outline"} className="capitalize">
              {s}
            </Badge>
          </Link>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium hover:underline"
                >
                  #{order.id.slice(-8)}
                </Link>
              </TableCell>
              <TableCell>{order.email}</TableCell>
              <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(order.totalCents)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
