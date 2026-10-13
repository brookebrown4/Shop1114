"use server";

import { sendContactInquiryEmail } from "@/lib/emails/contact-email";
import {
  contactInquirySchema,
  type ContactInquiryInput,
} from "@/lib/validations/contact";

export async function submitContactInquiry(
  input: ContactInquiryInput,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = contactInquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  await sendContactInquiryEmail(parsed.data);
  return { success: true };
}
