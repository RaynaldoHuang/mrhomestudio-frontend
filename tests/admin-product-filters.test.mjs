import assert from "node:assert/strict"
import test from "node:test"
import { adminProductFilterOptions, filterAdminProducts, matchesProductSearch } from "../src/lib/admin-product-filters.ts"

const products = [
  { id: 1, name: "Audio Note DAC 0.1X", brand: "Audio Note", brand_id: 4, category: "DACs", category_id: 10, is_active: true },
  { id: 2, name: "Vindicator Silver", brand: "Audio Note", brand_id: 4, category: "Power Amplifiers", category_id: 11, is_active: false },
  { id: 3, name: "Streamer", brand: "Marantz", brand_id: 5, category: "DACs", category_id: 10, is_active: true },
  { id: 4, name: "Unassigned", brand: null, brand_id: null, category: null, category_id: null, is_active: false },
]

test("search matches case-insensitive words across product name, brand and category", () => {
  assert.deepEqual(filterAdminProducts(products, "  AUDIO   silver power ", "all", "all").map((product) => product.id), [2])
  assert.deepEqual(filterAdminProducts(products, "DACs", "all", "all").map((product) => product.id), [1, 3])
  assert.equal(matchesProductSearch({ ...products[0], name: "Café Audio" }, "cafe"), true)
})

test("search, brand and category apply together and include inactive admin products", () => {
  assert.deepEqual(filterAdminProducts(products, "", "4", "10").map((product) => product.id), [1])
  assert.deepEqual(filterAdminProducts(products, "silver", "4", "11").map((product) => product.id), [2])
  assert.deepEqual(filterAdminProducts(products, "silver", "5", "11"), [])
})

test("unassigned filters and resets preserve products with missing metadata", () => {
  assert.deepEqual(filterAdminProducts(products, "", "none", "none").map((product) => product.id), [4])
  assert.deepEqual(filterAdminProducts(products, "", "all", "all"), products)
  assert.deepEqual(filterAdminProducts(products, "missing", "all", "all"), [])
})

test("filter IDs keep identically named categories separate", () => {
  const sameLabels = [{ ...products[0], category_id: 12 }, products[0]]
  assert.deepEqual(filterAdminProducts(sameLabels, "", "all", "10"), [products[0]])
})

test("filter options include master records and categories absent from the master response", () => {
  const options = adminProductFilterOptions(products, "category", [{ id: 10, name: "DACs" }, { id: 20, name: "Turntables" }])
  assert.deepEqual(options, [
    { value: "10", label: "DACs" }, { value: "11", label: "Power Amplifiers" }, { value: "20", label: "Turntables" },
  ])
})

test("legacy category labels remain filterable without mixing them with unassigned products", () => {
  const legacy = { ...products[3], category: " Old   Category " }
  const options = adminProductFilterOptions([legacy, products[3]], "category", [])
  assert.equal(options[0].value, "legacy:old category")
  assert.deepEqual(filterAdminProducts([legacy, products[3]], "", "all", options[0].value), [legacy])
})
