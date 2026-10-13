"use client"

import Image from "next/image"
import Link from "next/link"
import { MinusIcon, PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { useCartStore } from "@/lib/store/cart"

export function CartLineList() {
  const items = useCartStore((state) => state.items)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Your cart is empty.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.variantId} className="flex gap-3">
          <Link
            href={`/product/${item.productSlug}`}
            className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
          >
            {item.image ? (
              <Image
                src={item.image}
                alt={item.productName}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : null}
          </Link>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/product/${item.productSlug}`}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  {item.productName}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.size} / {item.color}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.variantId)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove item"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <MinusIcon />
                </Button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <PlusIcon />
                </Button>
              </div>
              <span className="text-sm font-medium">
                {formatPrice(item.unitPriceCentsDisplay * item.quantity)}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
