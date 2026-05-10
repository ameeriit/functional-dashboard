"use client"

import * as React from "react"

import { SiteHeader } from "@/shared/common/site-header"
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar"

export function AppShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen>
      {sidebar}
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
