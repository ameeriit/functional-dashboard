import { Users } from "lucide-react"

import type { NavContribution } from "@/core/nav/types"

export const usersNav: NavContribution = {
  section: "Workspace",
  item: { title: "Users", href: "/users", icon: Users },
}
