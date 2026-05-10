"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Search, UserPlus } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { formatLastActive, getInitials } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { DataTable } from "@/shared/common/data-table"
import { Input } from "@/shared/ui/input"
import {
  deleteUser,
  updateUser,
  type UserRoleOption,
  type UserStatusOption,
} from "@/views/users/api/users-data"
import type { User, UserStatus } from "@/views/users/entities/types"

const statusStyles: Record<UserStatus, string> = {
  active:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  invited:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  suspended: "border-destructive/30 bg-destructive/10 text-destructive",
}

const statusLabel: Record<UserStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FIELD_LABELS: Partial<Record<keyof User, string>> = {
  name: "name",
  email: "email",
  role: "role",
  status: "status",
}

function describePatch(patch: Partial<User>): string {
  const fields = (Object.keys(patch) as (keyof User)[])
    .map((k) => FIELD_LABELS[k])
    .filter((label): label is string => Boolean(label))
  if (fields.length === 0) return "Saved."
  if (fields.length === 1) return `Updated ${fields[0]}.`
  if (fields.length === 2) return `Updated ${fields[0]} and ${fields[1]}.`
  return `Updated ${fields.slice(0, -1).join(", ")}, and ${fields.at(-1)}.`
}

function validateUserDraft(user: User, patch: Partial<User>): string | null {
  const next = { ...user, ...patch }
  const name = next.name.trim()
  if (!name) {
    return "Name is required."
  }
  const email = next.email.trim()
  if (!EMAIL_RE.test(email)) {
    return "Enter a valid email address."
  }
  return null
}

function buildColumns(
  roles: UserRoleOption[],
  statuses: UserStatusOption[]
): ColumnDef<User, unknown>[] {
  return [
    {
      id: "avatar",
      header: "",
      size: 56,
      meta: { align: "center" },
      cell: ({ row }) => (
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs text-primary">
            {getInitials(row.original.name)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { editable: true, inputType: "text" },
      cell: ({ getValue }) => (
        <span className="font-medium">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { editable: true, inputType: "text" },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: { editable: true, inputType: "select", options: roles },
      cell: ({ getValue }) => (
        <Badge variant="secondary">{String(getValue())}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: { editable: true, inputType: "select", options: statuses },
      cell: ({ getValue }) => {
        const status = getValue() as UserStatus
        return (
          <Badge
            variant="outline"
            className={cn("capitalize", statusStyles[status])}
          >
            {statusLabel[status]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "lastActive",
      header: "Last active",
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatLastActive(String(getValue()))}
        </span>
      ),
    },
  ]
}

export function UsersTable({
  users: initialUsers,
  roles,
  statuses,
}: {
  users: User[]
  roles: UserRoleOption[]
  statuses: UserStatusOption[]
}) {
  const [users, setUsers] = React.useState(initialUsers)
  const [query, setQuery] = React.useState("")
  const columns = React.useMemo(
    () => buildColumns(roles, statuses),
    [roles, statuses]
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
  }, [users, query])

  const handleSave = React.useCallback(
    async (user: User, patch: Partial<User>) => {
      try {
        const updated = await updateUser(user.id, patch)
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
        toast.success(`Updated ${updated.name}`, {
          description: describePatch(patch),
        })
      } catch (error) {
        toast.error(`Couldn't update ${user.name}`, {
          description:
            error instanceof Error ? error.message : "Please try again.",
        })
        throw error
      }
    },
    []
  )

  const handleDelete = React.useCallback(async (user: User) => {
    try {
      await deleteUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      toast.success(`Removed ${user.name}`, {
        description: `${user.email} no longer has access.`,
      })
    } catch (error) {
      toast.error(`Couldn't remove ${user.name}`, {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
      throw error
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Team members</CardTitle>
        <CardDescription>
          View mode by default. Use &quot;Edit&quot; to edit a whole row, or
          click Role or Status (and Name / Email) to edit one field. Save
          applies changes; Cancel discards drafts — nothing updates until you
          save.
        </CardDescription>
        <CardAction className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or role"
              className="pl-8"
              aria-label="Search users"
            />
          </div>
          <Button>
            <UserPlus />
            Invite
          </Button>
        </CardAction>
      </CardHeader>

      <div className="border-t">
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(u) => u.id}
          editMode="both"
          onSave={handleSave}
          onDelete={handleDelete}
          deleteConfirm={{
            title: (user) => `Remove ${user.name}?`,
            description: (user) =>
              `${user.email} will lose access to this workspace. This action cannot be undone.`,
            confirmLabel: "Remove",
          }}
          validateDraft={validateUserDraft}
          emptyState="No users match your search."
        />
      </div>
    </Card>
  )
}
