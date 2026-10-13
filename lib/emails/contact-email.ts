import { resend, EMAIL_FROM, ADMIN_EMAIL } from "@/lib/email";
import { emailShell } from "@/lib/emails/shell";
import type { ContactInquiryInput } from "@/lib/validations/contact";

export async function sendContactInquiryEmail(input: ContactInquiryInput): Promise<void> {
  if (!resend) {
    console.warn("Resend is not configured — skipping contact inquiry email.");
    return;
  }

  const html = emailShell(
    "New contact form message",
    `
      <p style="color:#444;">
        From <strong>${input.name}</strong> (${input.email})
      </p>
      <p style="white-space:pre-wrap;color:#222;border-top:1px solid #eee;padding-top:12px;">${input.message}</p>
    `,
  );

  const result = await resend.emails.send({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    replyTo: input.email,
    subject: `New message from ${input.name}`,
    html,
  });

  if (result.error) {
    console.error("Contact inquiry email failed:", result.error);
  }
}
