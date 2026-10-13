"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useCartStore, type CartLine } from "@/lib/store/cart"
import { useCartUiStore } from "@/lib/store/cart-ui"

export function AddToCartButton({
  disabled,
  line,
  quantity = 1,
}: {
  disabled?: boolean
  line: Omit<CartLine, "quantity"> | null
  quantity?: number
}) {
  const addItem = useCartStore((state) => state.addItem)
  const open = useCartUiStore((state) => state.open)

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={disabled || !line}
      onClick={() => {
        if (!line) return
        addItem(line, quantity)
        toast.success(`${line.productName} added to cart`)
        open()
      }}
    >
      {disabled ? "Out of stock" : "Add to cart"}
    </Button>
  )
}
