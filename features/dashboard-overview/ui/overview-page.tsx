import type { Stat } from "../model/types"
import { StatsGrid } from "./stats-grid"
import { WelcomeCard } from "./welcome-card"

export function OverviewPage({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          A quick overview of what&apos;s happening across your workspace.
        </p>
      </div>

      <StatsGrid stats={stats} />

      <WelcomeCard />
    </div>
  )
}
