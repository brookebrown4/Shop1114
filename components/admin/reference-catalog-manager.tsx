"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReferenceItemFormDialog } from "@/components/admin/reference-item-form-dialog";
import { ReferenceItemPreview } from "@/components/reference/reference-item-preview";
import { deleteReferenceItem } from "@/app/admin/reference-catalog/actions";
import { REFERENCE_CATALOGS } from "@/lib/reference-catalog-constants";
import type { ReferenceCatalogSection } from "@/lib/reference-catalog";
import type { ReferenceCatalogItem } from "@/lib/generated/prisma/client";

export function ReferenceCatalogManager({
  sections,
}: {
  sections: ReferenceCatalogSection[];
}) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<ReferenceCatalogItem | null>(null);
  const [addingCatalog, setAddingCatalog] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function handleDelete(item: ReferenceCatalogItem) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setIsDeleting(item.id);
    const result = await deleteReferenceItem(item.id);
    setIsDeleting(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Item deleted");
    router.refresh();
  }

  return (
    <>
      <Tabs defaultValue={REFERENCE_CATALOGS[0].slug}>
        <TabsList>
          {REFERENCE_CATALOGS.map((catalog) => (
            <TabsTrigger key={catalog.slug} value={catalog.slug}>
              {catalog.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map(({ catalog, items }) => (
          <TabsContent key={catalog.slug} value={catalog.slug} className="space-y-4 pt-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setAddingCatalog(catalog.slug)}>
                <PlusIcon /> Add item
              </Button>
            </div>
            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                Not uploaded yet
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="space-y-2 rounded-lg border border-border p-3"
                  >
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-muted">
                      <ReferenceItemPreview item={item} />
                    </div>
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <PencilIcon /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting === item.id}
                        onClick={() => handleDelete(item)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <ReferenceItemFormDialog
        open={addingCatalog !== null}
        catalog={addingCatalog ?? REFERENCE_CATALOGS[0].slug}
        onOpenChange={(open) => !open && setAddingCatalog(null)}
        onSuccess={() => {
          setAddingCatalog(null);
          router.refresh();
        }}
      />
      <ReferenceItemFormDialog
        open={editingItem !== null}
        catalog={editingItem?.catalog ?? REFERENCE_CATALOGS[0].slug}
        item={editingItem ?? undefined}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSuccess={() => {
          setEditingItem(null);
          router.refresh();
        }}
      />
    </>
  );
}
