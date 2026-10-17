import assert from "node:assert/strict"
import test from "node:test"
import { cartStorageKey, createCartStore } from "../src/lib/cart-store.ts"
import { synchronizeCart } from "../src/lib/cart-items.ts"

const item = { id: "1-standard", productId: 1, name: "Speaker", price: 100, colour: "Standard", image: null, quantity: 1 }

function browserStorage(initial = [item]) {
  const values = new Map([[cartStorageKey, JSON.stringify(initial)]])
  const writes = []
  return {
    writes,
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) { writes.push(value); values.set(key, value) },
  }
}

test("remove is persisted synchronously and stays removed after reload or a new app instance", () => {
  const storage = browserStorage()
  const store = createCartStore(storage)
  store.update((items) => items.filter((entry) => entry.id !== item.id))
  assert.equal(storage.getItem(cartStorageKey), "[]")
  assert.deepEqual(createCartStore(storage).getSnapshot(), [])
  store.reload()
  assert.deepEqual(store.getSnapshot(), [])
})

test("a stale tab refreshing product data cannot restore another tab's removed item", async () => {
  const storage = browserStorage()
  const firstTab = createCartStore(storage)
  const staleTab = createCartStore(storage)
  let completeRequest
  const request = new Promise((resolve) => { completeRequest = resolve })
  const refresh = request.then((products) => staleTab.refresh((items) => synchronizeCart(items, products)))
  firstTab.update(() => [])
  completeRequest(new Map([[1, { ...item, is_active: true, variants: [], thumbnail_url: null, images: [] }]]))
  await refresh
  assert.deepEqual(staleTab.getSnapshot(), [])
  assert.equal(storage.getItem(cartStorageKey), "[]")
  assert.equal(storage.writes.length, 1)
})

test("mutations in a stale tab use current storage without reviving removed entries", () => {
  const storage = browserStorage()
  const firstTab = createCartStore(storage)
  const staleTab = createCartStore(storage)
  firstTab.update(() => [])
  const secondItem = { ...item, id: "2-standard", productId: 2 }
  staleTab.update((items) => [...items, secondItem])
  assert.deepEqual(JSON.parse(storage.getItem(cartStorageKey)), [secondItem])
  firstTab.reload()
  assert.deepEqual(firstTab.getSnapshot(), [secondItem])
})

test("storage changes notify subscribers without writing the snapshot back", () => {
  const storage = browserStorage()
  const store = createCartStore(storage)
  let notifications = 0
  const unsubscribe = store.subscribe(() => notifications++)
  storage.setItem(cartStorageKey, "[]")
  store.reload()
  store.reload()
  assert.equal(notifications, 1)
  assert.equal(storage.writes.length, 1)
  unsubscribe()
})

test("opening an empty cart does not seed products or write browser storage", () => {
  const storage = browserStorage([])
  assert.deepEqual(createCartStore(storage).getSnapshot(), [])
  assert.equal(storage.writes.length, 0)
})

test("refreshed metadata survives quantity changes when persisted cart has not changed", () => {
  const storage = browserStorage()
  const store = createCartStore(storage)
  store.refresh((items) => items.map((entry) => ({ ...entry, price: 200, unavailableReason: "Removed variant" })))
  store.update((items) => items.map((entry) => entry.unavailableReason ? entry : { ...entry, quantity: 2 }))
  assert.equal(store.getSnapshot()[0].quantity, 1)
  assert.equal(store.getSnapshot()[0].price, 200)
  assert.equal(store.getSnapshot()[0].unavailableReason, "Removed variant")
})

test("cart remains usable when storage is blocked or writes fail", () => {
  const storage = browserStorage()
  storage.setItem = () => { throw new Error("Quota exceeded") }
  const store = createCartStore(storage)
  store.update(() => [])
  store.reload()
  assert.deepEqual(store.getSnapshot(), [])
  const memoryOnly = createCartStore()
  memoryOnly.update(() => [item])
  assert.deepEqual(memoryOnly.getSnapshot(), [item])
})
