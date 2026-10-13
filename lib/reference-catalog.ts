import { db } from "@/lib/db";
import type { ReferenceCatalogItem } from "@/lib/generated/prisma/client";
import {
  REFERENCE_CATALOGS,
  type ReferenceCatalogSlug,
} from "@/lib/reference-catalog-constants";

export async function listReferenceCatalogItems(
  catalog: ReferenceCatalogSlug,
): Promise<ReferenceCatalogItem[]> {
  return db.referenceCatalogItem.findMany({
    where: { catalog },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

export type ReferenceCatalogSection = {
  catalog: (typeof REFERENCE_CATALOGS)[number];
  items: ReferenceCatalogItem[];
};

export async function getReferenceCatalogSections(): Promise<
  ReferenceCatalogSection[]
> {
  const allItems = await db.referenceCatalogItem.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return REFERENCE_CATALOGS.map((catalog) => ({
    catalog,
    items: allItems.filter((item) => item.catalog === catalog.slug),
  }));
}

export async function getReferenceCatalogItem(
  id: string,
): Promise<ReferenceCatalogItem | null> {
  return db.referenceCatalogItem.findUnique({ where: { id } });
}
