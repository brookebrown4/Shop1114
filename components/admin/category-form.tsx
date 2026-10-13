"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormField } from "@/components/form/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

export function CategoryForm({
  defaultValues,
  action,
}: {
  defaultValues?: CategoryInput;
  action: (input: CategoryInput) => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues ?? { name: "", slug: "" },
  });

  async function onSubmit(data: CategoryInput) {
    setIsSubmitting(true);
    const result = await action(data);
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" {...register("name")} />
      </FormField>
      <FormField label="Slug" htmlFor="slug" error={errors.slug?.message}>
        <Input id="slug" {...register("slug")} />
      </FormField>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save category"}
      </Button>
    </form>
  );
}
