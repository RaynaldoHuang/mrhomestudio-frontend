import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/contexts/auth-context"

export function RequireSuperAdmin() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Checking session…</div>
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
