import assert from "node:assert/strict"
import test from "node:test"
import { parseVariantValues } from "../src/lib/variant-values.ts"

test("parses multiple colors and trims whitespace for submission", () => {
  assert.deepEqual(parseVariantValues("Black, White,  Walnut, Silver"), ["Black", "White", "Walnut", "Silver"])
})

test("handles trailing commas and removes empty or duplicate values", () => {
  assert.deepEqual(parseVariantValues("Black, , White, Black,"), ["Black", "White"])
})

test("does not split spaces within a color name", () => {
  assert.deepEqual(parseVariantValues("Matte Black, Pearl White"), ["Matte Black", "Pearl White"])
})

test("returns no values for an empty or comma-only field", () => {
  assert.deepEqual(parseVariantValues(" , , "), [])
  assert.deepEqual(parseVariantValues(""), [])
})
