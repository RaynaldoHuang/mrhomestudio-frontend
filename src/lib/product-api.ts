import { toProductFormData } from "@/lib/product-form-data"

export type ProductImage = {
  id: number
  url: string
  sort_order: number
}

export type ProductSpecification = {
  name: string
  value: string
}

export type ProductVariant = {
  name: string
  values: string[]
}

export type ProductVariantPrice = {
  options: string[]
  price: number
}

export type Product = {
  id: number
  name: string
  slug: string
  category: string | null
  category_id: number | null
  category_slug: string | null
  brand: string | null
  brand_id: number | null
  price: number
  description: string
  specifications: ProductSpecification[]
  variants: ProductVariant[]
  variant_prices?: ProductVariantPrice[]
  is_active: boolean
  show_on_home: boolean
  images: ProductImage[]
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export type ProductFormValues = {
  name: string
  category: string
  category_id: number | null
  brand_id: number | null
  price: number
  description: string
  specifications: ProductSpecification[]
  variants: ProductVariant[]
  variant_prices?: ProductVariantPrice[]
  is_active: boolean
  show_on_home: boolean
  images: File[]
  remove_image_ids: number[]
}

type ApiResponse<T> = { data: T }

const apiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")

export class ProductApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "ProductApiError"
  }
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...getAuthHeaders(), ...options?.headers },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const validationMessage = payload?.errors
      ? Object.values(payload.errors).flat().join(" ")
      : null

    throw new ProductApiError(validationMessage || payload?.message || "Request failed. Please try again.", response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export async function getProducts(limit?: number, categoryId?: number, collection?: string): Promise<Product[]> {
  const params = new URLSearchParams()
  if (limit) params.set("limit", String(limit))
  if (categoryId !== undefined) params.set("category_id", String(categoryId))
  if (collection !== undefined) params.set("collection", collection)
  if (limit !== undefined) {
    return (await apiRequest<ApiResponse<Product[]>>(`/products?${params}`)).data
  }

  params.set("limit", "100")
  const products: Product[] = []
  const seen = new Set<number>()
  for (let page = 1; ; page++) {
    params.set("page", String(page))
    const { data } = await apiRequest<ApiResponse<Product[]>>(`/products?${params}`)
    const unseen = data.filter((product) => !seen.has(product.id))
    products.push(...unseen)
    unseen.forEach((product) => seen.add(product.id))
    if (data.length < 100 || unseen.length === 0) return products
  }
}

export async function getProduct(id: string | number): Promise<Product> {
  const response = await apiRequest<ApiResponse<Product>>(`/products/${id}`)
  return response.data
}

export async function getHomeProducts(): Promise<Product[]> {
  return (await apiRequest<ApiResponse<Product[]>>("/products?show_on_home=1")).data
}

export async function getAdminProducts(): Promise<Product[]> {
  const response = await apiRequest<ApiResponse<Product[]>>("/admin/products")
  return response.data
}

export async function createProduct(values: ProductFormValues): Promise<Product> {
  const response = await apiRequest<ApiResponse<Product>>("/admin/products", {
    method: "POST",
    body: toProductFormData(values),
  })
  return response.data
}

export async function updateProduct(id: number, values: ProductFormValues): Promise<Product> {
  const formData = toProductFormData(values)
  formData.append("_method", "PUT")
  const response = await apiRequest<ApiResponse<Product>>(`/admin/products/${id}`, {
    method: "POST",
    body: formData,
  })
  return response.data
}

export function deleteProduct(id: number): Promise<void> {
  return apiRequest<void>(`/admin/products/${id}`, { method: "DELETE" })
}

export async function duplicateProduct(id: number): Promise<Product> {
  const response = await apiRequest<ApiResponse<Product>>(`/admin/products/${id}/duplicate`, { method: "POST" })
  return response.data
}
import { getAuthHeaders } from "@/lib/auth-api"
