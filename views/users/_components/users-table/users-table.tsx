"use client"

import * as React from "react"

import { DataTable } from "@/shared/common/data-table"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import {
  getUserDraftDefaults,
  userDraftFormSchema,
  type UserDraftFormValues,
} from "@/views/users/_components/users-table/api/user-draft"
import { buildUserColumns } from "@/views/users/_components/users-table/_components/user-table-columns"
import { useUserDelete } from "@/views/users/_components/users-table/_hooks/use-user-delete"
import { useUserSave } from "@/views/users/_components/users-table/_hooks/use-user-save"
import { useUsersRemoteQuery } from "@/views/users/_components/users-table/_hooks/use-users-remote-query"
import { usersTableDeleteConfirm } from "@/views/users/_components/users-table/entities/delete-confirm"
import type {
  UserRoleOption,
  UserStatusOption,
} from "@/views/users/api/users-data"
import type { User } from "@/views/users/entities/types"

export function UsersTable({
  roles,
  statuses,
}: {
  roles: UserRoleOption[]
  statuses: UserStatusOption[]
}) {
  const { rows, setRows, filteredCount, loading, error, runQuery } =
    useUsersRemoteQuery()

  const { handleSave } = useUserSave(setRows)
  const { handleDelete } = useUserDelete(setRows)

  const columns = React.useMemo(
    () => buildUserColumns(roles, statuses),
    [roles, statuses]
  )

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading text-base">Team members</CardTitle>
        <CardDescription>
          Server-style paging on an in-memory mock API with simulated latency.
          Search is debounced; filters, sort, pagination, and visible columns
          persist locally. Use row edit or click cells to change fields; saves
          apply optimistically and roll back if the request fails. While
          editing, Escape cancels and ⌘/Ctrl+Enter saves (same as Save).
        </CardDescription>
      </CardHeader>

      <div className="min-w-0 border-t">
        <DataTable<User, UserDraftFormValues>
          columns={columns}
          data={rows}
          getRowId={(u) => u.id}
          editMode="both"
          onSave={handleSave}
          onDelete={handleDelete}
          deleteConfirm={usersTableDeleteConfirm}
          draftSchema={userDraftFormSchema}
          getDraftDefaults={getUserDraftDefaults}
          manualPagination
          manualSorting
          manualFiltering
          rowCount={filteredCount}
          persistenceKey="users-directory"
          debounceGlobalSearchMs={320}
          onQueryChange={runQuery}
          isLoading={loading}
          fetchError={error}
          emptyState="No team members match the current filters."
          tableCaption="Workspace team members, roles, contact details, and activity"
        />
      </div>
    </Card>
  )
}
