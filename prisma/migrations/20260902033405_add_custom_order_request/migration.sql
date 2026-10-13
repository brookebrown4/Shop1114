-- CreateTable
CREATE TABLE "CustomOrderRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "productName" TEXT,
    "productSlug" TEXT,
    "variantLabel" TEXT,
    "placement" TEXT,
    "monogramText" TEXT,
    "fontName" TEXT,
    "monogramStyleName" TEXT,
    "designName" TEXT,
    "threadColorName" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
