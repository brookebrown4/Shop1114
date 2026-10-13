import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCustomOrderRequest } from "@/lib/custom-orders";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CustomRequestStatusActions } from "@/components/admin/custom-request-status-actions";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Custom Order Request",
};

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default async function AdminCustomRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getCustomOrderRequest(id);
  if (!request) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {request.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Submitted {request.createdAt.toLocaleDateString()}
          </p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {request.status}
        </Badge>
      </div>

      <CustomRequestStatusActions id={request.id} status={request.status} />

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Email" value={request.email} />
        <Field label="Phone" value={request.phone} />
        <Field label="Product" value={request.productName} />
        <Field
          label="Base price"
          value={
            request.basePriceCents != null ? formatPrice(request.basePriceCents) : null
          }
        />
        <Field label="Size / Color" value={request.variantLabel} />
        <Field label="Placement" value={request.placement} />
        <Field label="Thread color" value={request.threadColorName} />
        <Field label="Monogram text" value={request.monogramText} />
        <Field label="Font" value={request.fontName} />
        <Field label="Monogram style" value={request.monogramStyleName} />
        <Field label="Design" value={request.designName} />
      </div>

      {request.logoUrl ? (
        <>
          <Separator />
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Uploaded logo</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded file (incl. SVG), not run through the image optimizer */}
            <img
              src={request.logoUrl}
              alt="Customer-uploaded logo"
              className="max-h-48 rounded-md border border-border bg-muted p-2"
            />
          </div>
        </>
      ) : null}

      {request.notes ? (
        <>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="text-sm">{request.notes}</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
