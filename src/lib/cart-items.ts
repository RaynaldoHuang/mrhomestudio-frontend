import type { Product } from "./product-api"

export type CartItem = {
  id: string
  productId: number
  name: string
  price: number
  colour: string
  image: string | null
  quantity: number
  selectedVariants?: Record<string, string>
  unavailableReason?: string
}

function normalizeVariantText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

function normalizeVariantName(value: string): string {
  const name = normalizeVariantText(value)
  return ["color", "colors", "colour", "colours"].includes(name) ? "color" : name
}

function resolveSelectedVariants(item: CartItem, product: Product): Record<string, string> | undefined {
  // Older carts only saved the display label. Do not persist failed guesses as empty selections.
  const saved = item.selectedVariants && (Object.keys(item.selectedVariants).length > 0 || item.colour === "Standard")
    && Object.values(item.selectedVariants).every((value) => value.trim())
    ? Object.entries(item.selectedVariants)
    : item.colour === "Standard" ? [] : item.colour.split(", ").map((label) => {
      const separator = label.indexOf(":")
      return separator < 0 ? ["", label] : [label.slice(0, separator), label.slice(separator + 1)]
    })

  if (saved.length !== product.variants.length) return undefined
  const selected: Record<string, string> = {}
  const used = new Set<number>()
  for (const variant of product.variants) {
    const matches = saved.flatMap(([name, value], index) => {
      if (used.has(index) || (normalizeVariantName(name) !== normalizeVariantName(variant.name)
        && !(name === "" && product.variants.length === 1))) return []
      const values = variant.values.filter((option) => normalizeVariantText(option) === normalizeVariantText(value))
      return values.length === 1 ? [{ index, value: values[0] }] : []
    })
    if (matches.length !== 1) return undefined
    used.add(matches[0].index)
    selected[variant.name] = matches[0].value
  }
  return selected
}

export function synchronizeCart(items: CartItem[], products: Map<number, Product | null>): CartItem[] {
  return items.map((item) => {
    if (!products.has(item.productId)) return item
    const product = products.get(item.productId)
    if (!product || !product.is_active) {
      return { ...item, unavailableReason: "This product is no longer available." }
    }

    const selectedVariants = resolveSelectedVariants(item, product)
    const unavailableReason = !selectedVariants
      ? "This variant is no longer available. Please choose another option on the product page."
      : undefined

    return {
      ...item,
      name: product.name,
      price: product.price,
      image: product.thumbnail_url ?? product.images[0]?.url ?? null,
      colour: selectedVariants
        ? product.variants.map((variant) => `${variant.name}: ${selectedVariants[variant.name]}`).join(", ") || "Standard"
        : item.colour,
      selectedVariants: selectedVariants ?? item.selectedVariants,
      unavailableReason,
    }
  })
}

export function parseStoredCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is CartItem => (
    item !== null && typeof item === "object"
    && typeof item.id === "string" && Number.isSafeInteger(item.productId) && item.productId > 0
    && typeof item.name === "string" && typeof item.colour === "string"
    && Number.isFinite(item.price) && item.price >= 0
    && Number.isSafeInteger(item.quantity) && item.quantity > 0
    && (item.image === null || typeof item.image === "string")
    && (item.selectedVariants === undefined || (item.selectedVariants !== null && typeof item.selectedVariants === "object"
      && !Array.isArray(item.selectedVariants) && Object.values(item.selectedVariants).every((entry) => typeof entry === "string")))
  ))
}
