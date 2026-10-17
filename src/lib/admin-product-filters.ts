import type { Product } from "./product-api"

type SearchProduct = Pick<Product, "name" | "category" | "brand" | "category_id" | "brand_id">
export type AdminProductFilter = "category" | "brand"

export function normalizedSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase()
}

export function matchesProductSearch(product: SearchProduct, query: string): boolean {
  const text = normalizedSearch([product.name, product.category, product.brand].filter(Boolean).join(" "))
  return normalizedSearch(query).split(" ").filter(Boolean).every((word) => text.includes(word))
}

function filterValue(product: SearchProduct, field: AdminProductFilter): string {
  const id = field === "category" ? product.category_id : product.brand_id
  if (id != null) return String(id)
  const label = normalizedSearch(product[field] ?? "")
  return label ? `legacy:${label}` : "none"
}

export function adminProductFilterOptions(products: SearchProduct[], field: AdminProductFilter, master: Array<{ id: number; name: string }>) {
  const options = new Map(master.map((item) => [String(item.id), item.name]))
  products.forEach((product) => {
    const value = filterValue(product, field)
    if (value !== "none" && !options.has(value)) options.set(value, product[field] || `#${value}`)
  })
  return [...options].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, "id-ID"))
}

export function filterAdminProducts<T extends SearchProduct>(products: T[], query: string, brand: string, category: string): T[] {
  return products.filter((product) => matchesProductSearch(product, query)
    && (brand === "all" || filterValue(product, "brand") === brand)
    && (category === "all" || filterValue(product, "category") === category))
}
