import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { listCategories } from "@/lib/categories";
import type { Category } from "@/lib/generated/prisma/client";

const PRODUCT_INCLUDE = {
  images: { orderBy: { position: "asc" } },
  variants: true,
  category: true,
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_INCLUDE;
}>;

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name-asc";

export async function getFeaturedProducts(
  limit = 8,
): Promise<ProductWithRelations[]> {
  return db.product.findMany({
    where: { isPublished: true, isFeatured: true },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithRelations | null> {
  return db.product.findFirst({
    where: { slug, isPublished: true },
    include: PRODUCT_INCLUDE,
  });
}

function sortToOrderBy(sort: ProductSort | undefined): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { priceCents: "asc" };
    case "price-desc":
      return { priceCents: "desc" };
    case "name-asc":
      return { name: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function listProducts(params: {
  categorySlug?: string;
  collectionSlug?: string;
  q?: string;
  sale?: boolean;
  size?: string;
  color?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
}): Promise<{
  products: ProductWithRelations[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}> {
  const perPage = params.perPage ?? PRODUCTS_PER_PAGE;
  const page = Math.max(1, params.page ?? 1);

  // Combined into one variant filter (not two separate `some` clauses) so
  // "size=M, color=Red" requires a single variant that's both — not just any
  // variant matching size and any (possibly different) variant matching color.
  const variantWhere: Prisma.ProductVariantWhereInput = {
    ...(params.size ? { size: params.size } : {}),
    ...(params.color ? { color: params.color } : {}),
  };

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(params.categorySlug
      ? { category: { slug: params.categorySlug } }
      : {}),
    ...(params.collectionSlug
      ? { collections: { some: { collection: { slug: params.collectionSlug } } } }
      : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q } },
            { description: { contains: params.q } },
          ],
        }
      : {}),
    ...(params.sale ? { compareAtCents: { not: null } } : {}),
    ...(Object.keys(variantWhere).length > 0
      ? { variants: { some: variantWhere } }
      : {}),
    ...(params.minPriceCents != null || params.maxPriceCents != null
      ? {
          priceCents: {
            ...(params.minPriceCents != null ? { gte: params.minPriceCents } : {}),
            ...(params.maxPriceCents != null ? { lte: params.maxPriceCents } : {}),
          },
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: sortToOrderBy(params.sort),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

// Logical apparel-size ordering (XS...2XL), not alphabetical — anything not
// in this list (e.g. "One Size") sorts after the known sizes, alphabetically.
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

function compareSizes(a: string, b: string): number {
  const aIndex = SIZE_ORDER.indexOf(a);
  const bIndex = SIZE_ORDER.indexOf(b);
  if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  return aIndex - bIndex;
}

export type ProductFilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string | null }[];
  priceRange: { min: number; max: number };
};

// Scoped to the same category/collection the listing is already filtered
// to, so the filter UI never offers a size/color/price combination that
// would return zero results.
export async function getProductFilterOptions(params: {
  categorySlug?: string;
  collectionSlug?: string;
}): Promise<ProductFilterOptions> {
  const productWhere: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(params.categorySlug ? { category: { slug: params.categorySlug } } : {}),
    ...(params.collectionSlug
      ? { collections: { some: { collection: { slug: params.collectionSlug } } } }
      : {}),
  };

  const [variants, priceAgg] = await Promise.all([
    db.productVariant.findMany({
      where: { product: productWhere },
      select: { size: true, color: true, colorHex: true },
      distinct: ["size", "color"],
    }),
    db.product.aggregate({
      where: productWhere,
      _min: { priceCents: true },
      _max: { priceCents: true },
    }),
  ]);

  const sizes = Array.from(new Set(variants.map((v) => v.size))).sort(compareSizes);

  const colorMap = new Map<string, string | null>();
  for (const v of variants) {
    if (!colorMap.has(v.color)) colorMap.set(v.color, v.colorHex);
  }
  const colors = Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));

  return {
    sizes,
    colors,
    priceRange: {
      min: priceAgg._min.priceCents ?? 0,
      max: priceAgg._max.priceCents ?? 0,
    },
  };
}

export type CatalogSection = {
  category: Category;
  products: ProductWithRelations[];
  total: number;
};

// One preview section per category, for a full-catalog overview page.
export async function getCatalogSections(perCategory = 4): Promise<CatalogSection[]> {
  const categories = await listCategories();

  const sections = await Promise.all(
    categories.map(async (category) => {
      const { products, total } = await listProducts({
        categorySlug: category.slug,
        perPage: perCategory,
        sort: "newest",
      });
      return { category, products, total };
    }),
  );

  return sections.filter((section) => section.products.length > 0);
}

export async function getRelatedProducts(
  product: Pick<ProductWithRelations, "id" | "categoryId">,
  limit = 4,
): Promise<ProductWithRelations[]> {
  return db.product.findMany({
    where: {
      isPublished: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: PRODUCT_INCLUDE,
    take: limit,
  });
}
