import { db } from "@/lib/db";
import type { Category } from "@/lib/generated/prisma/client";

export async function listCategories(): Promise<Category[]> {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return db.category.findUnique({ where: { slug } });
}

export type CategoryWithImage = {
  id: string;
  name: string;
  slug: string;
  image: { url: string; alt: string } | null;
};

export async function listCategoriesWithImage(): Promise<CategoryWithImage[]> {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { isPublished: true },
        take: 1,
        orderBy: { createdAt: "asc" },
        include: {
          images: { take: 1, orderBy: { position: "asc" } },
        },
      },
    },
  });

  return categories.map((category) => {
    const image = category.products[0]?.images[0];
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: image ? { url: image.url, alt: image.alt } : null,
    };
  });
}
