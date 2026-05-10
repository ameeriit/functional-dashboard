import { getUsers, UsersPageSection } from "@/features/users"

export const metadata = {
  title: "Users",
}

export default async function UsersPage() {
  const users = await getUsers()
  return <UsersPageSection users={users} />
}
