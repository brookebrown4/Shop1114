import { z } from "zod";

export const contactInquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  message: z.string().min(1, "Message is required").max(2000),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
