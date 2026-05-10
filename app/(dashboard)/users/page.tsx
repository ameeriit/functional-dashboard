import { UsersPage } from "@/views/users/users-page"
import { getUsers } from "@/views/users/api/users-data"

export const metadata = {
  title: "Users",
}

export default async function Page() {
  const users = await getUsers()
  return <UsersPage users={users} />
}
