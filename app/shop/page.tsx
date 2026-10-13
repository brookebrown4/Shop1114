import type { Metadata } from "next";

import { CategorySidebar } from "@/components/product/category-sidebar";
import {
  ProductListing,
  type ProductListingSearchParams,
} from "@/components/product/product-listing";

export const metadata: Metadata = {
  title: "Shop",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ProductListingSearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
      <CategorySidebar
        activeShopAll={params.sale !== "true"}
        activeSale={params.sale === "true"}
      />
      <div className="flex-1">
        <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
          {params.sale === "true" ? "On Sale" : "Shop All"}
        </h1>
        <ProductListing basePath="/shop" searchParams={params} />
      </div>
    </div>
  );
}
