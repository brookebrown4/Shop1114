"use client"

import { useMemo, useState } from "react"

import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { formatPrice } from "@/lib/format"
import { resolveVariantPriceCents } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { ProductWithRelations } from "@/lib/products"

export function VariantSelector({ product }: { product: ProductWithRelations }) {
  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size))),
    [product.variants],
  )
  const colors = useMemo(() => {
    const map = new Map<string, string | null>()
    for (const v of product.variants) map.set(v.color, v.colorHex);
    return Array.from(map.entries())
  }, [product.variants])

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.[0]);

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor,
  )
  const inStock = (selectedVariant?.inventory ?? 0) > 0
  const priceCents = selectedVariant
    ? resolveVariantPriceCents(selectedVariant, product)
    : product.priceCents

  const image = product.images[0]

  return (
    <div className="space-y-6">
      <p className="text-xl font-medium text-foreground">
        {formatPrice(priceCents)}
      </p>

      {sizes.length > 1 || sizes[0] !== "One Size" ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-lg border border-input px-3 text-sm font-medium transition-colors",
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium">Color</p>
        <div className="flex flex-wrap gap-2">
          {colors.map(([color, hex]) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => setSelectedColor(color)}
              aria-pressed={selectedColor === color}
              className={cn(
                "size-8 rounded-full border-2 transition-all",
                selectedColor === color
                  ? "border-primary"
                  : "border-transparent ring-1 ring-border",
              )}
              style={{ backgroundColor: hex ?? undefined }}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {selectedVariant
          ? inStock
            ? `${selectedVariant.inventory} in stock`
            : "Out of stock"
          : "Select a size and color"}
      </p>

      <AddToCartButton
        disabled={!inStock}
        line={
          selectedVariant
            ? {
                variantId: selectedVariant.id,
                productSlug: product.slug,
                productName: product.name,
                image: image?.url,
                size: selectedVariant.size,
                color: selectedVariant.color,
                unitPriceCentsDisplay: priceCents,
              }
            : null
        }
      />
    </div>
  )
}
