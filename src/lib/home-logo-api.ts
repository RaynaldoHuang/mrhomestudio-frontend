import { getAuthHeaders } from "@/lib/auth-api"

export type HomeLogo = {
  id: number
  name: string
  image_url: string
  sort_order: number
  is_active: boolean
}

export type HomeLogoForm = {
  name: string
  sort_order: number
  is_active: boolean
  image: File | null
}

const apiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")

async function request<T>(path: string, options?: RequestInit, authenticated = false): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...(authenticated ? getAuthHeaders() : {}), ...options?.headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const validation = payload?.errors ? Object.values(payload.errors).flat().join(" ") : null
    throw new Error(validation || payload?.message || "Tidak dapat memproses logo homepage.")
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export async function getPublicHomeLogos(): Promise<HomeLogo[]> {
  return (await request<{ data: HomeLogo[] }>("/home-logos")).data
}

export async function getAdminHomeLogos(): Promise<HomeLogo[]> {
  return (await request<{ data: HomeLogo[] }>("/admin/home-logos", undefined, true)).data
}

export async function saveHomeLogo(values: HomeLogoForm, id?: number): Promise<HomeLogo> {
  const body = new FormData()
  body.append("name", values.name.trim())
  body.append("sort_order", String(values.sort_order))
  body.append("is_active", values.is_active ? "1" : "0")
  if (values.image) body.append("image", values.image)
  if (id !== undefined) body.append("_method", "PUT")

  return (await request<{ data: HomeLogo }>(`/admin/home-logos${id === undefined ? "" : `/${id}`}`, {
    method: "POST",
    body,
  }, true)).data
}

export function deleteHomeLogo(id: number): Promise<void> {
  return request(`/admin/home-logos/${id}`, { method: "DELETE" }, true)
}
