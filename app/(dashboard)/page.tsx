import { buildWorkspaceUserStats } from "@/shared/lib/workspace-user-stats"
import { OverviewPage } from "@/views/overview/overview-page"
import { getUsers } from "@/views/users/api/users-data"

export const metadata = {
  title: "Dashboard",
}

export default async function Page() {
  const users = await getUsers()
  const stats = buildWorkspaceUserStats(users)
  return <OverviewPage stats={stats} />
}
