import { useEffect, useMemo, useState, type ReactNode } from "react"

import { CartContext, type AddCartItem, type CartItem } from "@/contexts/cart-context"

const storageKey = "mr-home-audio-cart"

function getStoredItems(): CartItem[] {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? JSON.parse(stored) as CartItem[] : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getStoredItems)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items])

  const value = useMemo(() => {
    const addItem = (item: AddCartItem) => {
      const id = `${item.productId}-${item.colour.toLowerCase()}`

      setItems((current) => {
        const existing = current.find((cartItem) => cartItem.id === id)
        if (!existing) return [...current, { ...item, id }]

        return current.map((cartItem) =>
          cartItem.id === id
            ? { ...cartItem, quantity: Math.min(99, cartItem.quantity + item.quantity) }
            : cartItem,
        )
      })
    }

    const updateQuantity = (id: string, quantity: number) => {
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, quantity: Math.min(99, Math.max(1, quantity)) } : item,
        ),
      )
    }

    const removeItem = (id: string) => {
      setItems((current) => current.filter((item) => item.id !== id))
    }

    const clearCart = () => setItems([])

    return {
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
