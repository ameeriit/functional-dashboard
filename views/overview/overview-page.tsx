import { StatsGrid } from "@/views/overview/_components/stats-grid"
import { TeamTableCard } from "@/views/overview/_components/team-table-card"
import type { Stat } from "@/views/overview/entities/types"

export function OverviewPage({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Snapshot of your workspace team — counts match the mock dataset on the
          Users page. Open Users to view or edit the live table.
        </p>
      </div>

      <StatsGrid stats={stats} />

      <TeamTableCard />
    </div>
  )
}
