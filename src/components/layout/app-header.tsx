/* eslint-disable react-hooks/set-state-in-effect */
import { Bell, Moon, Search, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { AppBreadcrumb } from "@/components/layout/app-breadcrumb"


import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme")

        const dark =
            savedTheme === "dark" ||
            (!savedTheme &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)

        setIsDark(dark)

        document.documentElement.classList.toggle("dark", dark)
    }, [])

    const toggleTheme = () => {
        const next = !isDark

        setIsDark(next)

        document.documentElement.classList.toggle("dark", next)

        localStorage.setItem(
            "theme",
            next ? "dark" : "light"
        )
    }

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <SidebarTrigger className="-ml-1" />

            <AppBreadcrumb />

            <div className="ml-auto flex items-center gap-1">
                <Button
                    variant="outline"
                    className="hidden h-9 w-52 justify-start text-muted-foreground md:flex lg:w-60"
                >
                    <Search className="mr-2 size-4" />

                    <span>Search...</span>

                    <kbd className="ml-auto rounded border border-border/50 bg-muted px-1.5 text-[10px]">
                        ⌘ K
                    </kbd>
                </Button>

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
            </div>
        </header>
    )
}
