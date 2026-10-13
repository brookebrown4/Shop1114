-- CreateTable
CREATE TABLE "ReferenceCatalogItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "catalog" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "swatchHex" TEXT,
    "imageUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ReferenceCatalogItem_catalog_idx" ON "ReferenceCatalogItem"("catalog");
