import assert from "node:assert/strict"
import test from "node:test"
import { menuDisplayGroups } from "../src/lib/menu-display.ts"

const groups = [
  { title: "Digital Sources", links: [{ label: "DACs", href: "/collection/dacs", category_id: 1 }] },
  { title: "Analogue Sources", links: [{ label: "Turntables", href: "/collection/turntables", category_id: 2 }] },
]

test("existing menus retain their grouped layout and category links", () => {
  assert.deepEqual(menuDisplayGroups(groups), groups)
})

test("direct menus show clickable categories without group headings", () => {
  assert.deepEqual(menuDisplayGroups(groups, "direct"), [{ title: "", links: [...groups[0].links, ...groups[1].links] }])
})

test("switching display modes does not mutate or lose the original group structure", () => {
  const original = JSON.stringify(groups)
  menuDisplayGroups(groups, "direct")
  assert.equal(JSON.stringify(groups), original)
  assert.deepEqual(menuDisplayGroups(groups, "grouped"), groups)
})

test("empty groups are omitted and repeated direct links appear only once", () => {
  const repeated = [...groups, groups[0], { title: "Empty", links: [] }]
  assert.equal(menuDisplayGroups(repeated, "direct")[0].links.length, 2)
  assert.equal(menuDisplayGroups(repeated).length, 3)
  assert.deepEqual(menuDisplayGroups([], "direct"), [])
})
