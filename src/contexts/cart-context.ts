import { createContext, useContext } from "react"

export type CartItem = {
  id: string
  productId: number
  name: string
  price: number
  colour: string
  image: string | null
  quantity: number
}

export type AddCartItem = Omit<CartItem, "id">

export type CartContextValue = {
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
