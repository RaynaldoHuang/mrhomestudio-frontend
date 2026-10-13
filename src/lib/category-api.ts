import { getAuthHeaders } from "@/lib/auth-api"

export type Category = {
  id: number
  name: string
  slug: string
  description: string
  image_url: string | null
  sort_order: number
  show_on_home: boolean
  is_active: boolean
  products_count?: number
}

export type CategoryFormValues = {
  name: string
  description: string
  image: File | null
  sort_order: number
  show_on_home: boolean
  is_active: boolean
}

const apiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...getAuthHeaders(), ...options?.headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const validation = payload?.errors ? Object.values(payload.errors).flat().join(" ") : null
    throw new Error(validation || payload?.message || "Unable to process category request.")
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

function toFormData(values: CategoryFormValues) {
  const data = new FormData()
  data.append("name", values.name)
  data.append("description", values.description)
  data.append("sort_order", String(values.sort_order))
  data.append("show_on_home", values.show_on_home ? "1" : "0")
  data.append("is_active", values.is_active ? "1" : "0")
  if (values.image) data.append("image", values.image)
  return data
}

export async function getCategories(homeOnly = false): Promise<Category[]> {
  return (await request<{ data: Category[] }>(`/categories${homeOnly ? "?show_on_home=1" : ""}`)).data
}

export async function getAdminCategories(): Promise<Category[]> {
  return (await request<{ data: Category[] }>("/admin/categories")).data
}

export async function createCategory(values: CategoryFormValues): Promise<Category> {
  return (await request<{ data: Category }>("/admin/categories", { method: "POST", body: toFormData(values) })).data
}

export async function updateCategory(id: number, values: CategoryFormValues): Promise<Category> {
  const data = toFormData(values)
  data.append("_method", "PUT")
  return (await request<{ data: Category }>(`/admin/categories/${id}`, { method: "POST", body: data })).data
}

export function deleteCategory(id: number): Promise<void> {
  return request(`/admin/categories/${id}`, { method: "DELETE" })
}
