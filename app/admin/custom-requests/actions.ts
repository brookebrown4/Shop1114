"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";

const VALID_STATUSES = ["new", "reviewed", "closed"];

export async function updateCustomOrderStatus(
  id: string,
  status: string,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  await db.customOrderRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/custom-requests");
  revalidatePath(`/admin/custom-requests/${id}`);
  return {};
}
