"use client"

import { Skeleton } from "@/shared/ui/skeleton"
import { UsersTable } from "@/views/users/_components/users-table"
import { useUsersDirectory } from "@/views/users/_hooks/use-users-directory"

export function UsersPage() {
  const { users, setUsers, roles, statuses, loading, error } =
    useUsersDirectory()

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Users
          </h1>
        </div>
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="space-y-3 rounded-lg border p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
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
