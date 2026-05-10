import { UsersPage } from "@/views/users/users-page"
import {
  getUserRoles,
  getUsers,
  getUserStatuses,
} from "@/views/users/api/users-data"

export const metadata = {
  title: "Users",
}

export default async function Page() {
  const [users, roles, statuses] = await Promise.all([
    getUsers(),
    getUserRoles(),
    getUserStatuses(),
  ])
  return <UsersPage users={users} roles={roles} statuses={statuses} />
}
