export type AdminUser = {
  id: number
  name: string
  email: string
  role: "super_admin"
}

type LoginResponse = {
  token: string
  user: AdminUser
}

const tokenKey = "mr-home-audio-admin-token"
const apiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(tokenKey)
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function authRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const validationMessage = payload?.errors
      ? Object.values(payload.errors).flat().join(" ")
      : null
    throw new Error(validationMessage || payload?.message || "Authentication failed.")
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const response = await authRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem(tokenKey, response.token)
  return response
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  const response = await authRequest<{ user: AdminUser }>("/auth/me")
  return response.user
}

export async function updateProfileRequest(name: string, email: string): Promise<AdminUser> {
  const response = await authRequest<{ user: AdminUser }>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify({ name, email }),
  })
  return response.user
}

export async function updatePasswordRequest(
  currentPassword: string,
  password: string,
  passwordConfirmation: string,
): Promise<void> {
  await authRequest("/auth/password", {
    method: "PUT",
    body: JSON.stringify({
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    }),
  })
}

export async function logoutRequest(): Promise<void> {
  try {
    await authRequest<void>("/auth/logout", { method: "POST" })
  } catch {
    // The local session must still end if the API is temporarily unavailable.
  } finally {
    localStorage.removeItem(tokenKey)
  }
}

export function clearStoredAuth(): void {
  localStorage.removeItem(tokenKey)
}
