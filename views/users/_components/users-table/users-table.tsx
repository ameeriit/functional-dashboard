"use client"

import * as React from "react"

import { DataTable } from "@/shared/common/data-table"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import {
  getUserDraftDefaults,
  userDraftResolver,
  type UserDraftFormValues,
} from "@/views/users/_components/users-table/api/user-draft"
import { buildUserColumns } from "@/views/users/_components/users-table/_components/user-table-columns"
import { useUserDelete } from "@/views/users/_components/users-table/_hooks/use-user-delete"
import { useUserSave } from "@/views/users/_components/users-table/_hooks/use-user-save"
import { usersTableDeleteConfirm } from "@/views/users/_components/users-table/entities/delete-confirm"
import type {
  UserRoleOption,
  UserStatusOption,
} from "@/views/users/api/users-data"
import type { User } from "@/views/users/entities/types"

export function UsersTable({
  users,
  setUsers,
  roles,
  statuses,
}: {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  roles: UserRoleOption[]
  statuses: UserStatusOption[]
}) {
  const { handleSave } = useUserSave(setUsers)
  const { handleDelete } = useUserDelete(setUsers)

  const columns = React.useMemo(
    () => buildUserColumns(roles, statuses),
    [roles, statuses]
  )

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading text-base">Team members</CardTitle>
        <CardDescription>
          View mode by default. Use &quot;Edit&quot; to edit a whole row, or
          click Role or Status (and Name / Email) to edit one field. Save
          applies changes; Cancel discards drafts — nothing updates until you
          save.
        </CardDescription>
      </CardHeader>

      <div className="min-w-0 border-t">
        <DataTable<User, UserDraftFormValues>
          columns={columns}
          data={users}
          getRowId={(u) => u.id}
          editMode="both"
          onSave={handleSave}
          onDelete={handleDelete}
          deleteConfirm={usersTableDeleteConfirm}
          draftResolver={userDraftResolver}
          getDraftDefaults={getUserDraftDefaults}
          emptyState="No team members yet."
          tableCaption="Workspace team members, roles, contact details, and activity"
        />
      </div>
    </Card>
  )
}
