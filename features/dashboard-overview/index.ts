import type { FeaturePlugin } from "@/core/nav/types"

import { dashboardOverviewNav } from "./nav"

export { getOverviewStats } from "./api/get-overview-stats"
export { OverviewPage } from "./ui/overview-page"
export type { Stat, StatTrend } from "./model/types"

export const dashboardOverviewFeature: FeaturePlugin = {
  id: "dashboard-overview",
  nav: dashboardOverviewNav,
}
