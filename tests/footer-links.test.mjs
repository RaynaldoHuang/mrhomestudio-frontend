import assert from "node:assert/strict"
import test from "node:test"
import { footerCatalogLinks } from "../src/lib/footer-links.ts"

const category = (id, slug, overrides = {}) => ({ id, slug, name: slug, is_active: true, ...overrides })
const link = (id, label, slug) => ({ category_id: id, label, href: `/collection/${slug}` })
const menu = (overrides = {}) => ({ label: "Source", href: "/collection/source", is_active: true, groups: [{ title: "Digital", links: [link(1, "DACs", "dacs")] }], ...overrides })

test("uses the current menu and link labels in menu order", () => {
  assert.deepEqual(footerCatalogLinks([menu()], [category(1, "dacs", { name: "Old name" })]), {
    productLinks: [{ label: "All Products", href: "/collection/all-products" }, { label: "Source", href: "/collection/source" }],
    categoryLinks: [{ label: "DACs", href: "/collection/dacs" }],
  })
})

test("deleted menus and orphan categories do not appear", () => {
  assert.deepEqual(footerCatalogLinks([], [category(1, "dacs")]).categoryLinks, [])
  assert.equal(footerCatalogLinks([], []).productLinks.length, 1)
})

test("categories linked only to inactive menus are hidden", () => {
  const result = footerCatalogLinks([menu({ is_active: false })], [category(1, "dacs")])
  assert.equal(result.productLinks.length, 1)
  assert.deepEqual(result.categoryLinks, [])
})

test("inactive, missing and mismatched categories are excluded", () => {
  const groups = [{ title: "Digital", links: [link(1, "DACs", "dacs"), link(99, "Deleted", "deleted"), link(2, "Wrong URL", "wrong")] }]
  assert.deepEqual(footerCatalogLinks([menu({ groups })], [category(1, "dacs", { is_active: false }), category(2, "correct")]).categoryLinks, [])
})

test("deduplicates menus and categories shared across groups", () => {
  const result = footerCatalogLinks([menu(), menu(), menu({ label: "All", href: "/collection/all-products" })], [category(1, "dacs")])
  assert.equal(result.productLinks.length, 2)
  assert.equal(result.categoryLinks.length, 1)
})

test("empty pages, unknown routes and external URLs are not footer destinations", () => {
  for (const href of ["/services", "/contact", "/missing", "https://example.com", "//example.com", "javascript:alert(1)", "/\\example.com"]) {
    const result = footerCatalogLinks([menu({ href, groups: [] })], [])
    assert.equal(result.productLinks.length, 1, href)
  }
})

test("a failed categories request still permits current menu links, without stale categories", () => {
  assert.equal(footerCatalogLinks([menu()], []).productLinks.length, 2)
  assert.deepEqual(footerCatalogLinks([menu()], []).categoryLinks, [])
})
