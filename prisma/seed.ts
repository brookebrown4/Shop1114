import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function inventoryFor(seed: string): number {
  return hashCode(seed) % 31; // deterministic, occasionally 0 (out of stock)
}

// Catalog shape for a local custom-embroidery shop: apparel and goods sold as
// blanks ready for embroidery (personal, business, or team orders), plus a
// couple of house-embroidered samples.
const CATEGORIES = [
  { slug: "tees", name: "T-Shirts" },
  { slug: "polos", name: "Polos" },
  { slug: "hoodies", name: "Hoodies & Fleece" },
  { slug: "outerwear", name: "Outerwear" },
  { slug: "headwear", name: "Headwear" },
  { slug: "bags", name: "Bags" },
] as const;

// Categories from an earlier catalog revision (pants, socks) that don't fit
// a custom-embroidery shop's typical offering — removed on seed.
const REMOVED_CATEGORY_SLUGS = ["bottoms", "accessories"];
const REMOVED_PRODUCT_SLUGS = [
  "relaxed-cargo-pants",
  "tapered-sweatpants",
  "denim-jeans-straight",
  "crew-socks-3-pack",
  "cropped-hoodie",
];

const COLLECTIONS = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    heroImage: "https://picsum.photos/seed/shop1114-new-arrivals/1600/700",
  },
  {
    slug: "core-essentials",
    name: "Core Essentials",
    heroImage: "https://picsum.photos/seed/shop1114-core-essentials/1600/700",
  },
] as const;

const COLORS = {
  black: { name: "Black", hex: "#18181b" },
  white: { name: "White", hex: "#f8f8f6" },
  stone: { name: "Heather Gray", hex: "#a8a29e" },
  olive: { name: "Olive", hex: "#4d5339" },
  navy: { name: "Navy", hex: "#1e2a3a" },
  sand: { name: "Sand", hex: "#d8c9a3" },
  charcoal: { name: "Charcoal", hex: "#3f3f46" },
  cream: { name: "Cream", hex: "#f0ead6" },
  rust: { name: "Rust", hex: "#7c4a3a" },
  natural: { name: "Natural", hex: "#e5ded0" },
} as const;

type ColorKey = keyof typeof COLORS;

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const ONE_SIZE = ["One Size"];

type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  compareAtCents?: number;
  categorySlug: (typeof CATEGORIES)[number]["slug"];
  isFeatured?: boolean;
  isPublished?: boolean;
  collectionSlugs?: string[];
  sizes: string[];
  colors: ColorKey[];
};

// Real, category-relevant photos (verified free-to-use Unsplash photos, no
// visible third-party brand logos). Cycled per product within a category
// unless a product has a more specific match in PRODUCT_IMAGE_OVERRIDES.
const UNSPLASH_PARAMS = "w=800&h=1000&fit=crop&q=80";
type SeedImage = { url: string; alt: string };

const CATEGORY_IMAGES: Record<(typeof CATEGORIES)[number]["slug"], SeedImage[]> = {
  tees: [
    {
      url: `https://images.unsplash.com/photo-1778671394516-8270eac13c42?${UNSPLASH_PARAMS}`,
      alt: "White crew neck t-shirt hanging, front view",
    },
  ],
  polos: [
    {
      url: `https://images.unsplash.com/photo-1671438118097-479e63198629?${UNSPLASH_PARAMS}`,
      alt: "Plain white polo shirt on a hanger",
    },
  ],
  hoodies: [
    {
      url: `https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?${UNSPLASH_PARAMS}`,
      alt: "Person wearing a hoodie, front view",
    },
  ],
  outerwear: [
    {
      url: `https://images.unsplash.com/photo-1602082805057-3c32f79817a1?${UNSPLASH_PARAMS}`,
      alt: "Denim jacket on a hanger",
    },
    {
      url: `https://images.unsplash.com/photo-1533230464445-e01ef07c65c5?${UNSPLASH_PARAMS}`,
      alt: "Jackets hanging on wall hooks",
    },
  ],
  headwear: [
    {
      url: `https://images.unsplash.com/photo-1588850561407-ed78c282e89b?${UNSPLASH_PARAMS}`,
      alt: "White structured trucker cap",
    },
  ],
  bags: [
    {
      url: `https://images.unsplash.com/photo-1780480999319-ba6a502ed72c?${UNSPLASH_PARAMS}`,
      alt: "Canvas tote bag flat lay",
    },
    {
      url: `https://images.unsplash.com/photo-1758542988969-39a10168b2ce?${UNSPLASH_PARAMS}`,
      alt: "Black duffel bag",
    },
  ],
};

