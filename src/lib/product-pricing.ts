import type { Product, ProductVariant, ProductVariantPrice } from "./product-api"

type PricedProduct = Pick<Product, "price" | "variants" | "variant_prices">

export function variantCombinationCount(variants: ProductVariant[]): number {
  return variants.length === 0 ? 0 : variants.reduce((count, variant) => count * variant.values.length, 1)
}

export function variantCombinations(variants: ProductVariant[]): string[][] {
  if (variants.length === 0 || variantCombinationCount(variants) > 500) return []
  return variants.reduce<string[][]>((rows, variant) => rows.flatMap((row) => variant.values.map((value) => [...row, value])), [[]])
}

export function findVariantPrice(prices: ProductVariantPrice[], options: string[]): ProductVariantPrice | undefined {
  return prices.find((row) => row.options.length === options.length && row.options.every((value, index) => value === options[index]))
}

export function selectedProductPrice(product: PricedProduct, selected: Record<string, string>): number | undefined {
  if (!product.variants.every((variant) => variant.values.includes(selected[variant.name]))) return undefined
  const options = product.variants.map((variant) => selected[variant.name])
  return findVariantPrice(product.variant_prices ?? [], options)?.price ?? product.price
}

export function productPriceRange(product: PricedProduct): { min: number; max: number } {
  const prices = (product.variant_prices ?? []).map((row) => row.price)
  if (prices.length === 0 || prices.length < variantCombinationCount(product.variants)) prices.push(product.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function formatProductPrice(product: PricedProduct): string {
  const { min, max } = productPriceRange(product)
  return `${min !== max ? "Mulai dari " : ""}Rp${min.toLocaleString("id-ID")}`
}
