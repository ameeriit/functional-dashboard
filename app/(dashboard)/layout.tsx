import { AppShell } from "@/shared/layout/app-shell"
import { AppSidebar } from "@/shared/common/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell sidebar={<AppSidebar />}>{children}</AppShell>
}
