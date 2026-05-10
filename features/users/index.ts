import type { FeaturePlugin } from "@/core/nav/types"

import { usersNav } from "./nav"

export { getUsers } from "./api/get-users"
export { UsersPageSection } from "./ui/users-page-section"
export type { User, UserRole, UserStatus } from "./model/types"

export const usersFeature: FeaturePlugin = {
  id: "users",
  nav: usersNav,
}
