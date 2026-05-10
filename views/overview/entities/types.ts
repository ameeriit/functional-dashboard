import { LucideIcon } from "lucide-react"

export type StatTrend = "up" | "down"

export type Stat = {
  label: string
  value: string
  delta: string
  trend: StatTrend
  icon: LucideIcon
}
