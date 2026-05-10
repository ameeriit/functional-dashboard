import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

import type { Stat } from "@/views/overview/entities/types"

export function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon
  const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between">
          <CardDescription>{stat.label}</CardDescription>
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        </div>
        <CardTitle className="font-heading text-2xl tabular-nums">
          {stat.value}
        </CardTitle>
        <Badge
          variant="outline"
          className={cn(
            "w-fit gap-1",
            stat.trend === "up"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          )}
        >
          <TrendIcon className="size-3" />
          {stat.delta}
        </Badge>
      </CardHeader>
    </Card>
  )
}
