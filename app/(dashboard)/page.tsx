import { getOverviewStats } from "@/views/overview/api/overview-data"
import { OverviewPage } from "@/views/overview/overview-page"

export const metadata = {
  title: "Dashboard",
}

export default async function Page() {
  const stats = await getOverviewStats()
  return <OverviewPage stats={stats} />
}
