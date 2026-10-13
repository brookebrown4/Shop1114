# Email & Contact

Transactional email (order confirmation + admin new-order alert) via Resend,
plus a public `/contact` page that emails an inquiry straight to the admin
address — no ticketing system, just email.

## Key files

- `lib/email.ts` — the Resend client, constructed conditionally (`resend = key ? new Resend(key) : null`) so a missing key degrades gracefully instead of crashing at module load; also exports `EMAIL_FROM` and `ADMIN_EMAIL` (both env-driven, with defaults)
- `lib/emails/shell.ts` — the shared HTML wrapper every email uses, so order and contact emails look consistent
- `lib/emails/order-emails.ts` — `customerOrderConfirmationEmail(order)`, `adminNewOrderEmail(order)`, and `sendOrderEmails(order)` (sends both, called from the Stripe webhook — see [checkout-and-orders.md](./checkout-and-orders.md)). Errors are logged, never thrown, so a Resend outage never breaks order fulfillment.
- `lib/emails/contact-email.ts` — `sendContactInquiryEmail(input)`, sent with `replyTo` set to the visitor's email so replying from your inbox goes straight to them
- `app/contact/page.tsx`, `components/contact/contact-form.tsx`, `app/contact/actions.ts` — the contact form itself (name/email/message, no auth required)
- `lib/validations/contact.ts` — Zod schema

## Environment variables

`RESEND_API_KEY`, `EMAIL_FROM` (defaults to `onboarding@resend.dev`), `ADMIN_EMAIL` (defaults to `admin@shop1114.test`, which is **not a real inbox** — override with a real address).

## The sandbox-mode restriction (important for local testing)

Without a verified sending domain on Resend, the API will only deliver **to
the email address that owns the Resend account** — sending to any other
address returns a 403 (`validation_error`) even though `EMAIL_FROM` is
correctly set to the shared `onboarding@resend.dev` sender. This means:

- `ADMIN_EMAIL` must be set to your actual Resend account email to receive anything during local testing.
- A customer checking out with their own (different) email won't get a confirmation until a real domain is verified at resend.com/domains and `EMAIL_FROM` is switched to an address on that domain.

## Known gaps

- Both `sendOrderEmails` and `sendContactInquiryEmail` must check `result.error` on the *resolved* value from `resend.emails.send()` — the SDK resolves with `{data: null, error}` on API-level failures rather than throwing/rejecting. A version of this code that only checked for rejected promises would silently swallow real send failures (this was caught and fixed once already — worth remembering if this code is ever refactored).
