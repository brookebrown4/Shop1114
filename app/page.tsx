import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HeroCategoryCarousel } from "@/components/product/hero-category-carousel";
import { ProductGrid } from "@/components/product/product-grid";
import { getFeaturedProducts } from "@/lib/products";
import { listCategoriesWithImage } from "@/lib/categories";
import { HOW_IT_WORKS_STEPS } from "@/lib/site-content";

export default async function Home() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    listCategoriesWithImage(),
  ]);

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-semibold tracking-wide text-foreground uppercase">
              Local &amp; custom embroidery
            </p>
            <h1 className="font-heading mt-3 text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Your idea, beautifully stitched.
            </h1>
            <p className="mt-5 max-w-md text-muted-foreground">
              Whatever the occasion — a personal gift, a growing business, or
              a team to outfit — we bring it to life with custom embroidery
              made just for you. Every piece is thoughtfully designed,
              hand-stitched, and finished with care, right here at Shop 1114.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/custom" />}>
                Start a custom order
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/shop" />}
              >
                Shop the collection
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/shop?sale=true" />}
              >
                See what&apos;s on sale
              </Button>
            </div>
          </div>
          <HeroCategoryCarousel categories={categories} />
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-heading text-center text-2xl font-semibold tracking-tight">
            How custom orders work
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <p className="mt-3 text-sm font-medium">{step.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Featured
            </h2>
            <Link
              href="/shop"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <ProductGrid products={featured} />
        </div>
      </section>
    </div>
  );
}
