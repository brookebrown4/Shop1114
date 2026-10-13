"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form/field";
import {
  createReferenceItem,
  updateReferenceItem,
} from "@/app/admin/reference-catalog/actions";
import {
  referenceCatalogItemSchema,
  type ReferenceCatalogItemInput,
} from "@/lib/validations/reference-catalog";
import { REFERENCE_CATALOGS } from "@/lib/reference-catalog-constants";
import type { ReferenceCatalogItem } from "@/lib/generated/prisma/client";

export function ReferenceItemFormDialog({
  open,
  catalog,
  item,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  catalog: string;
  item?: ReferenceCatalogItem;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const catalogInfo = REFERENCE_CATALOGS.find((c) => c.slug === catalog);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReferenceCatalogItemInput>({
    resolver: zodResolver(referenceCatalogItemSchema),
    defaultValues: {
      catalog,
      name: item?.name ?? "",
      description: item?.description ?? "",
      swatchHex: item?.swatchHex ?? "",
      imageUrl: item?.imageUrl ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        catalog,
        name: item?.name ?? "",
        description: item?.description ?? "",
        swatchHex: item?.swatchHex ?? "",
        imageUrl: item?.imageUrl ?? "",
      });
    }
  }, [open, item, catalog, reset]);

  async function onSubmit(data: ReferenceCatalogItemInput) {
    const result = item
      ? await updateReferenceItem(item.id, data)
      : await createReferenceItem(data);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "Item updated" : "Item added");
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit" : "Add"} {catalogInfo?.name.replace(/s$/, "")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("catalog")} />
          <FormField label="Name" htmlFor="ref-name" error={errors.name?.message}>
            <Input id="ref-name" {...register("name")} autoFocus />
          </FormField>
          {catalog === "thread-colors" ? (
            <FormField
              label="Swatch color (hex)"
              htmlFor="ref-hex"
              error={errors.swatchHex?.message}
              description="Shown until a photo is uploaded"
            >
              <Input id="ref-hex" placeholder="#1e2a3a" {...register("swatchHex")} />
            </FormField>
          ) : null}
          <FormField
            label="Image URL (optional)"
            htmlFor="ref-image"
            error={errors.imageUrl?.message}
          >
            <Input id="ref-image" {...register("imageUrl")} />
          </FormField>
          <FormField
            label="Description (optional)"
            htmlFor="ref-description"
            error={errors.description?.message}
          >
            <Input id="ref-description" {...register("description")} />
          </FormField>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
