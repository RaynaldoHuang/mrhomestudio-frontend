import assert from "node:assert/strict"
import test from "node:test"
import { catalogFilterGroups, emptyCatalogFilters, filterCatalogProducts } from "../src/lib/catalog-filters.ts"

const products = [
  { id: 1, category_id: 10, category: "Speaker", brand: "Marantz", price: 5_000_000 },
  { id: 2, category_id: 10, category: "Speaker", brand: " marantz ", price: 10_000_000 },
  { id: 3, category_id: 20, category: "Amplifier", brand: "Accuphase", price: 20_000_000 },
  { id: 4, category_id: null, category: "Legacy", brand: null, price: 0 },
]

test("catalog facets contain category and brand with deduplicated counts", () => {
  const groups = catalogFilterGroups(products)
  assert.deepEqual(groups.map((group) => group.key), ["category", "brand"])
  assert.deepEqual(groups[1].options, [
    { label: "Accuphase", value: "accuphase", count: 1 },
    { label: "Marantz", value: "marantz", count: 2 },
  ])
  assert.equal(groups[0].options.find((option) => option.value === "id:10").count, 2)
})

test("multiple values in a filter use OR and different filters use AND", () => {
  const filters = { category: ["id:10", "id:20"], brand: ["marantz", "accuphase"] }
  assert.deepEqual(filterCatalogProducts(products, filters, "5000000", "20000000").map((product) => product.id), [1, 2, 3])
  assert.deepEqual(filterCatalogProducts(products, { ...filters, category: ["id:10"] }, "", "").map((product) => product.id), [1, 2])
})

test("price boundaries are inclusive and can be one sided or zero", () => {
  const filters = emptyCatalogFilters()
  assert.deepEqual(filterCatalogProducts(products, filters, "5000000", "10000000").map((product) => product.id), [1, 2])
  assert.deepEqual(filterCatalogProducts(products, filters, "10000000", "").map((product) => product.id), [2, 3])
  assert.deepEqual(filterCatalogProducts(products, filters, "", "0").map((product) => product.id), [4])
  assert.deepEqual(filterCatalogProducts(products, filters, "20000000", "5000000"), [])
})

test("reset includes products with missing metadata and legacy categories remain filterable", () => {
  assert.deepEqual(filterCatalogProducts(products, emptyCatalogFilters(), "", ""), products)
  assert.deepEqual(filterCatalogProducts(products, { ...emptyCatalogFilters(), category: ["legacy"] }, "", "").map((product) => product.id), [4])
  assert.deepEqual(catalogFilterGroups([]).map((group) => group.options), [[], []])
})
