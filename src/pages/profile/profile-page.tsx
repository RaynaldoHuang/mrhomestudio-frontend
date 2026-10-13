import { useState, type FormEvent } from "react"
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, Pencil, ShieldCheck, UserRound } from "lucide-react"
import { toast } from "sonner"

import { FormCard } from "@/components/shared/form-card"
import { PageHeader } from "@/components/shared/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { updatePasswordRequest } from "@/lib/auth-api"

type PasswordInputProps = {
  id: string
  label: string
  value: string
  autoComplete: string
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
}

function PasswordInput({ id, label, value, autoComplete, placeholder, disabled = false, onChange }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          disabled={disabled}
          className="pr-10"
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50"
        >
          {isVisible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingProfile(true)
    try {
      await updateProfile(name, email)
      setIsEditingProfile(false)
      toast.success("Profile updated successfully.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== passwordConfirmation) {
      toast.error("Password confirmation does not match.")
      return
    }

    setIsSavingPassword(true)
    try {
      await updatePasswordRequest(currentPassword, password, passwordConfirmation)
      setCurrentPassword("")
      setPassword("")
      setPasswordConfirmation("")
      setIsEditingPassword(false)
      toast.success("Password updated successfully.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password.")
    } finally {
      setIsSavingPassword(false)
    }
  }

  const initials = (user?.name ?? "Super Admin")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const isProfileChanged = name.trim() !== user?.name || email.trim() !== user?.email
  const isNewPasswordValid = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)
  const canUpdatePassword = currentPassword.length > 0 && isNewPasswordValid && password === passwordConfirmation

  const cancelProfileEdit = () => {
    setName(user?.name ?? "")
    setEmail(user?.email ?? "")
    setIsEditingProfile(false)
  }

  const cancelPasswordEdit = () => {
    setCurrentPassword("")
    setPassword("")
    setPasswordConfirmation("")
    setIsEditingPassword(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account information and password." />

      <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="rounded-xl border bg-card p-6 lg:sticky lg:top-24">
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-20 border">
              <AvatarFallback className="text-2xl font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="mt-4 flex max-w-full flex-col gap-1">
              <h2 className="text-lg font-semibold">{user?.name}</h2>
              <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Badge className="mt-3" variant="secondary">
              <ShieldCheck aria-hidden="true" />
              Super Admin
            </Badge>
          </div>

          <div className="mt-6 space-y-4 border-t pt-5">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email address</p>
                <p className="mt-0.5 truncate text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground">Account type</p>
                <p className="mt-0.5 text-sm">Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <FormCard title="Profile Information" description="Update the name and email used for your admin account.">
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input id="profile-name" value={name} required disabled={!isEditingProfile} autoComplete="name" placeholder="Your name" onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" type="email" value={email} required disabled={!isEditingProfile} autoComplete="email" placeholder="email@example.com" onChange={(event) => setEmail(event.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-5">
                {isEditingProfile ? (
                  <>
                    <Button type="button" variant="outline" disabled={isSavingProfile} onClick={cancelProfileEdit}>Cancel</Button>
                    <Button type="submit" disabled={isSavingProfile || !isProfileChanged}>
                      {isSavingProfile && <Loader2 className="size-4 animate-spin" />}
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="outline" onClick={() => setIsEditingProfile(true)}>
                    <Pencil className="size-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </FormCard>

          <FormCard title="Change Password" description="Use a strong password with at least 8 characters, uppercase, lowercase, and a number.">
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <PasswordInput id="current-password" label="Current Password" value={currentPassword} autoComplete="current-password" placeholder="Enter current password" disabled={!isEditingPassword} onChange={setCurrentPassword} />
              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordInput id="new-password" label="New Password" value={password} autoComplete="new-password" placeholder="Enter new password" disabled={!isEditingPassword} onChange={setPassword} />
                <PasswordInput id="password-confirmation" label="Confirm New Password" value={passwordConfirmation} autoComplete="new-password" placeholder="Repeat new password" disabled={!isEditingPassword} onChange={setPasswordConfirmation} />
              </div>
              <div className="flex justify-end gap-2 border-t pt-5">
                {isEditingPassword ? (
                  <>
                    <Button type="button" variant="outline" disabled={isSavingPassword} onClick={cancelPasswordEdit}>Cancel</Button>
                    <Button type="submit" disabled={isSavingPassword || !canUpdatePassword}>
                      {isSavingPassword ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
                      {isSavingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="outline" onClick={() => setIsEditingPassword(true)}>
                    <Pencil className="size-4" />
                    Edit Password
                  </Button>
                )}
              </div>
            </form>
          </FormCard>
        </div>
      </div>
    </div>
  )
}
