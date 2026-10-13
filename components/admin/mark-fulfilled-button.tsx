"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { markOrderFulfilled } from "@/app/admin/orders/actions";

export function MarkFulfilledButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        const result = await markOrderFulfilled(orderId);
        if (result.error) {
          toast.error(result.error);
          setIsPending(false);
          return;
        }
        toast.success("Order marked as fulfilled");
        router.refresh();
      }}
    >
      {isPending ? "Updating..." : "Mark as fulfilled"}
    </Button>
  );
}
