import type { User } from "../model/types"
import { UsersTable } from "./users-table"

export function UsersPageSection({ users }: { users: User[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage who has access to your workspace and what they can do.
        </p>
      </div>

      <UsersTable users={users} />
    </div>
  )
}
