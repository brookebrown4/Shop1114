import Link from "next/link"

import { NAV_LINKS } from "@/components/layout/nav-links"

export function MainNav() {
  return (
    <nav className="hidden items-center gap-6 md:flex">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
