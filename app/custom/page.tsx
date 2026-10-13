import type { Metadata } from "next";

import { CustomOrderConfigurator } from "@/components/custom/custom-order-configurator";
import { listProducts } from "@/lib/products";
import { getReferenceCatalogSections } from "@/lib/reference-catalog";
import { HOW_IT_WORKS_STEPS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Custom Order",
};

const FAQS = [
  {
    question: "Will I see a proof before you stitch anything?",
    answer:
      "Yes. After you submit a request, we email a design proof for your approval — you're never charged and nothing is produced until you say go.",
  },
  {
    question: "What file types can I upload for my logo?",
    answer:
      "PNG, JPG, WEBP, or SVG, up to 5MB. Higher-resolution files digitize more cleanly, but don't worry if all you have is a phone photo — we'll clean it up.",
  },
  {
    question: "How long does a custom order take?",
    answer:
      "Most orders ship within 7–10 business days after you approve your proof. Need it sooner? Mention your deadline in the notes and we'll do what we can.",
  },
  {
    question: "Is there a minimum order quantity?",
    answer:
      "No minimum for personal orders — we're happy to stitch just one. Team and business orders of any size are welcome too.",
  },
  {
    question: "How should I care for embroidered apparel?",
    answer:
      "Turn the garment inside out before washing in cold water, and skip the dryer's high heat — embroidery holds up far longer with a gentle wash and air or low-heat drying.",
  },
] as const;

export default async function CustomOrderPage() {
  const [{ products }, referenceSections] = await Promise.all([
    listProducts({ perPage: 100, sort: "name-asc" }),
    getReferenceCatalogSections(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Custom Order
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick a base product, upload your logo (or choose text, a font, or a
          stock design), and see a live preview. Submit your request and
          we&apos;ll follow up with a quote.
        </p>
      </div>

      <div className="mb-12 grid gap-6 rounded-xl border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <div key={step.title}>
            <p className="font-heading text-lg font-bold text-primary">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 text-sm font-medium">{step.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      <CustomOrderConfigurator products={products} referenceSections={referenceSections} />

      <div className="mx-auto mt-20 max-w-3xl rounded-xl bg-primary/5 p-6 sm:p-8">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Common questions
        </h2>
        <div className="mt-4 divide-y divide-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {faq.question}
                <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
