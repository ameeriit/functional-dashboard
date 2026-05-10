import { StatsGrid } from "@/views/overview/_components/stats-grid"
import { WelcomeCard } from "@/views/overview/_components/welcome-card"
import type { Stat } from "@/views/overview/entities/types"

export function OverviewPage({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          A quick overview of what&apos;s happening across your workspace.
        </p>
      </div>

      <StatsGrid stats={stats} />

      <WelcomeCard />
    </div>
  )
}
