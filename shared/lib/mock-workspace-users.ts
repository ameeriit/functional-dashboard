import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"

import { formatLastActive } from "@/shared/lib/format"
import type {
  User,
  UserRole,
  UserStatus,
} from "@/shared/lib/workspace-user-types"

export type UserRoleOption = { value: UserRole; label: string }
export type UserStatusOption = { value: UserStatus; label: string }

const mockUserRoles: UserRoleOption[] = [
  { value: "Owner", label: "Owner" },
  { value: "Admin", label: "Admin" },
  { value: "Member", label: "Member" },
  { value: "Viewer", label: "Viewer" },
]

const mockUserStatuses: UserStatusOption[] = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "suspended", label: "Suspended" },
]

const mockUsers: User[] = [
  {
    id: "u_01",
    name: "Olivia Bennett",
    email: "k7r2pq@mailwhirl.io",
    role: "Owner",
    status: "active",
    lastActive: "2026-05-10T03:14:00Z",
    phone: "+14155551001",
    annualSalary: 185000,
    bonusPercent: 15,
    hireDate: "2019-03-18",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 11,
  },
  {
    id: "u_02",
    name: "Ethan Caldwell",
    email: "qz9m1n@zappost.dev",
    role: "Admin",
    status: "active",
    lastActive: "2026-05-09T22:01:00Z",
    phone: "+14155551002",
    annualSalary: 142500,
    bonusPercent: 12.5,
    hireDate: "2021-07-01",
    notificationsEnabled: true,
    marketingOptIn: true,
    ptoDays: 12,
  },
  {
    id: "u_03",
    name: "Sophia Whitfield",
    email: "h4w8tx@quicknest.app",
    role: "Member",
    status: "invited",
    lastActive: "2026-05-08T11:42:00Z",
    phone: "+14155551003",
    annualSalary: 98000,
    bonusPercent: 8,
    hireDate: "2024-11-12",
    notificationsEnabled: false,
    marketingOptIn: false,
    ptoDays: 13,
  },
  {
    id: "u_04",
    name: "Liam Harrington",
    email: "v3b6yj@inboxly.co",
    role: "Member",
    status: "active",
    lastActive: "2026-05-09T17:20:00Z",
    phone: "+14155551004",
    annualSalary: 105600,
    bonusPercent: 10,
    hireDate: "2023-02-20",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 14,
  },
  {
    id: "u_05",
    name: "Charlotte Pierce",
    email: "n0c5fd@swiftmail.xyz",
    role: "Viewer",
    status: "suspended",
    lastActive: "2026-04-29T08:55:00Z",
    phone: "+14155551005",
    annualSalary: 76250,
    bonusPercent: 5,
    hireDate: "2022-09-05",
    notificationsEnabled: false,
    marketingOptIn: true,
    ptoDays: 15,
  },
  {
    id: "u_06",
    name: "Noah Sullivan",
    email: "u8e3la@dropletmail.io",
    role: "Admin",
    status: "active",
    lastActive: "2026-05-10T01:03:00Z",
    phone: "+14155551006",
    annualSalary: 156000,
    bonusPercent: 14,
    hireDate: "2020-05-11",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 16,
  },
  {
    id: "u_07",
    name: "Amelia Lockwood",
    email: "t1k7sv@blipnote.app",
    role: "Member",
    status: "active",
    lastActive: "2026-05-07T19:30:00Z",
    phone: "+14155551007",
    annualSalary: 112000,
    bonusPercent: 9.25,
    hireDate: "2024-01-15",
    notificationsEnabled: false,
    marketingOptIn: false,
    ptoDays: 17,
  },
  {
    id: "u_08",
    name: "Henry Ashford",
    email: "x6p2hd@zentrymail.dev",
    role: "Viewer",
    status: "invited",
    lastActive: "2026-05-06T13:10:00Z",
    phone: "+14155551008",
    annualSalary: 88000,
    bonusPercent: 7,
    hireDate: "2025-08-30",
    notificationsEnabled: true,
    marketingOptIn: true,
    ptoDays: 18,
  },
  {
    id: "u_09",
    name: "Maya Chen",
    email: "maya.chen@northbeam.dev",
    role: "Member",
    status: "active",
    lastActive: "2026-05-09T09:15:00Z",
    phone: "+14155551009",
    annualSalary: 101250,
    bonusPercent: 9,
    hireDate: "2023-06-01",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 19,
  },
  {
    id: "u_10",
    name: "James Porter",
    email: "jporter@cratemail.io",
    role: "Admin",
    status: "active",
    lastActive: "2026-05-10T06:40:00Z",
    phone: "+14155551010",
    annualSalary: 168000,
    bonusPercent: 15,
    hireDate: "2018-11-22",
    notificationsEnabled: false,
    marketingOptIn: true,
    ptoDays: 20,
  },
  {
    id: "u_11",
    name: "Priya Desai",
    email: "priya.d@brightledger.app",
    role: "Member",
    status: "invited",
    lastActive: "2026-05-05T14:22:00Z",
    phone: "+14155551011",
    annualSalary: 94500,
    bonusPercent: 8.5,
    hireDate: "2025-02-10",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 21,
  },
  {
    id: "u_12",
    name: "Marcus Webb",
    email: "m.webb@signalpost.co",
    role: "Viewer",
    status: "active",
    lastActive: "2026-05-08T21:05:00Z",
    phone: "+14155551012",
    annualSalary: 71800,
    bonusPercent: 4,
    hireDate: "2024-04-18",
    notificationsEnabled: false,
    marketingOptIn: false,
    ptoDays: 22,
  },
  {
    id: "u_13",
    name: "Elena Vasquez",
    email: "elena.v@ridgeline.xyz",
    role: "Member",
    status: "active",
    lastActive: "2026-05-10T02:18:00Z",
    phone: "+14155551013",
    annualSalary: 119400,
    bonusPercent: 11,
    hireDate: "2022-01-09",
    notificationsEnabled: true,
    marketingOptIn: true,
    ptoDays: 23,
  },
  {
    id: "u_14",
    name: "Daniel Frost",
    email: "dfrost@oaktrail.mail",
    role: "Admin",
    status: "suspended",
    lastActive: "2026-04-12T16:30:00Z",
    phone: "+14155551014",
    annualSalary: 134500,
    bonusPercent: 13,
    hireDate: "2020-08-14",
    notificationsEnabled: false,
    marketingOptIn: false,
    ptoDays: 24,
  },
  {
    id: "u_15",
    name: "Zoe Nakamura",
    email: "zoe.n@kimlabs.dev",
    role: "Member",
    status: "active",
    lastActive: "2026-05-07T11:48:00Z",
    phone: "+14155551015",
    annualSalary: 99000,
    bonusPercent: 9.75,
    hireDate: "2024-09-23",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 25,
  },
  {
    id: "u_16",
    name: "Ryan Cole",
    email: "ryan.cole@zephyrbox.io",
    role: "Viewer",
    status: "invited",
    lastActive: "2026-05-03T08:10:00Z",
    phone: "+14155551016",
    annualSalary: 82500,
    bonusPercent: 6,
    hireDate: "2025-11-01",
    notificationsEnabled: false,
    marketingOptIn: true,
    ptoDays: 10,
  },
  {
    id: "u_17",
    name: "Isabelle Moore",
    email: "imoore@halcyon.dev",
    role: "Owner",
    status: "active",
    lastActive: "2026-05-10T04:55:00Z",
    phone: "+14155551017",
    annualSalary: 210000,
    bonusPercent: 18,
    hireDate: "2017-05-30",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 11,
  },
  {
    id: "u_18",
    name: "Victor Lindgren",
    email: "vlindgren@pinemail.co",
    role: "Member",
    status: "active",
    lastActive: "2026-05-06T19:12:00Z",
    phone: "+14155551018",
    annualSalary: 108900,
    bonusPercent: 10.25,
    hireDate: "2023-03-07",
    notificationsEnabled: false,
    marketingOptIn: false,
    ptoDays: 12,
  },
  {
    id: "u_19",
    name: "Nadia Rahman",
    email: "nadia.r@threadvault.app",
    role: "Admin",
    status: "active",
    lastActive: "2026-05-09T23:28:00Z",
    phone: "+14155551019",
    annualSalary: 151200,
    bonusPercent: 13.5,
    hireDate: "2019-12-02",
    notificationsEnabled: true,
    marketingOptIn: true,
    ptoDays: 13,
  },
  {
    id: "u_20",
    name: "Owen Fitzgerald",
    email: "owen.f@graydock.mail",
    role: "Viewer",
    status: "active",
    lastActive: "2026-05-08T07:44:00Z",
    phone: "+14155551020",
    annualSalary: 79500,
    bonusPercent: 5.5,
    hireDate: "2025-01-16",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 14,
  },
  {
    id: "u_21",
    name: "Harper Singh",
    email: "harper.singh@solarloom.dev",
    role: "Member",
    status: "invited",
    lastActive: "2026-05-04T13:02:00Z",
    phone: "+14155551021",
    annualSalary: 92800,
    bonusPercent: 8,
    hireDate: "2025-06-20",
    notificationsEnabled: false,
    marketingOptIn: true,
    ptoDays: 15,
  },
  {
    id: "u_22",
    name: "Felix Romero",
    email: "felix.r@circuitnest.io",
    role: "Member",
    status: "active",
    lastActive: "2026-05-09T15:36:00Z",
    phone: "+14155551022",
    annualSalary: 114750,
    bonusPercent: 10,
    hireDate: "2022-10-11",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 16,
  },
  {
    id: "u_23",
    name: "Audrey Kim",
    email: "audrey.kim@morrowlane.app",
    role: "Admin",
    status: "active",
    lastActive: "2026-05-10T10:08:00Z",
    phone: "+14155551023",
    annualSalary: 162400,
    bonusPercent: 14.75,
    hireDate: "2021-04-05",
    notificationsEnabled: true,
    marketingOptIn: false,
    ptoDays: 17,
  },
  {
    id: "u_24",
    name: "Simon Hayes",
    email: "simon.h@baseline.mail",
    role: "Viewer",
    status: "suspended",
    lastActive: "2026-04-28T09:50:00Z",
    phone: "+14155551024",
    annualSalary: 68800,
    bonusPercent: 3,
    hireDate: "2024-07-29",
    notificationsEnabled: false,
    marketingOptIn: false,
    ptoDays: 18,
  },
  {
    id: "u_25",
    name: "Lena Brooks",
    email: "lena.brooks@quietforge.dev",
    role: "Member",
    status: "active",
    lastActive: "2026-05-07T17:24:00Z",
    phone: "+14155551025",
    annualSalary: 103300,
    bonusPercent: 9.5,
    hireDate: "2023-08-19",
    notificationsEnabled: true,
    marketingOptIn: true,
    ptoDays: 19,
  },
]

