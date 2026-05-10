import type { ColumnDef } from "@tanstack/react-table"

import { formatLastActive, getInitials } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import type {
  UserRoleOption,
  UserStatusOption,
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

export function buildUserColumns(
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
