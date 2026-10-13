"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";

export async function markOrderFulfilled(orderId: string): Promise<{ error?: string }> {
  await requireAdmin();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found." };
  if (order.status !== "paid") {
    return { error: "Only paid orders can be marked as fulfilled." };
  }

  await db.order.update({ where: { id: orderId }, data: { status: "fulfilled" } });
  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}