/** In-memory mock API shared by dashboard stats and the Users table (not a real backend). */
export async function getUsers(): Promise<User[]> {
  return mockUsers
}

export async function getUserRoles(): Promise<UserRoleOption[]> {
  return mockUserRoles
}

export async function getUserStatuses(): Promise<UserStatusOption[]> {
  return mockUserStatuses
}

export async function updateUser(
  id: string,
  patch: Partial<Omit<User, "id">>
): Promise<User> {
  const index = mockUsers.findIndex((u) => u.id === id)
  if (index === -1) throw new Error(`User ${id} not found`)
  mockUsers[index] = { ...mockUsers[index], ...patch }
  return mockUsers[index]
}

export async function deleteUser(id: string): Promise<{ id: string }> {
  const index = mockUsers.findIndex((u) => u.id === id)
  if (index === -1) throw new Error(`User ${id} not found`)
  mockUsers.splice(index, 1)
  return { id }
}

/** Server-style paginated read over the in-memory mock store (simulated latency). */
export type WorkspaceUsersPageQuery = {
  pageIndex: number
  pageSize: number
  sorting: SortingState
  globalFilter: string
  columnFilters: ColumnFiltersState
}

const COLUMN_EQUALS = new Set([
  "role",
  "status",
  "notificationsEnabled",
  "marketingOptIn",
])

