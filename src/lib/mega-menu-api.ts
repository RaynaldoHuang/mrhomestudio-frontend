import { getAuthHeaders } from "@/lib/auth-api"

export type MegaMenuLink = {
  category_id?: number | null
  label: string
  href: string
}

export type MegaMenuGroup = {
  title: string
  links: MegaMenuLink[]
}

export type MegaMenu = {
  id: number
  label: string
  href: string
  groups: MegaMenuGroup[]
  featured_title: string | null
  featured_url: string | null
  featured_image_url: string | null
  featured_image_alt: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type MegaMenuFormValues = {
  label: string
  href: string
  groups: MegaMenuGroup[]
  featured_title: string
  featured_url: string
  featured_image_alt: string
  featured_image: File | null
  sort_order: number
  is_active: boolean
}

type ApiResponse<T> = { data: T }

const apiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...getAuthHeaders(), ...options?.headers },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const validationMessage = payload?.errors ? Object.values(payload.errors).flat().join(" ") : null
    throw new Error(validationMessage || payload?.message || "Request failed. Please try again.")
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

function toFormData(values: MegaMenuFormValues): FormData {
  const data = new FormData()
  data.append("label", values.label)
  data.append("href", values.href)
  data.append("featured_title", values.featured_title)
  data.append("featured_url", values.featured_url)
  data.append("featured_image_alt", values.featured_image_alt)
  data.append("sort_order", String(values.sort_order))
  data.append("is_active", values.is_active ? "1" : "0")

  values.groups.forEach((group, groupIndex) => {
    data.append(`groups[${groupIndex}][title]`, group.title)
    group.links.forEach((link, linkIndex) => {
      data.append(`groups[${groupIndex}][links][${linkIndex}][label]`, link.label)
      data.append(`groups[${groupIndex}][links][${linkIndex}][href]`, link.href)
      if (link.category_id != null) data.append(`groups[${groupIndex}][links][${linkIndex}][category_id]`, String(link.category_id))
    })
  })

  if (values.featured_image) data.append("featured_image", values.featured_image)
  return data
}

export async function getPublicMegaMenus(): Promise<MegaMenu[]> {
  return (await apiRequest<ApiResponse<MegaMenu[]>>("/mega-menus")).data
}

export async function getAdminMegaMenus(): Promise<MegaMenu[]> {
  return (await apiRequest<ApiResponse<MegaMenu[]>>("/admin/mega-menus")).data
}

export async function createMegaMenu(values: MegaMenuFormValues): Promise<MegaMenu> {
  return (await apiRequest<ApiResponse<MegaMenu>>("/admin/mega-menus", { method: "POST", body: toFormData(values) })).data
}

export async function updateMegaMenu(id: number, values: MegaMenuFormValues): Promise<MegaMenu> {
  const data = toFormData(values)
  data.append("_method", "PUT")
  return (await apiRequest<ApiResponse<MegaMenu>>(`/admin/mega-menus/${id}`, { method: "POST", body: data })).data
}

export function deleteMegaMenu(id: number): Promise<void> {
  return apiRequest(`/admin/mega-menus/${id}`, { method: "DELETE" })
}
