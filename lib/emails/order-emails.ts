import { formatPrice } from "@/lib/format";
import { resend, EMAIL_FROM, ADMIN_EMAIL } from "@/lib/email";
import { SITE_NAME } from "@/lib/constants";
import { emailShell } from "@/lib/emails/shell";

type OrderItemForEmail = {
  productName: string;
  variantLabel: string;
  unitPriceCents: number;
  quantity: number;
};

export type OrderForEmail = {
  id: string;
  email: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  items: OrderItemForEmail[];
};

function itemsRowsHtml(items: OrderItemForEmail[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${item.productName}<br/>
            <span style="color:#888;font-size:13px;">${item.variantLabel} &times; ${item.quantity}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">
            ${formatPrice(item.unitPriceCents * item.quantity)}
          </td>
        </tr>`,
    )
    .join("");
}

function summaryRowsHtml(order: OrderForEmail): string {
  const rows: [string, number][] = [
    ["Subtotal", order.subtotalCents],
    ["Shipping", order.shippingCents],
    ["Tax", order.taxCents],
  ];
  return (
    rows
      .map(
        ([label, cents]) => `
        <tr>
          <td style="padding:4px 0;color:#666;">${label}</td>
          <td style="padding:4px 0;text-align:right;color:#666;">${formatPrice(cents)}</td>
        </tr>`,
      )
      .join("") +
    `
        <tr>
          <td style="padding:8px 0;font-weight:600;border-top:1px solid #ddd;">Total</td>
          <td style="padding:8px 0;font-weight:600;text-align:right;border-top:1px solid #ddd;">${formatPrice(order.totalCents)}</td>
        </tr>`
  );
}

export function customerOrderConfirmationEmail(order: OrderForEmail) {
  const html = emailShell(
    "Thanks for your order!",
    `
      <p style="color:#444;">
        We've received your order <strong>#${order.id.slice(-8).toUpperCase()}</strong>
        and it's being prepared. You'll get another email once it ships.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        ${itemsRowsHtml(order.items)}
        ${summaryRowsHtml(order)}
      </table>
    `,
  );
  return {
    subject: `Your ${SITE_NAME} order is confirmed`,
    html,
  };
}

export function adminNewOrderEmail(order: OrderForEmail) {
  const html = emailShell(
    "New paid order",
    `
      <p style="color:#444;">
        Order <strong>#${order.id.slice(-8).toUpperCase()}</strong> from
        <strong>${order.email}</strong> just came through.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        ${itemsRowsHtml(order.items)}
        ${summaryRowsHtml(order)}
      </table>
    `,
  );
  return {
    subject: `New order #${order.id.slice(-8).toUpperCase()} — ${formatPrice(order.totalCents)}`,
    html,
  };
}

// Fire-and-forget-ish: logs failures instead of throwing so a Resend outage
// or bad key never breaks the webhook's order/inventory update, which is the
// part that actually matters.
export async function sendOrderEmails(order: OrderForEmail): Promise<void> {
  if (!resend) {
    console.warn("Resend is not configured — skipping order emails.");
    return;
  }

  const customer = customerOrderConfirmationEmail(order);
  const admin = adminNewOrderEmail(order);

  const sends = [
    { label: "customer confirmation", to: order.email, ...customer },
    { label: "admin notification", to: ADMIN_EMAIL, ...admin },
  ];

  const results = await Promise.allSettled(
    sends.map((send) =>
      resend!.emails.send({
        from: EMAIL_FROM,
        to: send.to,
        subject: send.subject,
        html: send.html,
      }),
    ),
  );

  // The Resend SDK resolves (doesn't reject) on API-level failures — it
  // returns { data: null, error } instead of throwing — so a bad request
  // (e.g. sandbox mode rejecting an unverified recipient) would silently
  // look "successful" if we only checked for rejected promises.
  results.forEach((result, i) => {
    const { label, to } = sends[i];
    if (result.status === "rejected") {
      console.error(`Order email (${label} to ${to}) failed:`, result.reason);
    } else if (result.value.error) {
      console.error(`Order email (${label} to ${to}) failed:`, result.value.error);
    }
  });
}
