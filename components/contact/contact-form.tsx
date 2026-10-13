"use client";

import { useState } from "react";
import { toast } from "sonner";

import { submitContactInquiry } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form/field";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    const result = await submitContactInquiry({ name, email, message });
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
    toast.success("Message sent");
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Thanks for reaching out!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll get back to you at {email} soon.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <FormField label="Your name" htmlFor="contact-name">
        <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="Email" htmlFor="contact-email">
        <Input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <FormField label="Message" htmlFor="contact-message">
        <Textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </FormField>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        size="lg"
        className="w-full sm:w-auto"
        disabled={isSubmitting || !name || !email || !message}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </Button>
    </div>
  );
}
