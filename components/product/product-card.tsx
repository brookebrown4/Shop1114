import Image from "next/image"
import Link from "next/link"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/format"
import type { ProductWithRelations } from "@/lib/products"

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = product.images[0]
  const onSale =
    product.compareAtCents !== null &&
    product.compareAtCents > product.priceCents

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <AspectRatio
        ratio={4 / 5}
        className="overflow-hidden rounded-xl bg-muted shadow-sm transition-shadow duration-300 group-hover:shadow-lg"
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {onSale ? (
          <Badge className="absolute top-2 left-2 bg-sale text-sale-foreground">
            Sale
          </Badge>
        ) : null}
      </AspectRatio>
      <div className="mt-3 space-y-0.5">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <h3 className="font-medium text-foreground">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {formatPrice(product.priceCents)}
          </span>
          {onSale ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtCents!)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
