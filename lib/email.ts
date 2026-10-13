import { Resend } from "resend";

// Same defensive-construction pattern as lib/stripe.ts — stays null instead
// of crashing at module load when the key is missing; callers must check.
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@shop1114.test";
