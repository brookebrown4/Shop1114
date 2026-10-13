-- DropIndex
DROP INDEX "ReferenceCatalogItem_catalog_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceCatalogItem_catalog_name_key" ON "ReferenceCatalogItem"("catalog", "name");
