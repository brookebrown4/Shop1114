"use client"

import { ShoppingBagIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cartItemCount, useCartStore } from "@/lib/store/cart"
import { useCartUiStore } from "@/lib/store/cart-ui"

export function CartTrigger() {
  const count = useCartStore((state) => cartItemCount(state.items))
  const open = useCartUiStore((state) => state.open)

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={open}>
      <ShoppingBagIcon />
      {count > 0 ? (
        <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
          {count}
        </Badge>
      ) : null}
      <span className="sr-only">Cart</span>
    </Button>
  )
}
