import { cookies } from "next/headers"

import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar"
import { AppSidebar } from "@/core/layout/app-sidebar"
import { SiteHeader } from "@/core/layout/site-header"
import type { NavSection } from "@/core/nav/types"

export async function AppShell({
  nav,
  children,
}: {
  nav: NavSection[]
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar nav={nav} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
