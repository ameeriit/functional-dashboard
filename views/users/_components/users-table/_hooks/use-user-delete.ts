import * as React from "react"
import { toast } from "sonner"

import { deleteUser } from "@/views/users/api/users-data"
import type { User } from "@/views/users/entities/types"

export function useUserDelete(
  setRows: React.Dispatch<React.SetStateAction<User[]>>
) {
  const handleDelete = React.useCallback(
    async (user: User) => {
      try {
        await deleteUser(user.id)
        setRows((prev) => prev.filter((u) => u.id !== user.id))
        toast.error(`Removed ${user.name}`, {
          description: `${user.email} no longer has access.`,
        })
      } catch (error) {
        toast.warning(`Couldn't remove ${user.name}`, {
          description:
            error instanceof Error ? error.message : "Please try again.",
        })
        throw error
      }
    },
    [setRows]
  )

  return { handleDelete }
}
