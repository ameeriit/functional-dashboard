import { LayoutDashboard } from "lucide-react"

import type { NavContribution } from "@/core/nav/types"

export const dashboardOverviewNav: NavContribution = {
  section: "Overview",
  item: { title: "Dashboard", href: "/", icon: LayoutDashboard },
}
