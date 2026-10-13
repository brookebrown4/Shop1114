import { z } from "zod";

export const customOrderRequestSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email(),
    phone: z.string().optional(),
    productName: z.string().optional(),
    productSlug: z.string().optional(),
    variantLabel: z.string().optional(),
    placement: z.string().optional(),
    mode: z.enum(["text", "design", "logo"]),
    monogramText: z.string().optional(),
    fontName: z.string().optional(),
    monogramStyleName: z.string().optional(),
    designName: z.string().optional(),
    threadColorName: z.string().optional(),
    logoUrl: z.string().optional(),
    basePriceCents: z.number().int().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.mode !== "text" ||
      (data.monogramText && data.monogramText.trim().length > 0),
    {
      message: "Enter the text you'd like embroidered",
      path: ["monogramText"],
    },
  )
  .refine((data) => data.mode !== "design" || !!data.designName, {
    message: "Choose a design",
    path: ["designName"],
  })
  .refine((data) => data.mode !== "logo" || !!data.logoUrl, {
    message: "Upload your logo or artwork",
    path: ["logoUrl"],
  });

export type CustomOrderRequestInput = z.infer<typeof customOrderRequestSchema>;
