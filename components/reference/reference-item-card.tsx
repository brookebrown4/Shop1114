import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ReferenceItemPreview } from "@/components/reference/reference-item-preview";
import type { ReferenceCatalogItem } from "@/lib/generated/prisma/client";

export function ReferenceItemCard({ item }: { item: ReferenceCatalogItem }) {
  return (
    <div>
      <AspectRatio
        ratio={1}
        className="overflow-hidden rounded-xl bg-muted shadow-sm ring-1 ring-border"
      >
        <ReferenceItemPreview item={item} />
      </AspectRatio>
      <p className="mt-2 text-sm font-medium text-foreground">{item.name}</p>
      {item.description ? (
        <p className="text-xs text-muted-foreground">{item.description}</p>
      ) : null}
    </div>
  );
}
