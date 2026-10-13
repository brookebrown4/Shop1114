import { Logo } from "@/components/layout/logo"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserNav } from "@/components/layout/user-nav"
import { CartTrigger } from "@/components/cart/cart-trigger"
import { CartSheet } from "@/components/cart/cart-sheet"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <MobileNav />
          <Logo />
          <MainNav />
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <CartTrigger />
          <UserNav />
        </div>
      </div>
      <CartSheet />
    </header>
  )
}
