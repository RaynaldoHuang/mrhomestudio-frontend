import { getAuthHeaders } from "@/lib/auth-api"

export type Brand = { id: number; name: string; products_count: number }

const apiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...getAuthHeaders(), ...options?.headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const validation = payload?.errors ? Object.values(payload.errors).flat().join(" ") : null
    throw new Error(validation || payload?.message || "Tidak dapat memproses data merek.")
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export async function getAdminBrands(): Promise<Brand[]> {
  return (await request<{ data: Brand[] }>("/admin/brands")).data
}

export async function saveBrand(name: string, id?: number): Promise<Brand> {
  return (await request<{ data: Brand }>(`/admin/brands${id === undefined ? "" : `/${id}`}`, {
    method: id === undefined ? "POST" : "PUT",
    body: JSON.stringify({ name: name.trim() }),
  })).data
}

export function deleteBrand(id: number): Promise<void> {
  return request(`/admin/brands/${id}`, { method: "DELETE" })
}
