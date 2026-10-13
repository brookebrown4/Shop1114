import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { CategorySidebar } from "@/components/product/category-sidebar";
import {
  ProductListing,
  type ProductListingSearchParams,
} from "@/components/product/product-listing";
import { getCollectionBySlug } from "@/lib/collections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  return { title: collection?.name ?? "Collection" };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ProductListingSearchParams>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const search = await searchParams;

  return (
    <div>
      {collection.heroImage ? (
        <div className="relative h-56 w-full sm:h-72">
          <Image
            src={collection.heroImage}
            alt={collection.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">
              {collection.name}
            </h1>
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
        <CategorySidebar />
        <div className="flex-1">
          {!collection.heroImage ? (
            <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
              {collection.name}
            </h1>
          ) : null}
          <ProductListing
            basePath={`/collection/${slug}`}
            collectionSlug={slug}
            searchParams={search}
          />
        </div>
      </div>
    </div>
  );
}
