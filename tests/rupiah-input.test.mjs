import assert from "node:assert/strict"
import test from "node:test"
import { formatRupiahInput } from "../src/lib/rupiah-input.ts"

test("formats rupiah in groups of three while keeping the numeric amount", () => {
  assert.deepEqual(formatRupiahInput("46550000"), { text: "46.550.000", amount: 46550000, caret: 10 })
  assert.equal(formatRupiahInput("999").text, "999")
  assert.equal(formatRupiahInput("1000").text, "1.000")
})

test("accepts pasted rupiah amounts and normalizes leading zeroes", () => {
  assert.equal(formatRupiahInput("Rp 46.550.000").amount, 46550000)
  assert.equal(formatRupiahInput("0001234").text, "1.234")
})

test("allows clearing the field and entering zero", () => {
  assert.deepEqual(formatRupiahInput(""), { text: "", amount: 0, caret: 0 })
  assert.deepEqual(formatRupiahInput("0"), { text: "0", amount: 0, caret: 1 })
})

test("preserves the cursor next to the edited digits when inserting in the middle", () => {
  assert.deepEqual(formatRupiahInput("46.9550.000", 4), { text: "469.550.000", amount: 469550000, caret: 3 })
  assert.equal(formatRupiahInput("1.234", 0).caret, 0)
})

test("removing a separator moves the cursor before it for the next deletion", () => {
  assert.deepEqual(formatRupiahInput("46550.000", 2), { text: "46.550.000", amount: 46550000, caret: 2 })
})
