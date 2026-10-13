import { useEffect, useMemo, useState, type ReactNode } from "react"

import { AuthContext } from "@/contexts/auth-context"
import { clearStoredAuth, getCurrentAdmin, getStoredAuthToken, loginRequest, logoutRequest, updateProfileRequest, type AdminUser } from "@/lib/auth-api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(() => getStoredAuthToken() !== null)

  useEffect(() => {
    if (!getStoredAuthToken()) return
    let active = true
    getCurrentAdmin()
      .then((admin) => { if (active) setUser(admin) })
      .catch(() => clearStoredAuth())
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({
    user,
    isLoading,
    login: async (email: string, password: string) => {
      const response = await loginRequest(email, password)
      setUser(response.user)
    },
    updateProfile: async (name: string, email: string) => {
      const admin = await updateProfileRequest(name, email)
      setUser(admin)
    },
    logout: async () => {
      await logoutRequest()
      setUser(null)
    },
  }), [isLoading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
