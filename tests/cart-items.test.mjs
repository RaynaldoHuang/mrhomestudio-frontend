import assert from "node:assert/strict"
import test from "node:test"
import { parseStoredCart, synchronizeCart } from "../src/lib/cart-items.ts"

const cartItem = (overrides = {}) => ({
  id: "1-color: aluminium", productId: 1, name: "Old product", price: 100,
  colour: "Color: Aluminium", image: "/old.jpg", quantity: 3, ...overrides,
})
const product = (overrides = {}) => ({
  id: 1, name: "Admin product name", price: 46550000, stock: 10, is_active: true,
  thumbnail_url: "/admin-cover.webp", images: [{ url: "/admin-cover.webp" }],
  variants: [{ name: "Color", values: ["Aluminium", "Black"] }], ...overrides,
})

test("cart uses the latest admin name, price and cover for existing saved items", () => {
  const [item] = synchronizeCart([cartItem()], new Map([[1, product()]]))
  assert.equal(item.name, "Admin product name")
  assert.equal(item.price * item.quantity, 139650000)
  assert.equal(item.image, "/admin-cover.webp")
  assert.equal(item.colour, "Color: Aluminium")
  assert.deepEqual(item.selectedVariants, { Color: "Aluminium" })
  assert.equal(item.unavailableReason, undefined)
})

test("a changed image replaces the old snapshot and deleted images do not use a sample", () => {
  const [item] = synchronizeCart([cartItem()], new Map([[1, product({ thumbnail_url: null, images: [] })]]))
  assert.equal(item.image, null)
})

test("legacy stock values no longer limit quantities across variants", () => {
  const second = cartItem({ id: "1-black", colour: "Color: Black", quantity: 4 })
  const items = synchronizeCart([cartItem(), second], new Map([[1, product({ stock: 5 })]]))
  assert.deepEqual(items.map((item) => item.quantity), [3, 4])
  assert.ok(items.every((item) => !item.unavailableReason))
})

test("multiple variants remain orderable despite legacy stock limits", () => {
  const second = cartItem({ id: "1-black", colour: "Color: Black", quantity: 1 })
  const items = synchronizeCart([cartItem(), second], new Map([[1, product({ stock: 2 })]]))
  assert.equal(items[0].quantity, 3)
  assert.equal(items[1].unavailableReason, undefined)
})

test("deleted and inactive products remain identifiable but cannot be ordered", () => {
  for (const latest of [null, product({ is_active: false })]) {
    const [item] = synchronizeCart([cartItem()], new Map([[1, latest]]))
    assert.equal(item.unavailableReason, "This product is no longer available.")
    assert.equal(item.name, "Old product")
  }
})

test("temporary fetch failures preserve the saved item instead of deleting it", () => {
  const original = cartItem()
  assert.deepEqual(synchronizeCart([original], new Map()), [original])
})

test("removed colors require a new selection instead of silently changing the order", () => {
  const [item] = synchronizeCart([cartItem({ selectedVariants: { Color: "Aluminium" } })], new Map([[1, product({ variants: [{ name: "Color", values: ["White"] }] })]]))
  assert.match(item.unavailableReason, /variant is no longer available/)
  assert.equal(item.colour, "Color: Aluminium")
})

test("removing all variants does not silently convert a selected color into Standard", () => {
  const [item] = synchronizeCart([cartItem()], new Map([[1, product({ variants: [] })]]))
  assert.match(item.unavailableReason, /variant is no longer available/)
})

test("standard products remain orderable and newly added variant groups require a selection", () => {
  const standard = cartItem({ colour: "Standard" })
  const [valid] = synchronizeCart([standard], new Map([[1, product({ variants: [] })]]))
  assert.equal(valid.unavailableReason, undefined)
  const [invalid] = synchronizeCart([standard], new Map([[1, product()]]))
  assert.match(invalid.unavailableReason, /variant is no longer available/)
})

test("restoring availability clears the old warning and refreshes price", () => {
  const [item] = synchronizeCart([cartItem({ unavailableReason: "Out of stock.", stock: 0 })], new Map([[1, product()]]))
  assert.equal(item.unavailableReason, undefined)
  assert.equal(item.price, 46550000)
})

test("corrupt browser storage is ignored while valid old carts are retained", () => {
  const valid = cartItem()
  assert.deepEqual(parseStoredCart({ items: [valid] }), [])
  assert.deepEqual(parseStoredCart([null, valid, cartItem({ quantity: -1 }), cartItem({ selectedVariants: null })]), [valid])
})

test("zero legacy stock does not block an active product", () => {
  const [item] = synchronizeCart([cartItem({ quantity: 10, stock: 0, unavailableReason: "Out of stock." })], new Map([[1, product({ stock: 0 })]]))
  assert.equal(item.quantity, 10)
  assert.equal(item.unavailableReason, undefined)
})
