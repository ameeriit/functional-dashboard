import { getOverviewStats, OverviewPage } from "@/features/dashboard-overview"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardHomePage() {
  const stats = await getOverviewStats()
  return <OverviewPage stats={stats} />
}
