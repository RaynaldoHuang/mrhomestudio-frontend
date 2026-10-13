import { createContext, useContext } from "react"

import type { AdminUser } from "@/lib/auth-api"

export type AuthContextValue = {
  user: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  updateProfile: (name: string, email: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
