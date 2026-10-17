import { parseStoredCart, type CartItem } from "./cart-items.ts"

export const cartStorageKey = "mr-home-audio-cart"
type CartStorage = Pick<Storage, "getItem" | "setItem">

export function createCartStore(storage?: CartStorage) {
  let activeStorage = storage
  let items: CartItem[] = []
  let lastStoredValue: string | null | undefined
  const listeners = new Set<() => void>()

  function readItems(): CartItem[] {
    if (!activeStorage) return items
    try {
      const stored = activeStorage.getItem(cartStorageKey)
      if (stored === lastStoredValue) return items
      const next = stored ? parseStoredCart(JSON.parse(stored)) : []
      lastStoredValue = stored
      return next
    } catch {
      return items
    }
  }

  function publish(next: CartItem[]) {
    if (JSON.stringify(items) === JSON.stringify(next)) return
    items = next
    listeners.forEach((listener) => listener())
  }

  items = readItems()

  return {
    getSnapshot: () => items,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    reload() { publish(readItems()) },
    update(change: (current: CartItem[]) => CartItem[]) {
      const next = change(readItems())
      try {
        const serialized = JSON.stringify(next)
        activeStorage?.setItem(cartStorageKey, serialized)
        lastStoredValue = serialized
      } catch {
        // Keep this tab's changes usable when browser storage cannot be written.
        activeStorage = undefined
      }
      publish(next)
    },
    refresh(change: (current: CartItem[]) => CartItem[]) {
      // Product refreshes must never write an older cart over another tab's edits.
      publish(change(readItems()))
    },
  }
}
