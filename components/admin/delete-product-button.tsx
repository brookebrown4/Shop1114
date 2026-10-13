"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/app/admin/products/actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isDeleting}
      onClick={async () => {
        if (!window.confirm("Delete this product? This cannot be undone.")) return;
        setIsDeleting(true);
        const result = await deleteProduct(productId);
        if (result.error) {
          toast.error(result.error);
          setIsDeleting(false);
          return;
        }
        toast.success("Product deleted");
        router.push("/admin/products");
        router.refresh();
      }}
    >
      {isDeleting ? "Deleting..." : "Delete product"}
    </Button>
  );
}
