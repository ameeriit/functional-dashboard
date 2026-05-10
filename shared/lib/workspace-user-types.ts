export type UserStatus = "active" | "invited" | "suspended"

export type UserRole = "Owner" | "Admin" | "Member" | "Viewer"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastActive: string
  /** E.164 */
  phone: string
  /** USD, whole dollars */
  annualSalary: number
  /** 0–100 */
  bonusPercent: number
  /** `YYYY-MM-DD` */
  hireDate: string
  notificationsEnabled: boolean
  marketingOptIn: boolean
  /** PTO days */
  ptoDays: number
}