function userMatchesColumnFilter(
  user: User,
  columnId: string,
  value: unknown
): boolean {
  const fv = value as string | undefined
  if (fv === undefined || fv === "" || fv === "__all__") return true
  const raw = user[columnId as keyof User]
  if (COLUMN_EQUALS.has(columnId)) {
    return String(raw) === fv
  }
  return String(raw ?? "")
    .toLowerCase()
    .includes(String(fv).toLowerCase())
}

function userMatchesGlobal(user: User, q: string): boolean {
  const needle = q.toLowerCase().trim()
  if (!needle) return true
  const hay = [
    user.name,
    user.email,
    user.phone,
    user.role,
    user.status,
    String(user.annualSalary),
    String(user.bonusPercent),
    String(user.ptoDays),
    user.hireDate,
    String(user.notificationsEnabled),
    String(user.marketingOptIn),
    formatLastActive(user.lastActive),
  ]
    .join(" ")
    .toLowerCase()
  return hay.includes(needle)
}

function compareUsers(
  a: User,
  b: User,
  columnId: string,
  desc: boolean
): number {
  const av = a[columnId as keyof User]
  const bv = b[columnId as keyof User]
  let cmp = 0
  if (typeof av === "number" && typeof bv === "number") {
    cmp = av - bv
  } else if (typeof av === "boolean" && typeof bv === "boolean") {
    cmp = Number(av) - Number(bv)
  } else {
    cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
      numeric: true,
      sensitivity: "base",
    })
  }
  return desc ? -cmp : cmp
}

export async function fetchWorkspaceUsersPage(
  query: WorkspaceUsersPageQuery
): Promise<{ rows: User[]; filteredCount: number }> {
  await new Promise((r) => setTimeout(r, 280))

  let rows = [...mockUsers]
  rows = rows.filter((u) => userMatchesGlobal(u, query.globalFilter))

  for (const { id, value } of query.columnFilters) {
    rows = rows.filter((u) => userMatchesColumnFilter(u, id, value))
  }

  const sorting =
    query.sorting.length > 0 ? query.sorting : [{ id: "name", desc: false }]

  rows.sort((a, b) => {
    for (const s of sorting) {
      const cmp = compareUsers(a, b, s.id, s.desc)
      if (cmp !== 0) return cmp
    }
    return 0
  })

  const filteredCount = rows.length
  const start = query.pageIndex * query.pageSize
  const slice = rows.slice(start, start + query.pageSize)

  return { rows: slice, filteredCount }
}
