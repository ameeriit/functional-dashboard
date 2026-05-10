import { UsersTable } from "@/views/users/_components/users-table"
import type { User } from "@/views/users/entities/types"

export function UsersPage({ users }: { users: User[] }) {
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

      <UsersTable users={users} />
    </div>
  )
}
