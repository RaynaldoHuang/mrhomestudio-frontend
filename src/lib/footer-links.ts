import type { Category } from "./category-api"
import type { MegaMenu } from "./mega-menu-api"

export type FooterLink = { label: string; href: string }

export function footerCatalogLinks(menus: MegaMenu[], categories: Category[]) {
  const activeMenus = menus.filter((menu) => menu.is_active)
  const activeCategories = categories.filter((category) => category.is_active)
  const menuPaths = new Set(activeMenus.map((menu) => localPath(menu.href)).filter(Boolean))
  const categoryPaths = new Set(activeCategories.map((category) => `/collection/${category.slug}`))
  const validPath = (href: string) => {
    const path = localPath(href)
    return path !== null && (["/", "/about", "/cart", "/collection/all-products"].includes(path)
      || (/^\/collection\/[^/]+$/.test(path) && (menuPaths.has(path) || categoryPaths.has(path))))
  }

  const productLinks: FooterLink[] = [{ label: "All Products", href: "/collection/all-products" }]
  const categoryLinks: FooterLink[] = []
  const seenMenus = new Set(["/collection/all-products"])
  const seenCategories = new Set<number>()
  for (const menu of activeMenus) {
    const path = localPath(menu.href)
    if (path && menu.label.trim() && validPath(menu.href) && !seenMenus.has(path)) {
      productLinks.push({ label: menu.label, href: menu.href.trim() })
      seenMenus.add(path)
    }
    for (const group of menu.groups) {
      for (const link of group.links) {
        const category = activeCategories.find((category) => (
          (link.category_id == null || link.category_id === category.id)
          && localPath(link.href) === `/collection/${category.slug}`
        ))
        if (!category || seenCategories.has(category.id) || !link.label.trim()) continue
        categoryLinks.push({ label: link.label, href: `/collection/${category.slug}` })
        seenCategories.add(category.id)
      }
    }
  }
  return { productLinks, categoryLinks }
}

function localPath(href: string): string | null {
  const value = href.trim()
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null
  try {
    const url = new URL(value, "https://footer.invalid")
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, "")
    return path || "/"
  } catch {
    return null
  }
}
