import type { FeaturePlugin } from "@/core/nav/types"

import { usersNav } from "./nav"

export const usersFeature: FeaturePlugin = {
  id: "users",
  nav: usersNav,
}
