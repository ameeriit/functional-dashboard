import { dashboardOverviewFeature } from "@/features/dashboard-overview/plugin"
import { usersFeature } from "@/features/users/plugin"

export const features = [dashboardOverviewFeature, usersFeature] as const
