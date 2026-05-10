import { Activity, DollarSign, ShoppingCart, Users } from "lucide-react"

import type { Stat } from "@/views/overview/entities/types"

const mockStats: Stat[] = [
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

export async function getOverviewStats(): Promise<Stat[]> {
  return mockStats
}
