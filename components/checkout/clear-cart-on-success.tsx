"use client";

import { useEffect, useRef } from "react";

import { useCartStore } from "@/lib/store/cart";

export function ClearCartOnSuccess({ confirmed }: { confirmed: boolean }) {
  const clear = useCartStore((state) => state.clear);
  const hasCleared = useRef(false);

  useEffect(() => {
    if (confirmed && !hasCleared.current) {
      hasCleared.current = true;
      clear();
    }
  }, [confirmed, clear]);

  return null;
}
