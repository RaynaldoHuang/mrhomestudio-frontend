import { Outlet } from "react-router-dom"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { PageContainer } from "@/components/layout/page-container"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

export function AdminLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <AppHeader />

                <PageContainer>
                    <Outlet />
                </PageContainer>
            </SidebarInset>
        </SidebarProvider>
    )
}