import type { LucideIcon } from "lucide-react"
import { Mail, ShieldBan, UserCheck, Users } from "lucide-react"

export type StatTrend = "up" | "down"

/** Summary tiles for the dashboard; built from minimal user rows (e.g. workspace team). */
export type WorkspaceSummaryStat = {
  label: string
  value: string
  delta: string
  trend: StatTrend
  icon: LucideIcon
}

export function buildWorkspaceUserStats(
  users: ReadonlyArray<{ status: string }>
): WorkspaceSummaryStat[] {
  const total = users.length
  const active = users.filter((u) => u.status === "active").length
  const invited = users.filter((u) => u.status === "invited").length
  const suspended = users.filter((u) => u.status === "suspended").length
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0

  return [
    {
      label: "Team members",
      value: String(total),
      delta: "Managed on Users",
      trend: "up",
      icon: Users,
    },
    {
      label: "Active",
      value: String(active),
      delta: `${activePct}% of team`,
      trend: activePct >= 50 ? "up" : "down",
      icon: UserCheck,
    },
    {
      label: "Invited",
      value: String(invited),
      delta: invited > 0 ? "Awaiting signup" : "No pending invites",
      trend: "up",
      icon: Mail,
    },
    {
      label: "Suspended",
      value: String(suspended),
      delta: suspended > 0 ? "Access paused" : "No restrictions",
      trend: suspended > 0 ? "down" : "up",
      icon: ShieldBan,
    },
  ]
}
