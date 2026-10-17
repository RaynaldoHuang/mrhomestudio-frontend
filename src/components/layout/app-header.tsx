/* eslint-disable react-hooks/set-state-in-effect */
import { Bell, LogOut, Moon, Sun, UserRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { AdminSearch } from "@/components/layout/admin-search"
import { AppBreadcrumb } from "@/components/layout/app-breadcrumb"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

export function AppHeader() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [isDark, setIsDark] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const closeMenuTimer = useRef<number | null>(null)
    const profileMenuRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme")

        const dark =
            savedTheme === "dark" ||
            (!savedTheme &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)

        setIsDark(dark)

        document.documentElement.classList.toggle("dark", dark)
    }, [])

    useEffect(() => () => {
        if (closeMenuTimer.current !== null) {
            window.clearTimeout(closeMenuTimer.current)
        }
    }, [])

    useEffect(() => {
        if (!profileMenuOpen) return

        const closeMenuOnOutsideClick = (event: PointerEvent) => {
            if (!profileMenuRef.current?.contains(event.target as Node)) {
                setProfileMenuOpen(false)
            }
        }

        document.addEventListener("pointerdown", closeMenuOnOutsideClick)
        return () => document.removeEventListener("pointerdown", closeMenuOnOutsideClick)
    }, [profileMenuOpen])

    const toggleTheme = () => {
        const next = !isDark

        setIsDark(next)

        document.documentElement.classList.toggle("dark", next)

        localStorage.setItem(
            "theme",
            next ? "dark" : "light"
        )
    }

    const handleLogout = async () => {
        setIsLoggingOut(true)
        await logout()
        navigate("/admin/login", { replace: true })
    }

    const openProfileMenu = () => {
        if (closeMenuTimer.current !== null) {
            window.clearTimeout(closeMenuTimer.current)
        }
        setProfileMenuOpen(true)
    }

    const scheduleProfileMenuClose = () => {
        closeMenuTimer.current = window.setTimeout(() => {
            setProfileMenuOpen(false)
        }, 150)
    }

    const initials = (user?.name ?? "Super Admin")
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <SidebarTrigger className="-ml-1" />

            <AppBreadcrumb />

            <div className="ml-auto flex items-center gap-1">
                <AdminSearch />

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                >
                    <Bell className="size-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {isDark ? (
                        <Sun className="size-4" />
                    ) : (
                        <Moon className="size-4" />
                    )}
                </Button>

                <div
                    ref={profileMenuRef}
                    className="relative ml-1"
                    onMouseEnter={openProfileMenu}
                    onMouseLeave={scheduleProfileMenuClose}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label="Open account menu"
                        aria-haspopup="menu"
                        aria-expanded={profileMenuOpen}
                        onClick={() => setProfileMenuOpen((open) => !open)}
                    >
                        <Avatar className="size-8">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Button>

                    {profileMenuOpen && (
                        <div
                            role="menu"
                            className="absolute top-full right-0 z-50 mt-2 w-60 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
                        >
                            <div className="px-2 py-2">
                                <span className="block truncate text-sm font-semibold text-foreground">{user?.name}</span>
                                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{user?.email}</span>
                            </div>
                            <div className="my-1 h-px bg-border" />
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setProfileMenuOpen(false)
                                    navigate("/admin/profile")
                                }}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                            >
                                <UserRound className="size-4" />
                                Profile
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setProfileMenuOpen(false)
                                    setLogoutDialogOpen(true)
                                }}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10"
                            >
                                <LogOut className="size-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={logoutDialogOpen}
                onOpenChange={setLogoutDialogOpen}
                title="Logout from admin?"
                description="You will need to enter your email and password again to access the admin dashboard."
                confirmLabel={isLoggingOut ? "Logging out..." : "Logout"}
                destructive
                closeOnBackdropClick
                onConfirm={() => void handleLogout()}
            />
        </header>
    )
}
