import { ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { appConfig } from "@/config/app"
import { navigation } from "@/config/navigation"
import { useAuth } from "@/contexts/auth-context"

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
    const location = useLocation()
    const { user } = useAuth()

    const isActive = (href: string) => {
        if (href === "/admin") {
            return location.pathname === "/admin"
        }

        return (
            location.pathname === href ||
            location.pathname.startsWith(`${href}/`)
        )
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link
                            to="/admin"
                            className="block"
                        >
                            <SidebarMenuButton
                                size="lg"
                                tooltip={appConfig.name}
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <span className="text-sm font-semibold">
                                        {appConfig.logo}
                                    </span>
                                </div>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {appConfig.name}
                                    </span>

                                    <span className="truncate text-xs text-muted-foreground">
                                        {appConfig.description}
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navigation.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>
                            {group.title}
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    const active = isActive(item.href)

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <Link
                                                to={item.href}
                                                className="block"
                                            >
                                                <SidebarMenuButton
                                                    isActive={active}
                                                    tooltip={item.title}
                                                >
                                                    <Icon className="size-4" />

                                                    <span>
                                                        {item.title}
                                                    </span>
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link to="/admin/profile" className="block">
                            <SidebarMenuButton
                                size="lg"
                                isActive={isActive("/admin/profile")}
                                tooltip="Profile"
                                className="w-full"
                            >
                                <Avatar className="size-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">
                                        {user?.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {user?.name}
                                    </span>

                                    <span className="truncate text-xs text-muted-foreground">
                                        {user?.email}
                                    </span>
                                </div>

                                <ChevronRight className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>

                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
