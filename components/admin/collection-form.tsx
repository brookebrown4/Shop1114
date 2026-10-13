"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormField } from "@/components/form/field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  collectionSchema,
  type CollectionInput,
} from "@/lib/validations/collection";
import type { Product } from "@/lib/generated/prisma/client";

export function CollectionForm({
  products,
  defaultValues,
  action,
}: {
  products: Product[];
  defaultValues?: CollectionInput;
  action: (input: CollectionInput) => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CollectionInput>({
    resolver: zodResolver(collectionSchema),
    defaultValues: defaultValues ?? { name: "", slug: "", heroImage: "", productIds: [] },
  });

  async function onSubmit(data: CollectionInput) {
    setIsSubmitting(true);
    const result = await action(data);
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }
    router.push("/admin/collections");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" {...register("name")} />
      </FormField>
      <FormField label="Slug" htmlFor="slug" error={errors.slug?.message}>
        <Input id="slug" {...register("slug")} />
      </FormField>
      <FormField
        label="Hero image URL (optional)"
        htmlFor="heroImage"
        error={errors.heroImage?.message}
      >
        <Input id="heroImage" {...register("heroImage")} />
      </FormField>

      <div className="space-y-2">
        <Label>Products in this collection</Label>
        <Controller
          control={control}
          name="productIds"
          render={({ field }) => (
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-3">
              {products.map((product) => {
                const checked = field.value.includes(product.id);
                return (
                  <Label key={product.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        if (value) {
                          field.onChange([...field.value, product.id]);
                        } else {
                          field.onChange(
                            field.value.filter((id: string) => id !== product.id),
                          );
                        }
                      }}
                    />
                    {product.name}
                  </Label>
                );
              })}
            </div>
          )}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save collection"}
      </Button>
    </form>
  );
}
