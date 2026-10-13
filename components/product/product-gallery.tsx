"use client"

import { useState } from "react"
import Image from "next/image"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { cn } from "@/lib/utils"
import type { ProductImage } from "@/lib/generated/prisma/client"

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  if (!current) {
    return <AspectRatio ratio={4 / 5} className="rounded-xl bg-muted" />
  }

  return (
    <div className="space-y-3">
      <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-xl bg-muted shadow-sm">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </AspectRatio>
      {images.length > 1 ? (
        <div className="flex gap-2">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 overflow-hidden rounded-lg ring-1 ring-border",
                active === i && "ring-2 ring-primary",
              )}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
