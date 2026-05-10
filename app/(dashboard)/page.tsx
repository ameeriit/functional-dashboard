import { ArrowDownRight, ArrowUpRight, DollarSign, ShoppingCart, Users, Activity } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Stat = {
  label: string
  value: string
  delta: string
  trend: "up" | "down"
  icon: React.ComponentType<{ className?: string }>
}

const stats: Stat[] = [
  {
    label: "Total revenue",
    value: "$48,219.00",
    delta: "+12.4%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Active users",
    value: "2,381",
    delta: "+5.1%",
    trend: "up",
    icon: Users,
  },
  {
    label: "Orders",
    value: "1,204",
    delta: "-2.3%",
    trend: "down",
    icon: ShoppingCart,
  },
  {
    label: "Conversion rate",
    value: "3.46%",
    delta: "+0.8%",
    trend: "up",
    icon: Activity,
  },
]

export default function DashboardPage() {
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight
          return (
            <Card key={stat.label}>
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.label}</CardDescription>
                  <span className="text-muted-foreground bg-muted flex size-8 items-center justify-center rounded-md">
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
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">
            Welcome to your functional dashboard
          </CardTitle>
          <CardDescription>
            Use the sidebar to jump between sections. Try{" "}
            <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">⌘ B</kbd> to
            toggle the sidebar, or{" "}
            <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">D</kbd> to
            toggle dark mode.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
