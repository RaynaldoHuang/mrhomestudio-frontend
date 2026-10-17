import type { Product } from "./product-api"

export type CatalogFilterKey = "category" | "brand"
export type CatalogFilters = Record<CatalogFilterKey, string[]>
export type CatalogFilterGroup = {
  key: CatalogFilterKey
  label: string
  options: Array<{ label: string; value: string; count: number }>
}

export const emptyCatalogFilters = (): CatalogFilters => ({ category: [], brand: [] })

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID")
}

function filterValue(product: Product, key: CatalogFilterKey): string {
  if (key === "category") return product.category_id !== null ? `id:${product.category_id}` : normalize(product.category ?? "")
  return normalize(product[key] ?? "")
}

export function catalogFilterGroups(products: Product[]): CatalogFilterGroup[] {
  return ([
    { key: "category", label: "Kategori Produk" },
    { key: "brand", label: "Merek" },
  ] as const).map(({ key, label }) => {
    const options = new Map<string, { label: string; value: string; count: number }>()
    products.forEach((product) => {
      const value = filterValue(product, key)
      const optionLabel = (product[key] ?? "").trim()
      if (!value || !optionLabel) return
      const option = options.get(value) ?? { label: optionLabel, value, count: 0 }
      option.count++
      options.set(value, option)
    })
    return { key, label, options: [...options.values()].sort((a, b) => a.label.localeCompare(b.label, "id-ID")) }
  })
}

export function filterCatalogProducts(products: Product[], filters: CatalogFilters, minimumPrice: string, maximumPrice: string): Product[] {
  return products.filter((product) => (
    (Object.keys(filters) as CatalogFilterKey[]).every((key) => (
      filters[key].length === 0 || filters[key].includes(filterValue(product, key))
    ))
    && (minimumPrice === "" || product.price >= Number(minimumPrice))
    && (maximumPrice === "" || product.price <= Number(maximumPrice))
  ))
}
