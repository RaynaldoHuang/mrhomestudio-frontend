import { useState, type FormEvent } from "react"
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to="/admin" replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await login(email, password)
      const destination = (location.state as { from?: string } | null)?.from || "/admin"
      navigate(destination, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-background p-7 sm:p-9">
        <div className="mb-8 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><LockKeyhole className="size-5" /></div>
        <h1 className="text-2xl font-semibold tracking-tight">Super Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage MR Home Audio website content.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@example.com" /></div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>{isSubmitting && <Loader2 className="size-4 animate-spin" />}{isSubmitting ? "Signing in…" : "Sign in"}</Button>
        </form>
      </div>
    </main>
  )
}
