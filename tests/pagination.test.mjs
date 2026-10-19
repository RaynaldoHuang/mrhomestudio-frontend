import assert from "node:assert/strict"
import test from "node:test"
import { paginate, paginationPages } from "../src/lib/pagination.ts"

const items = Array.from({ length: 35 }, (_, index) => index + 1)

test("pagination slices without missing or repeating products", () => {
  const pages = [1, 2, 3].map((page) => paginate(items, page, 16))
  assert.deepEqual(pages.flatMap((page) => page.items), items)
  assert.deepEqual([pages[2].start, pages[2].end, pages[2].totalPages], [33, 35, 3])
})

test("invalid pages and reduced results stay on a valid page", () => {
  for (const input of [null, "bad", -1, 1.5, Infinity, 0]) {
    assert.equal(paginate(items, input, 10).page, 1)
  }
  assert.equal(paginate(items.slice(0, 5), 4, 10).page, 1)
  assert.deepEqual(paginate([], 3, 10), { page: 1, totalPages: 1, items: [], start: 0, end: 0 })
})

test("page navigation stays compact for large catalogs", () => {
  assert.deepEqual(paginationPages(1, 3), [1, 2, 3])
  assert.deepEqual(paginationPages(50, 100), [1, "ellipsis", 49, 50, 51, "ellipsis", 100])
  assert.deepEqual(paginationPages(1, 100), [1, 2, "ellipsis", 100])
})
