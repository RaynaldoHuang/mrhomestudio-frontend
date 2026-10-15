type CollectionMenu = {
  label: string
  href: string
  groups: Array<{ links: Array<{ label: string; href: string }> }>
}

export function collectionHref(label: string) {
  const slug = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug ? `/collection/${slug}` : ""
}

export function collectionIdFromHref(href: string) {
  const match = href.match(/\/collection\/([^/?#]+)/)
  return match?.[1] ?? ""
}

export function collectionTitle(id: string, menus: CollectionMenu[], categoryName?: string) {
  const link = menus.flatMap((menu) => menu.groups.flatMap((group) => group.links))
    .find((link) => collectionIdFromHref(link.href) === id)
  if (link?.label.trim()) return link.label

  const menu = menus.find((menu) => collectionIdFromHref(menu.href) === id)
  if (menu?.label.trim()) return menu.label

  return categoryName ?? id.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}
