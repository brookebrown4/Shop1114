import { db } from "@/lib/db";
import type { CustomOrderRequest } from "@/lib/generated/prisma/client";

export async function getAllCustomOrderRequests(params?: {
  status?: string;
}): Promise<CustomOrderRequest[]> {
  return db.customOrderRequest.findMany({
    where: params?.status ? { status: params.status } : {},
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomOrderRequest(
  id: string,
): Promise<CustomOrderRequest | null> {
  return db.customOrderRequest.findUnique({ where: { id } });
}
