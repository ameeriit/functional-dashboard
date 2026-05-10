"use client"

import { UsersPageError } from "@/views/users/_components/users-page-error"
import { UsersPageLoading } from "@/views/users/_components/users-page-loading"
import { UsersTable } from "@/views/users/_components/users-table"
import { useUsersDirectory } from "@/views/users/_hooks/use-users-directory"

export function UsersPage() {
  const { users, setUsers, roles, statuses, loading, error } =
    useUsersDirectory()

  if (error) {
    return <UsersPageError message={error} />
  }

  if (loading) {
    return <UsersPageLoading />
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage who has access to your workspace and what they can do. Data
          loads on this client page; edits call the in-memory mock API.
        </p>
      </div>

      <UsersTable
        users={users}
        setUsers={setUsers}
        roles={roles}
        statuses={statuses}
      />
    </div>
  )
}
