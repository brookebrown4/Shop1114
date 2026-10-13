import type { ReactNode } from "react";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { listCategories } from "@/lib/categories";
import { cn } from "@/lib/utils";

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

export async function CategorySidebar({
  activeShopAll,
  activeSale,
  activeCategorySlug,
}: {
  activeShopAll?: boolean;
  activeSale?: boolean;
  activeCategorySlug?: string;
}) {
  const categories = await listCategories();

  return (
    <nav className="w-full shrink-0 space-y-1 lg:w-48">
      <SidebarLink href="/shop" active={!!activeShopAll}>
        Shop all
      </SidebarLink>
      <SidebarLink href="/shop?sale=true" active={!!activeSale}>
        On sale
      </SidebarLink>
      <Separator className="my-2" />
      {categories.map((category) => (
        <SidebarLink
          key={category.id}
          href={`/category/${category.slug}`}
          active={category.slug === activeCategorySlug}
        >
          {category.name}
        </SidebarLink>
      ))}
    </nav>
  );
}
