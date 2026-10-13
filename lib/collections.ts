import { db } from "@/lib/db";
import type { Collection } from "@/lib/generated/prisma/client";

export async function listCollections(): Promise<Collection[]> {
  return db.collection.findMany({ orderBy: { name: "asc" } });
}

export async function getCollectionBySlug(
  slug: string,
): Promise<Collection | null> {
  return db.collection.findUnique({ where: { slug } });
}
