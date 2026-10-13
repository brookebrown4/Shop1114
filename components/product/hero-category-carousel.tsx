"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import type { CategoryWithImage } from "@/lib/categories";

export function HeroCategoryCarousel({
  categories,
}: {
  categories: CategoryWithImage[];
}) {
  const slides = categories.filter((category) => category.image !== null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 3000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <AspectRatio
      ratio={4 / 3}
      className="overflow-hidden rounded-2xl bg-muted shadow-xl"
    >
      {slides.map((category, i) => (
        <div
          key={category.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={category.image!.url}
            alt={category.image!.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority={i === 0}
          />
          <span className="absolute bottom-4 left-4 rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
            {category.name}
          </span>
        </div>
      ))}
    </AspectRatio>
  );
}
