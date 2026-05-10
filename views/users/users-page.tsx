import { UsersTable } from "@/views/users/_components/users-table"
import type {
  UserRoleOption,
  UserStatusOption,
} from "@/views/users/api/users-data"
import type { User } from "@/views/users/entities/types"

export function UsersPage({
  users,
  roles,
  statuses,
}: {
  users: User[]
  roles: UserRoleOption[]
  statuses: UserStatusOption[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage who has access to your workspace and what they can do.
        </p>
      </div>

      <UsersTable users={users} roles={roles} statuses={statuses} />
    </div>
  )
}
