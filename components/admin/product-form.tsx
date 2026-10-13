"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/form/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import type { Category } from "@/lib/generated/prisma/client";

export function ProductForm({
  categories,
  defaultValues,
  action,
}: {
  categories: Category[];
  defaultValues?: ProductInput;
  action: (input: ProductInput) => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues ?? {
      name: "",
      slug: "",
      description: "",
      priceCents: 0,
      categoryId: categories[0]?.id ?? "",
      isFeatured: false,
      isPublished: true,
      images: [{ url: "", alt: "" }],
      variants: [{ size: "", color: "", colorHex: "", sku: "", inventory: 0 }],
    },
  });

  const images = useFieldArray({ control, name: "images" });
  const variants = useFieldArray({ control, name: "variants" });

  async function onSubmit(data: ProductInput) {
    setIsSubmitting(true);
    const result = await action(data);
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" {...register("name")} />
          </FormField>
          <FormField label="Slug" htmlFor="slug" error={errors.slug?.message}>
            <Input id="slug" {...register("slug")} />
          </FormField>
          <FormField
            label="Description"
            htmlFor="description"
            error={errors.description?.message}
          >
            <Textarea id="description" rows={4} {...register("description")} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Price (cents)"
              htmlFor="priceCents"
              error={errors.priceCents?.message}
            >
              <Input
                id="priceCents"
                type="number"
                {...register("priceCents", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Compare-at price (cents, optional)"
              htmlFor="compareAtCents"
              error={errors.compareAtCents?.message}
            >
              <Input
                id="compareAtCents"
                type="number"
                {...register("compareAtCents", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
            </FormField>
          </div>
          <FormField label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="categoryId" className="w-full">
                    <SelectValue>
                      {(value: string) =>
                        categories.find((category) => category.id === value)?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <div className="flex items-center gap-6">
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Featured
                </Label>
              )}
            />
            <Controller
              control={control}
              name="isPublished"
              render={({ field }) => (
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Published
                </Label>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.images?.message ? (
            <p className="text-sm text-destructive">{errors.images.message}</p>
          ) : null}
          {images.fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2">
                <FormField
                  label="Image URL"
                  htmlFor={`images.${index}.url`}
                  error={errors.images?.[index]?.url?.message}
                >
                  <Input
                    id={`images.${index}.url`}
                    {...register(`images.${index}.url` as const)}
                  />
                </FormField>
                <FormField
                  label="Alt text"
                  htmlFor={`images.${index}.alt`}
                  error={errors.images?.[index]?.alt?.message}
                >
                  <Input
                    id={`images.${index}.alt`}
                    {...register(`images.${index}.alt` as const)}
                  />
                </FormField>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
                onClick={() => images.remove(index)}
              >
                <TrashIcon />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => images.append({ url: "", alt: "" })}
          >
            <PlusIcon /> Add image
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.variants?.message ? (
            <p className="text-sm text-destructive">{errors.variants.message}</p>
          ) : null}
          {variants.fields.map((field, index) => (
            <div key={field.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <FormField
                  label="Size"
                  htmlFor={`variants.${index}.size`}
                  error={errors.variants?.[index]?.size?.message}
                >
                  <Input
                    id={`variants.${index}.size`}
                    {...register(`variants.${index}.size` as const)}
                  />
                </FormField>
                <FormField
                  label="Color"
                  htmlFor={`variants.${index}.color`}
                  error={errors.variants?.[index]?.color?.message}
                >
                  <Input
                    id={`variants.${index}.color`}
                    {...register(`variants.${index}.color` as const)}
                  />
                </FormField>
                <FormField
                  label="Color hex"
                  htmlFor={`variants.${index}.colorHex`}
                  error={errors.variants?.[index]?.colorHex?.message}
                >
                  <Input
                    id={`variants.${index}.colorHex`}
                    {...register(`variants.${index}.colorHex` as const)}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <FormField
                  label="SKU"
                  htmlFor={`variants.${index}.sku`}
                  error={errors.variants?.[index]?.sku?.message}
                >
                  <Input
                    id={`variants.${index}.sku`}
                    {...register(`variants.${index}.sku` as const)}
                  />
                </FormField>
                <FormField
                  label="Price override (cents)"
                  htmlFor={`variants.${index}.priceCents`}
                  error={errors.variants?.[index]?.priceCents?.message}
                >
                  <Input
                    id={`variants.${index}.priceCents`}
                    type="number"
                    {...register(`variants.${index}.priceCents` as const, {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                  />
                </FormField>
                <FormField
                  label="Inventory"
                  htmlFor={`variants.${index}.inventory`}
                  error={errors.variants?.[index]?.inventory?.message}
                >
                  <Input
                    id={`variants.${index}.inventory`}
                    type="number"
                    {...register(`variants.${index}.inventory` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </FormField>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => variants.remove(index)}
              >
                <TrashIcon /> Remove variant
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              variants.append({
                size: "",
                color: "",
                colorHex: "",
                sku: "",
                inventory: 0,
              })
            }
          >
            <PlusIcon /> Add variant
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save product"}
      </Button>
    </form>
  );
}
