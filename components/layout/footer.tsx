import Link from "next/link"

import { Logo } from "@/components/layout/logo"
import { NAV_LINKS } from "@/components/layout/nav-links"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Custom embroidery, stitched to order right here at Shop 1114.
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SHOP1114. All rights reserved.
      </div>
    </footer>
  )
}
