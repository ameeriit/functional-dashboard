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
  },
  {
    id: "u_02",
    name: "Ethan Caldwell",
    email: "qz9m1n@zappost.dev",
    role: "Admin",
    status: "active",
    lastActive: "2026-05-09T22:01:00Z",
  },
  {
    id: "u_03",
    name: "Sophia Whitfield",
    email: "h4w8tx@quicknest.app",
    role: "Member",
    status: "invited",
    lastActive: "2026-05-08T11:42:00Z",
  },
  {
    id: "u_04",
    name: "Liam Harrington",
    email: "v3b6yj@inboxly.co",
    role: "Member",
    status: "active",
    lastActive: "2026-05-09T17:20:00Z",
  },
  {
    id: "u_05",
    name: "Charlotte Pierce",
    email: "n0c5fd@swiftmail.xyz",
    role: "Viewer",
    status: "suspended",
    lastActive: "2026-04-29T08:55:00Z",
  },
  {
    id: "u_06",
    name: "Noah Sullivan",
    email: "u8e3la@dropletmail.io",
    role: "Admin",
    status: "active",
    lastActive: "2026-05-10T01:03:00Z",
  },
  {
    id: "u_07",
    name: "Amelia Lockwood",
    email: "t1k7sv@blipnote.app",
    role: "Member",
    status: "active",
    lastActive: "2026-05-07T19:30:00Z",
  },
  {
    id: "u_08",
    name: "Henry Ashford",
    email: "x6p2hd@zentrymail.dev",
    role: "Viewer",
    status: "invited",
    lastActive: "2026-05-06T13:10:00Z",
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
