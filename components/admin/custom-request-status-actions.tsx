"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateCustomOrderStatus } from "@/app/admin/custom-requests/actions";

const NEXT_STATUS: Record<string, { next: string; label: string } | undefined> = {
  new: { next: "reviewed", label: "Mark as reviewed" },
  reviewed: { next: "closed", label: "Mark as closed" },
};

export function CustomRequestStatusActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const next = NEXT_STATUS[status];

  if (!next) return null;

  return (
    <Button
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        const result = await updateCustomOrderStatus(id, next.next);
        setIsPending(false);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Status updated");
        router.refresh();
      }}
    >
      {isPending ? "Updating..." : next.label}
    </Button>
  );
}
