import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { CartContext, type AddCartItem, type CartItem } from "@/contexts/cart-context"
import { parseStoredCart, synchronizeCart } from "@/lib/cart-items"
import { getProduct, ProductApiError, type Product } from "@/lib/product-api"

const storageKey = "mr-home-audio-cart"

function getStoredItems(): CartItem[] {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? parseStoredCart(JSON.parse(stored)) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getStoredItems)
  const [isSyncing, setIsSyncing] = useState(items.length > 0)
  const [syncError, setSyncError] = useState(false)
  const syncSequence = useRef(0)
  const productKey = [...new Set(items.map((item) => item.productId))].sort((a, b) => a - b).join(",")

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
    } catch {
      // Keep the in-memory cart usable if browser storage is unavailable.
    }
  }, [items])

  const refreshProducts = useCallback(async () => {
    if (!productKey) return
    const sequence = ++syncSequence.current
    setIsSyncing(true)
    const results = await Promise.allSettled(productKey.split(",").map(async (id): Promise<[number, Product | null]> => {
      const productId = Number(id)
      try {
        return [productId, await getProduct(productId)]
      } catch (error) {
        if (error instanceof ProductApiError && error.status === 404) return [productId, null]
        throw error
      }
    }))
    if (sequence !== syncSequence.current) return
    const products = new Map<number, Product | null>()
    results.forEach((result) => {
      if (result.status === "fulfilled") products.set(...result.value)
    })
    setItems((current) => synchronizeCart(current, products))
    setSyncError(results.some((result) => result.status === "rejected"))
    setIsSyncing(false)
  }, [productKey])

  useEffect(() => {
    const onFocus = () => { void refreshProducts() }
    const initialRefresh = window.setTimeout(onFocus, 0)
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearTimeout(initialRefresh)
      window.removeEventListener("focus", onFocus)
    }
  }, [refreshProducts])

  const value = useMemo(() => {
    const addItem = (item: AddCartItem) => {
      const id = `${item.productId}-${item.colour.toLowerCase()}`
      setItems((current) => {
        const existing = current.find((cartItem) => cartItem.id === id)
        const quantity = Math.min(Number.MAX_SAFE_INTEGER, (existing?.quantity ?? 0) + item.quantity)
        if (!existing) return [...current, { ...item, id, quantity }]
        return current.map((cartItem) => cartItem.id === id ? { ...item, id, quantity } : cartItem)
      })
    }

    const updateQuantity = (id: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity)) return
      setItems((current) => current.map((item) => {
        if (item.id !== id || item.unavailableReason) return item
        return { ...item, quantity: Math.max(1, quantity) }
      }))
    }

    return {
      items,
      isSyncing,
      syncError,
      refreshProducts,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.filter((item) => !item.unavailableReason).reduce((total, item) => total + item.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem: (id: string) => setItems((current) => current.filter((item) => item.id !== id)),
      clearCart: () => setItems([]),
    }
  }, [items, isSyncing, syncError, refreshProducts])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
