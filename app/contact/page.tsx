import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Get in touch
        </h1>
        <p className="mt-2 text-muted-foreground">
          Questions about a custom order, an existing order, or anything
          else? Send us a message and a real person will get back to you —
          usually within one business day.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
