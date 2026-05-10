export type UserStatus = "active" | "invited" | "suspended"

export type UserRole = "Owner" | "Admin" | "Member" | "Viewer"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastActive: string
}