// Exact matches for products whose category pool isn't specific enough.
const PRODUCT_IMAGE_OVERRIDES: Record<string, SeedImage> = {
  "denim-trucker-jacket": {
    url: `https://images.unsplash.com/photo-1602082805057-3c32f79817a1?${UNSPLASH_PARAMS}`,
    alt: "Denim trucker jacket on a hanger",
  },
  "logo-beanie": {
    url: `https://images.unsplash.com/photo-1521071381475-44a6edc53727?${UNSPLASH_PARAMS}`,
    alt: "Person wearing a knit beanie",
  },
  "canvas-tote-bag": {
    url: `https://images.unsplash.com/photo-1780480999319-ba6a502ed72c?${UNSPLASH_PARAMS}`,
    alt: "Canvas tote bag flat lay",
  },
};

function imageForProduct(product: ProductSeed, indexInCategory: number): SeedImage {
  const override = PRODUCT_IMAGE_OVERRIDES[product.slug];
  if (override) return override;
  const pool = CATEGORY_IMAGES[product.categorySlug];
  return pool[indexInCategory % pool.length];
}

const PRODUCTS: ProductSeed[] = [
  {
    slug: "classic-crew-tee",
    name: "Classic Crew Tee",
    description:
      "Soft, heavyweight cotton crew tee — our best-selling blank for custom embroidery, from a single monogram to a full team order.",
    priceCents: 2800,
    categorySlug: "tees",
    collectionSlugs: ["core-essentials"],
    sizes: APPAREL_SIZES,
    colors: ["black", "white", "stone", "navy"],
  },
  {
    slug: "boxy-fit-tee",
    name: "Boxy Fit Tee",
    description:
      "A relaxed, boxy silhouette in soft-washed jersey, with plenty of flat space up front for custom embroidery.",
    priceCents: 3200,
    compareAtCents: 3800,
    categorySlug: "tees",
    sizes: APPAREL_SIZES,
    colors: ["cream", "olive"],
  },
  {
    slug: "graphic-logo-tee",
    name: "Embroidered Logo Tee",
    description:
      "Our house tee, finished with the SHOP1114 logo embroidered on the chest — a preview of what we can stitch onto yours.",
    priceCents: 3400,
    categorySlug: "tees",
    isFeatured: true,
    collectionSlugs: ["new-arrivals"],
    sizes: APPAREL_SIZES,
    colors: ["black", "cream"],
  },
  {
    slug: "classic-pique-polo",
    name: "Classic Pique Polo",
    description:
      "A durable cotton-pique polo built for business and team orders — clean lines that let custom embroidery take center stage.",
    priceCents: 3400,
    categorySlug: "polos",
    isFeatured: true,
    collectionSlugs: ["new-arrivals"],
    sizes: APPAREL_SIZES,
    colors: ["white", "navy", "black"],
  },
  {
    slug: "performance-polo",
    name: "Performance Polo",
    description:
      "Moisture-wicking performance polo for teams on the move, with a smooth chest panel ready for your logo.",
    priceCents: 3800,
    categorySlug: "polos",
    sizes: APPAREL_SIZES,
    colors: ["black", "navy", "stone"],
  },
  {
    slug: "heavyweight-pullover-hoodie",
    name: "Heavyweight Pullover Hoodie",
    description:
      "14oz fleece pullover hoodie with a brushed interior — heavy enough to carry a full-back embroidery design.",
    priceCents: 6800,
    categorySlug: "hoodies",
    isFeatured: true,
    collectionSlugs: ["new-arrivals", "core-essentials"],
    sizes: APPAREL_SIZES,
    colors: ["black", "stone", "charcoal"],
  },
  {
    slug: "zip-up-hoodie",
    name: "Zip-Up Hoodie",
    description:
      "Full-zip fleece hoodie with ribbed cuffs and hem, embroidered to order for personal, business, or team wear.",
    priceCents: 7200,
    compareAtCents: 8400,
    categorySlug: "hoodies",
    sizes: APPAREL_SIZES,
    colors: ["navy", "charcoal"],
  },
  {
    slug: "quarter-zip-pullover",
    name: "Quarter-Zip Pullover",
    description:
      "A classic quarter-zip pullover in soft fleece — the go-to choice for embroidered business and team uniforms.",
    priceCents: 5800,
    categorySlug: "hoodies",
    sizes: APPAREL_SIZES,
    colors: ["navy", "charcoal", "stone"],
  },
  {
    slug: "nylon-track-jacket",
    name: "Nylon Track Jacket",
    description:
      "Lightweight shell jacket with taped seams and a clean back panel, ready for custom embroidery or a team crest.",
    priceCents: 8800,
    categorySlug: "outerwear",
    isFeatured: true,
    collectionSlugs: ["new-arrivals"],
    sizes: APPAREL_SIZES,
    colors: ["black", "olive"],
  },
  {
    slug: "puffer-vest",
    name: "Puffer Vest",
    description:
      "Insulated puffer vest for layering in cold weather, with a left-chest spot reserved for your embroidered logo.",
    priceCents: 9200,
    categorySlug: "outerwear",
    sizes: APPAREL_SIZES,
    colors: ["black", "rust"],
  },
  {
    slug: "denim-trucker-jacket",
    name: "Denim Trucker Jacket",
    description: "Classic trucker jacket in rigid selvedge denim.",
    priceCents: 9800,
    categorySlug: "outerwear",
    isPublished: false,
    sizes: APPAREL_SIZES,
    colors: ["navy"],
  },
  {
    slug: "structured-twill-cap",
    name: "Structured Twill Cap",
    description:
      "A classic 6-panel structured cap with a crisp front panel — our most popular base for embroidered logos and monograms.",
    priceCents: 2400,
    categorySlug: "headwear",
    sizes: ONE_SIZE,
    colors: ["black", "navy", "white"],
  },
  {
    slug: "logo-beanie",
    name: "Knit Beanie",
    description: "Ribbed knit beanie, ready for an embroidered patch or monogram.",
    priceCents: 2200,
    categorySlug: "headwear",
    sizes: ONE_SIZE,
    colors: ["black", "stone", "rust"],
  },
  {
    slug: "canvas-tote-bag",
    name: "Canvas Tote Bag",
    description:
      "Heavyweight canvas tote with an interior pocket — a popular pick for embroidered gifts and giveaways.",
    priceCents: 1800,
    categorySlug: "bags",
    sizes: ONE_SIZE,
    colors: ["natural"],
  },
  {
    slug: "duffel-bag",
    name: "Duffel Bag",
    description:
      "A durable canvas duffel with reinforced handles, perfect for an embroidered team or business crest.",
    priceCents: 5400,
    categorySlug: "bags",
    collectionSlugs: ["core-essentials"],
    sizes: ONE_SIZE,
    colors: ["black", "natural"],
  },
];

