import { AppShell } from "@/core/layout/app-shell"
import { buildNav } from "@/core/nav/build-nav"

import { features } from "./_features"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nav = buildNav(features)
  return <AppShell nav={nav}>{children}</AppShell>
}
