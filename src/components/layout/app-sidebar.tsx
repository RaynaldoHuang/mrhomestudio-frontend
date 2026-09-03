import { ChevronUp, LogOut, Settings, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { appConfig } from "@/config/app"
import { navigation } from "@/config/navigation"

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return location.pathname === "/dashboard"
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
                            to="/dashboard"
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
                        <DropdownMenu>
                            <DropdownMenuTrigger className="w-full">
                                <SidebarMenuButton
                                    size="lg"
                                    className="w-full"
                                >
                                    <Avatar className="size-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">
                                            AD
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            Administrator
                                        </span>

                                        <span className="truncate text-xs text-muted-foreground">
                                            admin@example.com
                                        </span>
                                    </div>

                                    <ChevronUp className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="end"
                                className="w-56"
                            >
                                <DropdownMenuLabel>
                                    My Account
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem>
                                    <User className="size-4" />
                                    Profile
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                    <Settings className="size-4" />
                                    Settings
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem>
                                    <LogOut className="size-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