type ReferenceItemSeed = {
  catalog: "thread-colors" | "fonts" | "monogram-styles" | "designs";
  name: string;
  description?: string;
  swatchHex?: string;
  imageUrl?: string;
  position: number;
};

const REFERENCE_CATALOG_ITEMS: ReferenceItemSeed[] = [
  // Thread colors — a standard embroidery thread palette.
  { catalog: "thread-colors", name: "Black", swatchHex: "#1a1a1a", position: 0 },
  { catalog: "thread-colors", name: "White", swatchHex: "#f5f5f0", position: 1 },
  { catalog: "thread-colors", name: "Navy", swatchHex: "#1e2a3a", position: 2 },
  { catalog: "thread-colors", name: "Royal Blue", swatchHex: "#1e4d9b", position: 3 },
  { catalog: "thread-colors", name: "Forest Green", swatchHex: "#1f4d2c", position: 4 },
  { catalog: "thread-colors", name: "Cardinal Red", swatchHex: "#a3242f", position: 5 },
  { catalog: "thread-colors", name: "Burgundy", swatchHex: "#6b1f2a", position: 6 },
  { catalog: "thread-colors", name: "Gold", swatchHex: "#c9a227", position: 7 },
  { catalog: "thread-colors", name: "Silver Gray", swatchHex: "#a8a29e", position: 8 },
  { catalog: "thread-colors", name: "Charcoal", swatchHex: "#3f3f46", position: 9 },
  {
    catalog: "thread-colors",
    name: "Metallic Gold",
    description: "Specialty metallic thread for a raised, reflective finish.",
    swatchHex: "#cfa646",
    position: 10,
  },
  {
    catalog: "thread-colors",
    name: "Neon Pink",
    description: "Specialty fluorescent thread that pops on dark garments.",
    swatchHex: "#ff2fa0",
    position: 11,
  },

  // Font options — no real font files uploaded yet, so these are named
  // styles the shop can actually stitch; the live preview approximates them
  // with a close web-safe font (see lib/custom-order-preview.ts).
  {
    catalog: "fonts",
    name: "Classic Block",
    description: "Bold, clean block letters. Highly legible at small sizes.",
    position: 0,
  },
  {
    catalog: "fonts",
    name: "Elegant Script",
    description: "Flowing cursive script for a personal, formal feel.",
    position: 1,
  },
  {
    catalog: "fonts",
    name: "Varsity Collegiate",
    description: "Chunky collegiate-style lettering, great for team gear.",
    position: 2,
  },
  {
    catalog: "fonts",
    name: "Modern Sans",
    description: "Minimal, contemporary sans-serif lettering.",
    position: 3,
  },
  {
    catalog: "fonts",
    name: "Old English",
    description: "Classic blackletter style for a bold, traditional look.",
    position: 4,
  },

  // Monogram styles — arrangement, not typeface.
  {
    catalog: "monogram-styles",
    name: "3-Letter Circle",
    description:
      "First & last initials large, middle initial centered and smaller.",
    position: 0,
  },
  {
    catalog: "monogram-styles",
    name: "Diamond Monogram",
    description:
      "Three initials in a diamond arrangement, last name centered and larger.",
    position: 1,
  },
  {
    catalog: "monogram-styles",
    name: "Stacked Initials",
    description: "Initials stacked vertically, all the same size.",
    position: 2,
  },
  {
    catalog: "monogram-styles",
    name: "Single Initial",
    description: "One bold letter, clean and simple.",
    position: 3,
  },

  // Designs available — stock designs customers can pick instead of typing
  // text, shown with real embroidery photos.
  {
    catalog: "designs",
    name: "Floral Bouquet",
    description: "A stitched bouquet of daisies and wildflowers.",
    imageUrl: `https://images.unsplash.com/photo-1766418393788-dc829192ab5f?${UNSPLASH_PARAMS}`,
    position: 0,
  },
  {
    catalog: "designs",
    name: "Cross-Stitch Bluebell",
    description: "A delicate cross-stitched bluebell spray.",
    imageUrl: `https://images.unsplash.com/photo-1765218305153-aef09f3dd4fb?${UNSPLASH_PARAMS}`,
    position: 1,
  },
];

