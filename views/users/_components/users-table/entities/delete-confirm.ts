import type { User } from "@/views/users/entities/types"

export const usersTableDeleteConfirm = {
  title: (user: User) => `Remove ${user.name}?`,
  description: (user: User) =>
    `${user.email} will lose access to this workspace. This action cannot be undone.`,
  confirmLabel: "Remove",
} as const
