import { createContext, useContext } from "react"

import type { CartItem } from "@/lib/cart-items"
export type { CartItem } from "@/lib/cart-items"

export type AddCartItem = Omit<CartItem, "id">

export type CartContextValue = {
  isSyncing: boolean
  syncError: boolean
  refreshProducts: () => Promise<void>
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: AddCartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }

  return context
}
