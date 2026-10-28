import assert from "node:assert/strict"
import test from "node:test"
import { formatProductPrice, productPriceRange, selectedProductPrice, variantCombinations } from "../src/lib/product-pricing.ts"
import { synchronizeCart } from "../src/lib/cart-items.ts"
import { emptyCatalogFilters, filterCatalogProducts } from "../src/lib/catalog-filters.ts"

const product = {
  id: 1, name: "Speaker", price: 1000000, is_active: true, thumbnail_url: null, images: [],
  variants: [{ name: "Color", values: ["Black", "White"] }, { name: "Size", values: ["Small", "Large"] }],
  variant_prices: [
    { options: ["Black", "Small"], price: 800000 },
    { options: ["White", "Large"], price: 1500000 },
  ],
}

test("front price shows the cheapest variant and includes base prices for unspecified combinations", () => {
  assert.equal(formatProductPrice(product), "Mulai dari Rp800.000")
  assert.deepEqual(productPriceRange(product), { min: 800000, max: 1500000 })
  assert.deepEqual(productPriceRange({ ...product, variant_prices: [{ options: ["Black", "Small"], price: 1500000 }] }), { min: 1000000, max: 1500000 })
})

test("equal variant prices ignore unused base price and omit the starting-price label", () => {
  const samePrice = { ...product, variant_prices: variantCombinations(product.variants).map((options) => ({ options, price: 1250000 })) }
  assert.equal(formatProductPrice(samePrice), "Rp1.250.000")
  assert.deepEqual(productPriceRange(samePrice), { min: 1250000, max: 1250000 })
  assert.equal(formatProductPrice({ ...product, variants: [], variant_prices: [] }), "Rp1.000.000")
})

test("selection requires every option and prices the exact combination with base fallback", () => {
  assert.equal(selectedProductPrice(product, {}), undefined)
  assert.equal(selectedProductPrice(product, { Color: "Black" }), undefined)
  assert.equal(selectedProductPrice(product, { Color: "Red", Size: "Large" }), undefined)
  assert.equal(selectedProductPrice(product, { Color: "White", Size: "Large" }), 1500000)
  assert.equal(selectedProductPrice(product, { Color: "White", Size: "Small" }), 1000000)
  assert.equal(selectedProductPrice({ ...product, variants: [], variant_prices: [] }, {}), 1000000)
  assert.equal(selectedProductPrice({ ...product, variant_prices: [{ options: ["Black", "Small"], price: 0 }] }, { Color: "Black", Size: "Small" }), 0)
})

test("cart refresh keeps each combination's current price for totals and WhatsApp", () => {
  const items = [
    { id: "1-black", productId: 1, name: "Old", price: 1, colour: "Old", image: null, quantity: 2, selectedVariants: { Color: "Black", Size: "Small" } },
    { id: "1-white", productId: 1, name: "Old", price: 1, colour: "Old", image: null, quantity: 3, selectedVariants: { Color: "White", Size: "Large" } },
  ]
  const refreshed = synchronizeCart(items, new Map([[1, product]]))
  assert.deepEqual(refreshed.map((item) => item.price), [800000, 1500000])
  assert.equal(refreshed.reduce((sum, item) => sum + item.price * item.quantity, 0), 6100000)
  assert.ok(refreshed.every((item) => !item.unavailableReason))
})

test("price filters use the displayed starting price", () => {
  assert.equal(filterCatalogProducts([product], emptyCatalogFilters(), "", "900000").length, 1)
  assert.equal(filterCatalogProducts([product], emptyCatalogFilters(), "900000", "").length, 0)
})

test("combination generation is deterministic and limits oversized products", () => {
  assert.deepEqual(variantCombinations(product.variants), [["Black", "Small"], ["Black", "Large"], ["White", "Small"], ["White", "Large"]])
  assert.deepEqual(variantCombinations([]), [])
  assert.deepEqual(variantCombinations([{ name: "Many", values: Array.from({ length: 501 }, (_, index) => String(index)) }]), [])
})
