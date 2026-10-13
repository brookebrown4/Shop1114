"use server";

import { db } from "@/lib/db";
import { saveCustomOrderLogo, type UploadResult } from "@/lib/uploads";
import {
  customOrderRequestSchema,
  type CustomOrderRequestInput,
} from "@/lib/validations/custom-order";

export async function uploadCustomOrderLogo(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }
  return saveCustomOrderLogo(file);
}

export async function submitCustomOrderRequest(
  input: CustomOrderRequestInput,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = customOrderRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }
  const data = parsed.data;

  await db.customOrderRequest.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      productName: data.productName || null,
      productSlug: data.productSlug || null,
      variantLabel: data.variantLabel || null,
      placement: data.placement || null,
      monogramText: data.mode === "text" ? data.monogramText || null : null,
      fontName: data.mode === "text" ? data.fontName || null : null,
      monogramStyleName:
        data.mode === "text" ? data.monogramStyleName || null : null,
      designName: data.mode === "design" ? data.designName || null : null,
      logoUrl: data.mode === "logo" ? data.logoUrl || null : null,
      threadColorName: data.threadColorName || null,
      basePriceCents: data.basePriceCents ?? null,
      notes: data.notes || null,
    },
  });

  return { success: true };
}
