import type { FeaturePlugin } from "@/core/nav/types"

import { dashboardOverviewNav } from "./nav"

export const dashboardOverviewFeature: FeaturePlugin = {
  id: "dashboard-overview",
  nav: dashboardOverviewNav,
}
