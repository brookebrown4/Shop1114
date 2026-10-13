import type { Metadata } from "next";
import Link from "next/link";

import { getAllCustomOrderRequests } from "@/lib/custom-orders";
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
  title: "Custom Order Requests",
};

const STATUSES = ["new", "reviewed", "closed"] as const;

export default async function AdminCustomRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const requests = await getAllCustomOrderRequests({ status });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Custom Order Requests
      </h1>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/custom-requests">
          <Badge variant={!status ? "default" : "outline"}>All</Badge>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/custom-requests?status=${s}`}>
            <Badge variant={status === s ? "default" : "outline"} className="capitalize">
              {s}
            </Badge>
          </Link>
        ))}
      </div>
      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No requests yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <Link
                    href={`/admin/custom-requests/${request.id}`}
                    className="font-medium hover:underline"
                  >
                    {request.name}
                  </Link>
                </TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell>{request.productName ?? "—"}</TableCell>
                <TableCell>{request.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {request.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
