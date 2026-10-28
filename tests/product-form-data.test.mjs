import assert from "node:assert/strict"
import test from "node:test"
import { toProductFormData } from "../src/lib/product-form-data.ts"

const values = {
  name: "Copied Speaker", category: "", category_id: null, brand_id: null,
  price: 100, description: "Speaker", is_active: false, show_on_home: false,
  specifications: [], variants: [], images: [], remove_image_ids: [],
}

test("explicitly submits cleared variants and specifications instead of omitting them", () => {
  const data = toProductFormData(values)
  assert.equal(data.get("variants"), "")
  assert.equal(data.get("specifications"), "")
})

test("submits remaining rows and variant values without an empty reset field", () => {
  const data = toProductFormData({
    ...values,
    specifications: [{ name: "Weight", value: "12 kg" }],
    variants: [{ name: "Color", values: ["Black", "White"] }],
  })
  assert.equal(data.has("variants"), false)
  assert.equal(data.has("specifications"), false)
  assert.equal(data.get("variants[0][name]"), "Color")
  assert.equal(data.get("variants[0][values][0]"), "Black")
  assert.equal(data.get("variants[0][values][1]"), "White")
  assert.equal(data.get("specifications[0][name]"), "Weight")
  assert.equal(data.get("specifications[0][value]"), "12 kg")
})

test("submits combination prices including zero, and explicitly clears removed prices", () => {
  const data = toProductFormData({
    ...values,
    variant_prices: [{ options: ["Black", "128 GB"], price: 0 }],
  })
  assert.equal(data.get("variant_prices[0][price]"), "0")
  assert.equal(data.get("variant_prices[0][options][0]"), "Black")
  assert.equal(data.get("variant_prices[0][options][1]"), "128 GB")
  assert.equal(data.has("variant_prices"), false)
  assert.equal(toProductFormData({ ...values, variant_prices: [] }).get("variant_prices"), "")
})
