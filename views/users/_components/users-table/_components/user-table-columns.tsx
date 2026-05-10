import { filterFns, sortingFns, type ColumnDef } from "@tanstack/react-table"

import { booleanStringEqualsFilter } from "@/shared/common/data-table"
import {
  formatIsoDate,
  formatLastActive,
  formatPercentage,
  formatPhoneNational,
  formatUsdWhole,
} from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import "@/shared/common/data-table/types"
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
  const roleFilterOptions = roles.map((r) => ({
    value: String(r.value),
    label: r.label,
  }))
  const statusFilterOptions = statuses.map((s) => ({
    value: String(s.value),
    label: s.label,
  }))

  return [
    {
      accessorKey: "name",
      header: "Name",
      size: 172,
      filterFn: filterFns.includesString,
      meta: {
        editable: true,
        inputType: "text",
        filterVariant: "text",
      },
      cell: ({ getValue }) => (
        <span className="font-medium">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 204,
      filterFn: filterFns.includesString,
      meta: {
        editable: true,
        inputType: "text",
        filterVariant: "text",
      },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      size: 148,
      filterFn: filterFns.includesString,
      meta: {
        editable: true,
        inputType: "phone",
        filterVariant: "text",
      },
      cell: ({ getValue }) => (
        <span className="tracking-tight tabular-nums">
          {formatPhoneNational(String(getValue()))}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      size: 128,
      filterFn: filterFns.equalsString,
      meta: {
        editable: true,
        inputType: "select",
        options: roles.map((r) => ({
          value: String(r.value),
          label: r.label,
        })),
        filterVariant: "select",
        filterOptions: roleFilterOptions,
      },
      cell: ({ getValue }) => (
        <Badge variant="secondary">{String(getValue())}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 128,
      filterFn: filterFns.equalsString,
      meta: {
        editable: true,
        inputType: "select",
        options: statuses.map((s) => ({
          value: String(s.value),
          label: s.label,
        })),
        filterVariant: "select",
        filterOptions: statusFilterOptions,
      },
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
      accessorKey: "annualSalary",
      header: "Salary",
      size: 116,
      sortingFn: sortingFns.basic,
      filterFn: filterFns.includesString,
      meta: {
        align: "right",
        editable: true,
        inputType: "currency",
        filterVariant: "text",
      },
      cell: ({ getValue }) => (
        <span className="tabular-nums">
          {formatUsdWhole(Number(getValue()))}
        </span>
      ),
    },
    {
      accessorKey: "bonusPercent",
      header: "Bonus",
      size: 92,
      sortingFn: sortingFns.basic,
      filterFn: filterFns.includesString,
      meta: {
        align: "right",
        editable: true,
        inputType: "percentage",
        filterVariant: "text",
      },
      cell: ({ getValue }) => (
        <span className="tabular-nums">
          {formatPercentage(Number(getValue()))}
        </span>
      ),
    },
    {
      accessorKey: "ptoDays",
      header: "PTO (days)",
      size: 96,
      sortingFn: sortingFns.basic,
      filterFn: filterFns.includesString,
      meta: {
        align: "right",
        editable: true,
        inputType: "number",
        filterVariant: "text",
      },
      cell: ({ getValue }) => (
        <span className="tabular-nums">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "hireDate",
      header: "Hire date",
      size: 132,
      filterFn: filterFns.includesString,
      meta: {
        editable: true,
        inputType: "date",
        filterVariant: "text",
      },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatIsoDate(String(getValue()))}
        </span>
      ),
    },
    {
      accessorKey: "notificationsEnabled",
      header: "Alerts",
      size: 88,
      filterFn: booleanStringEqualsFilter,
      meta: {
        align: "center",
        editable: true,
        inputType: "switch",
        filterVariant: "select",
        filterOptions: [
          { value: "true", label: "On" },
          { value: "false", label: "Off" },
        ],
      },
      cell: ({ getValue }) =>
        getValue() === true ? (
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10"
          >
            On
          </Badge>
        ) : (
          <Badge variant="secondary">Off</Badge>
        ),
    },
    {
      accessorKey: "marketingOptIn",
      header: "Marketing",
      size: 104,
      filterFn: booleanStringEqualsFilter,
      meta: {
        align: "center",
        editable: true,
        inputType: "checkbox",
        filterVariant: "select",
        filterOptions: [
          { value: "true", label: "Subscribed" },
          { value: "false", label: "Not subscribed" },
        ],
      },
      cell: ({ getValue }) =>
        getValue() === true ? (
          <span className="text-[11px] text-muted-foreground">Subscribed</span>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "lastActive",
      header: "Last active",
      size: 156,
      enableColumnFilter: false,
      meta: {
        filterVariant: "none",
        globalFilterText: (v) => formatLastActive(String(v ?? "")),
      },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatLastActive(String(getValue()))}
        </span>
      ),
    },
  ]
}