async function main() {
  console.log("Removing products outside the current catalog...");
  await db.product.deleteMany({ where: { slug: { in: REMOVED_PRODUCT_SLUGS } } });

  console.log("Seeding categories...");
  const categoryBySlug = new Map<string, string>();
  for (const category of CATEGORIES) {
    const row = await db.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    categoryBySlug.set(category.slug, row.id);
  }

  console.log("Seeding collections...");
  const collectionBySlug = new Map<string, string>();
  for (const collection of COLLECTIONS) {
    const row = await db.collection.upsert({
      where: { slug: collection.slug },
      update: { name: collection.name, heroImage: collection.heroImage },
      create: collection,
    });
    collectionBySlug.set(collection.slug, row.id);
  }

  console.log("Seeding products...");
  const categoryProductIndex = new Map<string, number>();
  for (const product of PRODUCTS) {
    const categoryId = categoryBySlug.get(product.categorySlug);
    if (!categoryId) throw new Error(`Unknown category ${product.categorySlug}`);

    const indexInCategory = categoryProductIndex.get(product.categorySlug) ?? 0;
    categoryProductIndex.set(product.categorySlug, indexInCategory + 1);

    const row = await db.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        compareAtCents: product.compareAtCents ?? null,
        categoryId,
        isFeatured: product.isFeatured ?? false,
        isPublished: product.isPublished ?? true,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        compareAtCents: product.compareAtCents ?? null,
        categoryId,
        isFeatured: product.isFeatured ?? false,
        isPublished: product.isPublished ?? true,
      },
    });

    const image = imageForProduct(product, indexInCategory);
    await db.productImage.deleteMany({ where: { productId: row.id } });
    await db.productImage.create({
      data: {
        productId: row.id,
        url: image.url,
        alt: image.alt,
        position: 0,
      },
    });

    for (const size of product.sizes) {
      for (const colorKey of product.colors) {
        const color = COLORS[colorKey];
        const sku = `SHOP1114-${product.slug.toUpperCase()}-${size.replace(/\s+/g, "")}-${colorKey.toUpperCase()}`;
        await db.productVariant.upsert({
          where: { sku },
          update: {
            productId: row.id,
            size,
            color: color.name,
            colorHex: color.hex,
            inventory: inventoryFor(sku),
          },
          create: {
            productId: row.id,
            size,
            color: color.name,
            colorHex: color.hex,
            sku,
            inventory: inventoryFor(sku),
          },
        });
      }
    }

    for (const collectionSlug of product.collectionSlugs ?? []) {
      const collectionId = collectionBySlug.get(collectionSlug);
      if (!collectionId) throw new Error(`Unknown collection ${collectionSlug}`);
      await db.productCollection.upsert({
        where: {
          productId_collectionId: { productId: row.id, collectionId },
        },
        update: {},
        create: { productId: row.id, collectionId },
      });
    }
  }

  console.log("Removing categories outside the current catalog...");
  await db.category.deleteMany({ where: { slug: { in: REMOVED_CATEGORY_SLUGS } } });

  console.log("Seeding reference catalog...");
  for (const item of REFERENCE_CATALOG_ITEMS) {
    await db.referenceCatalogItem.upsert({
      where: { catalog_name: { catalog: item.catalog, name: item.name } },
      update: {
        description: item.description ?? null,
        swatchHex: item.swatchHex ?? null,
        imageUrl: item.imageUrl ?? null,
        position: item.position,
      },
      create: {
        catalog: item.catalog,
        name: item.name,
        description: item.description ?? null,
        swatchHex: item.swatchHex ?? null,
        imageUrl: item.imageUrl ?? null,
        position: item.position,
      },
    });
  }

  console.log("Seeding users...");
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const customerPasswordHash = await bcrypt.hash("Customer123!", 10);

  await db.user.upsert({
    where: { email: "admin@shop1114.test" },
    update: { passwordHash: adminPasswordHash, role: "admin", name: "Admin" },
    create: {
      email: "admin@shop1114.test",
      passwordHash: adminPasswordHash,
      role: "admin",
      name: "Admin",
    },
  });

  await db.user.upsert({
    where: { email: "customer@shop1114.test" },
    update: {
      passwordHash: customerPasswordHash,
      role: "customer",
      name: "Test Customer",
    },
    create: {
      email: "customer@shop1114.test",
      passwordHash: customerPasswordHash,
      role: "customer",
      name: "Test Customer",
    },
  });

  console.log("\nSeed complete. Dev-only test accounts:");
  console.log("  admin@shop1114.test / Admin123!");
  console.log("  customer@shop1114.test / Customer123!\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
