import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react"

import { CartContext, type AddCartItem } from "@/contexts/cart-context"
import { synchronizeCart } from "@/lib/cart-items"
import { cartStorageKey, createCartStore } from "@/lib/cart-store"
import { getProduct, ProductApiError, type Product } from "@/lib/product-api"

function getCartStorage(): Storage | undefined {
  try { return window.localStorage } catch { return undefined }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createCartStore(getCartStorage()))
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const [isSyncing, setIsSyncing] = useState(items.length > 0)
  const [syncError, setSyncError] = useState(false)
  const syncSequence = useRef(0)
  const productKey = [...new Set(items.map((item) => item.productId))].sort((a, b) => a - b).join(",")

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if ((event.key === cartStorageKey || event.key === null) && event.storageArea === getCartStorage()) store.reload()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [store])

  const refreshProducts = useCallback(async () => {
    const sequence = ++syncSequence.current
    const productIds = [...new Set(store.getSnapshot().map((item) => item.productId))]
    if (productIds.length === 0) {
      setIsSyncing(false)
      setSyncError(false)
      return
    }
    setIsSyncing(true)
    const results = await Promise.allSettled(productIds.map(async (productId): Promise<[number, Product | null]> => {
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
    store.refresh((current) => synchronizeCart(current, products))
    setSyncError(results.some((result) => result.status === "rejected"))
    setIsSyncing(false)
  }, [store])

  useEffect(() => {
    const onFocus = () => { store.reload(); void refreshProducts() }
    const initialRefresh = window.setTimeout(onFocus, 0)
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearTimeout(initialRefresh)
      window.removeEventListener("focus", onFocus)
    }
  }, [refreshProducts, productKey, store])

  const value = useMemo(() => {
    const addItem = (item: AddCartItem) => {
      const id = `${item.productId}-${item.colour.toLowerCase()}`
      store.update((current) => {
        const existing = current.find((cartItem) => cartItem.id === id
          || (cartItem.productId === item.productId && cartItem.colour === item.colour))
        const quantity = Math.min(Number.MAX_SAFE_INTEGER, (existing?.quantity ?? 0) + item.quantity)
        if (!existing) return [...current, { ...item, id, quantity }]
        return current.map((cartItem) => cartItem.id === existing.id ? { ...item, id: existing.id, quantity } : cartItem)
      })
    }

    const updateQuantity = (id: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity)) return
      store.update((current) => current.map((item) => {
        if (item.id !== id || item.unavailableReason) return item
        return { ...item, quantity: Math.max(1, quantity) }
      }))
    }

    return {
      items,
      isSyncing: items.length > 0 && isSyncing,
      syncError: items.length > 0 && syncError,
      refreshProducts,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.filter((item) => !item.unavailableReason).reduce((total, item) => total + item.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem: (id: string) => store.update((current) => current.filter((item) => item.id !== id)),
      clearCart: () => store.update(() => []),
    }
  }, [items, isSyncing, syncError, refreshProducts, store])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
