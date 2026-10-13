import Image from "next/image";

import { fontFamilyFor } from "@/lib/custom-order-preview";
import type { ReferenceCatalogItem } from "@/lib/generated/prisma/client";

// Sample initials used to render an actual monogram-style preview instead of
// a blank placeholder — arrangement (not typeface) is what's being shown.
const SAMPLE_INITIALS = ["J", "D", "M"] as const;

function MonogramPreview({ styleName }: { styleName: string }) {
  const lower = styleName.toLowerCase();
  const [first, middle, last] = SAMPLE_INITIALS;

  if (lower.includes("single")) {
    return (
      <span className="font-heading text-6xl font-semibold">{first}</span>
    );
  }

  if (lower.includes("stacked")) {
    return (
      <div className="flex flex-col items-center gap-0.5 font-heading text-2xl leading-none font-semibold">
        <span>{first}</span>
        <span>{middle}</span>
        <span>{last}</span>
      </div>
    );
  }

  if (lower.includes("diamond")) {
    return (
      <div className="flex flex-col items-center gap-0.5 font-heading leading-none font-semibold">
        <span className="text-lg">{first}</span>
        <span className="text-6xl">{last}</span>
        <span className="text-lg">{middle}</span>
      </div>
    );
  }

  // Default: 3-letter circle — first & last large, middle smaller and centered.
  return (
    <div className="flex items-baseline gap-1.5 font-heading font-semibold">
      <span className="text-5xl">{first}</span>
      <span className="text-xl">{middle}</span>
      <span className="text-5xl">{last}</span>
    </div>
  );
}

function FontPreview({ name }: { name: string }) {
  const fontFamily = fontFamilyFor(name);
  return (
    <div className="flex size-full flex-col items-center justify-center gap-1">
      <span className="text-4xl" style={{ fontFamily }}>
        Aa
      </span>
      <span className="text-xs text-muted-foreground" style={{ fontFamily }}>
        Shop 1114
      </span>
    </div>
  );
}

// Renders whatever preview a reference-catalog item actually has: an
// uploaded photo, a thread-color swatch, or — for fonts and monogram
// styles, neither of which have real assets yet — a live rendered sample
// instead of a blank "No preview" box. Shared by the public gallery and the
// admin manager so both stay in sync.
export function ReferenceItemPreview({ item }: { item: ReferenceCatalogItem }) {
  if (item.imageUrl) {
    return (
      <Image
        src={item.imageUrl}
        alt={item.name}
        fill
        sizes="(min-width: 1024px) 20vw, 33vw"
        className="object-cover"
      />
    );
  }

  if (item.swatchHex) {
    return <div className="size-full" style={{ backgroundColor: item.swatchHex }} />;
  }

  if (item.catalog === "fonts") {
    return <FontPreview name={item.name} />;
  }

  if (item.catalog === "monogram-styles") {
    return (
      <div className="flex size-full items-center justify-center">
        <MonogramPreview styleName={item.name} />
      </div>
    );
  }

  return (
    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
      No preview
    </div>
  );
}
