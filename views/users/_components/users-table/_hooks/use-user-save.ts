import * as React from "react"
import { toast } from "sonner"

import { updateUser } from "@/views/users/api/users-data"
import { describePatch } from "@/views/users/_components/users-table/user-table-draft"
import type { User } from "@/views/users/entities/types"

export function useUserSave(
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
) {
  const handleSave = React.useCallback(
    async (user: User, patch: Partial<User>) => {
      try {
        const updated = await updateUser(user.id, patch)
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
        toast.success(`Updated ${updated.name}`, {
          description: describePatch(patch),
          closeButton: false,
        })
      } catch (error) {
        toast.warning(`Couldn't update ${user.name}`, {
          description:
            error instanceof Error ? error.message : "Please try again.",
        })
        throw error
      }
    },
    [setUsers]
  )

  return { handleSave }
}
