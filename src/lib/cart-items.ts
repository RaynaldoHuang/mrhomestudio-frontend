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

export function synchronizeCart(items: CartItem[], products: Map<number, Product | null>): CartItem[] {
  return items.map((item) => {
    if (!products.has(item.productId)) return item
    const product = products.get(item.productId)
    if (!product || !product.is_active) {
      return { ...item, unavailableReason: "This product is no longer available." }
    }

    const selectedVariants = item.selectedVariants ?? Object.fromEntries(product.variants.map((variant) => [
      variant.name,
      variant.values.find((value) => item.colour.split(", ").includes(`${variant.name}: ${value}`)
        || (product.variants.length === 1 && item.colour === value)) ?? "",
    ]))
    const variantsValid = !(item.selectedVariants === undefined && product.variants.length === 0 && item.colour !== "Standard")
      && product.variants.every((variant) => variant.values.includes(selectedVariants[variant.name]))
      && Object.keys(selectedVariants).every((name) => product.variants.some((variant) => variant.name === name))
    const unavailableReason = !variantsValid
      ? "This variant is no longer available. Please choose another option on the product page."
      : undefined

    return {
      ...item,
      name: product.name,
      price: product.price,
      image: product.thumbnail_url ?? product.images[0]?.url ?? null,
      colour: variantsValid
        ? product.variants.map((variant) => `${variant.name}: ${selectedVariants[variant.name]}`).join(", ") || "Standard"
        : item.colour,
      selectedVariants,
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
