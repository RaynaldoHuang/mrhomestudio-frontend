export interface CarouselSlide {
  id: number
  eyebrow: string | null
  title: string
  cta_label: string
  cta_url: string
  image_url: string | null
  image_alt: string
  image_position: "object-left" | "object-center" | "object-right"
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CarouselFormValues {
  eyebrow: string
  title: string
  cta_label: string
  cta_url: string
  image_alt: string
  image_position: CarouselSlide["image_position"]
  sort_order: number
  is_active: boolean
  image?: File | null
}

interface ApiResponse<T> {
  data: T
}

const apiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const validationMessage = payload?.errors
      ? Object.values(payload.errors).flat().join(" ")
      : null

    throw new Error(validationMessage || payload?.message || "Request failed. Please try again.")
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

function toFormData(values: CarouselFormValues): FormData {
  const formData = new FormData()

  formData.append("eyebrow", values.eyebrow)
  formData.append("title", values.title)
  formData.append("cta_label", values.cta_label)
  formData.append("cta_url", values.cta_url)
  formData.append("image_alt", values.image_alt)
  formData.append("image_position", values.image_position)
  formData.append("sort_order", String(values.sort_order))
  formData.append("is_active", values.is_active ? "1" : "0")

  if (values.image) {
    formData.append("image", values.image)
  }

  return formData
}

export async function getPublicCarousels(): Promise<CarouselSlide[]> {
  const response = await apiRequest<ApiResponse<CarouselSlide[]>>("/carousels")

  return response.data
}

export async function getAdminCarousels(): Promise<CarouselSlide[]> {
  const response = await apiRequest<ApiResponse<CarouselSlide[]>>("/admin/carousels")

  return response.data
}

export async function createCarousel(values: CarouselFormValues): Promise<CarouselSlide> {
  const response = await apiRequest<ApiResponse<CarouselSlide>>("/admin/carousels", {
    method: "POST",
    body: toFormData(values),
  })

  return response.data
}

export async function updateCarousel(id: number, values: CarouselFormValues): Promise<CarouselSlide> {
  const formData = toFormData(values)
  formData.append("_method", "PUT")

  const response = await apiRequest<ApiResponse<CarouselSlide>>(`/admin/carousels/${id}`, {
    method: "POST",
    body: formData,
  })

  return response.data
}

export function deleteCarousel(id: number): Promise<void> {
  return apiRequest<void>(`/admin/carousels/${id}`, { method: "DELETE" })
}
import { getAuthHeaders } from "@/lib/auth-api"
