import { FilterSortBar } from "@/components/product/filter-sort-bar"
import { ProductGrid } from "@/components/product/product-grid"
import { ProductPagination } from "@/components/product/product-pagination"
import {
  getProductFilterOptions,
  listProducts,
  type ProductSort,
} from "@/lib/products"

export type ProductListingSearchParams = {
  q?: string
  sort?: string
  page?: string
  sale?: string
  size?: string
  color?: string
  minPrice?: string
  maxPrice?: string
}

export async function ProductListing({
  basePath,
  categorySlug,
  collectionSlug,
  searchParams,
}: {
  basePath: string
  categorySlug?: string
  collectionSlug?: string
  searchParams: ProductListingSearchParams
}) {
  const page = Number(searchParams.page) || 1;
  const minPriceCents = searchParams.minPrice
    ? Math.round(Number(searchParams.minPrice) * 100)
    : undefined;
  const maxPriceCents = searchParams.maxPrice
    ? Math.round(Number(searchParams.maxPrice) * 100)
    : undefined;

  const [{ products, total, totalPages }, filterOptions] = await Promise.all([
    listProducts({
      categorySlug,
      collectionSlug,
      q: searchParams.q,
      sale: searchParams.sale === "true",
      size: searchParams.size,
      color: searchParams.color,
      minPriceCents,
      maxPriceCents,
      sort: searchParams.sort as ProductSort | undefined,
      page,
    }),
    getProductFilterOptions({ categorySlug, collectionSlug }),
  ]);

  return (
    <div className="space-y-6">
      <FilterSortBar total={total} filterOptions={filterOptions} />
      <ProductGrid products={products} />
      <ProductPagination
        basePath={basePath}
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </div>
  )
}
