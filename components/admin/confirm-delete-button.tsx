"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ConfirmDeleteButton({
  confirmMessage,
  onDelete,
  redirectTo,
  label = "Delete",
}: {
  confirmMessage: string;
  onDelete: () => Promise<{ error?: string }>;
  redirectTo: string;
  label?: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isDeleting}
      onClick={async () => {
        if (!window.confirm(confirmMessage)) return;
        setIsDeleting(true);
        const result = await onDelete();
        if (result.error) {
          toast.error(result.error);
          setIsDeleting(false);
          return;
        }
        toast.success("Deleted");
        router.push(redirectTo);
        router.refresh();
      }}
    >
      {isDeleting ? "Deleting..." : label}
    </Button>
  );
}
