import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productSlug: string;
  productName: string;
  image?: string;
  size: string;
  color: string;
  // Display only — checkout always recomputes authoritative prices from the DB.
  unitPriceCentsDisplay: number;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (line, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.variantId === line.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.variantId === line.variantId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { ...line, quantity }] };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.variantId !== variantId)
              : state.items.map((item) =>
                  item.variantId === variantId ? { ...item, quantity } : item,
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "shop1114-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Zustand's persist middleware rehydrates from localStorage asynchronously
// after mount, so the store's initial value on the client briefly matches
// the server (empty). This hook reports true only once rehydration has
// actually finished, via useSyncExternalStore rather than an effect+setState.
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => useCartStore.persist.onFinishHydration(callback),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}

export function cartSubtotalCents(items: CartLine[]): number {
  return items.reduce(
    (sum, item) => sum + item.unitPriceCentsDisplay * item.quantity,
    0,
  );
}

export function cartItemCount(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
