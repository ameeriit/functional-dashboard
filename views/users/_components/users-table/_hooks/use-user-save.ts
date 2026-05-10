import * as React from "react"
import { toast } from "sonner"

import { updateUser } from "@/views/users/api/users-data"
import { describePatch } from "@/views/users/_components/users-table/api/describe-patch"
import { userDraftFormSchema } from "@/views/users/_components/users-table/api/user-draft"
import type { User } from "@/views/users/entities/types"

export function useUserSave(
  setRows: React.Dispatch<React.SetStateAction<User[]>>
) {
  const handleSave = React.useCallback(
    async (user: User, patch: Partial<User>) => {
      const parsed = userDraftFormSchema.partial().safeParse(patch)
      if (!parsed.success) {
        const msg =
          parsed.error.issues[0]?.message ?? "Changes failed validation."
        toast.warning(`Couldn't update ${user.name}`, {
          description: msg,
        })
        return
      }

      const rollback = user
      const optimistic = { ...user, ...patch } as User
      setRows((prev) => prev.map((u) => (u.id === user.id ? optimistic : u)))
      try {
        const updated = await updateUser(user.id, patch)
        setRows((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
        toast.success(`Updated ${updated.name}`, {
          description: describePatch(patch),
          closeButton: false,
        })
      } catch (error) {
        setRows((prev) => prev.map((u) => (u.id === user.id ? rollback : u)))
        toast.warning(`Couldn't update ${user.name}`, {
          description:
            error instanceof Error ? error.message : "Please try again.",
        })
        throw error
      }
    },
    [setRows]
  )

  return { handleSave }
}
