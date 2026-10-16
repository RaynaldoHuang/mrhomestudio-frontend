import assert from "node:assert/strict"
import test from "node:test"
import { collectionHref, collectionIdFromHref, collectionTitle } from "../src/lib/collection-links.ts"

test("collection URLs normalize spaces and capital letters, including legacy encoded URLs", () => {
  assert.equal(collectionHref("CD Players"), "/collection/cd-players")
  assert.equal(collectionIdFromHref("/collection/Cd%20players?sort=latest#products"), "cd-players")
  assert.equal(collectionIdFromHref("/collection/cd-transports"), "cd-transports")
})

test("malformed or non-collection URLs have no collection ID", () => {
  assert.equal(collectionIdFromHref("/about"), "")
  assert.equal(collectionIdFromHref("/collection/%E0%A4%A"), "")
})

test("menu labels remain independent from the canonical category URL", () => {
  const menus = [{ label: "Sources", href: "/collection/sources", groups: [{ links: [{ label: "Our CD Players", href: "/collection/cd-players" }] }] }]
  assert.equal(collectionTitle("cd-players", menus, "CD Players"), "Our CD Players")
  assert.equal(collectionTitle("sources", menus), "Sources")
  assert.equal(collectionTitle("turntables", menus, "Turntables"), "Turntables")
})
