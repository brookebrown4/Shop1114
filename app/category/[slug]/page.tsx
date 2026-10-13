import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategorySidebar } from "@/components/product/category-sidebar";
import {
  ProductListing,
  type ProductListingSearchParams,
} from "@/components/product/product-listing";
import { getCategoryBySlug } from "@/lib/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ProductListingSearchParams>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const search = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
      <CategorySidebar activeCategorySlug={slug} />
      <div className="flex-1">
        <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
          {category.name}
        </h1>
        <ProductListing
          basePath={`/category/${slug}`}
          categorySlug={slug}
          searchParams={search}
        />
      </div>
    </div>
  );
}
