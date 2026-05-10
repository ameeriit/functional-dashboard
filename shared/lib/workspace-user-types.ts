export type UserStatus = "active" | "invited" | "suspended"

export type UserRole = "Owner" | "Admin" | "Member" | "Viewer"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastActive: string
  /** E.164, e.g. +14155552671 */
  phone: string
  /** Whole USD dollars for mock data */
  annualSalary: number
  /** 0–100 */
  bonusPercent: number
  /** ISO date-only string YYYY-MM-DD */
  hireDate: string
  notificationsEnabled: boolean
  marketingOptIn: boolean
  /** Paid-time-off balance (days); demos plain {@link DataTableInputType | number} editing vs currency. */
  ptoDays: number
}
