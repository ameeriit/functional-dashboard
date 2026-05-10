import { AppShell } from "@/core/layout/app-shell"

import { DashboardSidebar } from "./dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell sidebar={<DashboardSidebar />}>{children}</AppShell>
}
