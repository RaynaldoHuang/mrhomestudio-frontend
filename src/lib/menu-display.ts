import type { MegaMenuGroup } from "./mega-menu-api"

export type MenuDisplayMode = "grouped" | "direct"

export function menuDisplayGroups(groups: MegaMenuGroup[], mode: MenuDisplayMode = "grouped"): MegaMenuGroup[] {
  const visible = groups.filter((group) => group.links.length > 0)
  if (mode === "grouped") return visible
  const seen = new Set<string>()
  const links = visible.flatMap((group) => group.links).filter((link) => {
    if (seen.has(link.href)) return false
    seen.add(link.href)
    return true
  })
  return links.length > 0 ? [{ title: "", links }] : []
}
