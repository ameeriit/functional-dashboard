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
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-100 translate-y-[-220%] rounded-none border border-border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-md transition-transform duration-200 focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Skip to main content
      </a>
      {sidebar}
      <SidebarInset id="main-content" tabIndex={-1}>
        <SiteHeader />
        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
