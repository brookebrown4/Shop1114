"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { CartLineList } from "@/components/cart/cart-line-list"
import { cartSubtotalCents, useCartStore } from "@/lib/store/cart"
import { useCartUiStore } from "@/lib/store/cart-ui"
import { formatPrice } from "@/lib/format"

export function CartSheet() {
  const isOpen = useCartUiStore((state) => state.isOpen)
  const close = useCartUiStore((state) => state.close)
  const items = useCartStore((state) => state.items)
  const subtotal = cartSubtotalCents(items)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <CartLineList />
        </div>
        {items.length > 0 ? (
          <SheetFooter>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Button
              size="lg"
              className="w-full"
              nativeButton={false}
              render={<Link href="/checkout" onClick={close} />}
            >
              Checkout
            </Button>
            <Button
              variant="outline"
              className="w-full"
              nativeButton={false}
              render={<Link href="/cart" onClick={close} />}
            >
              View cart
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
