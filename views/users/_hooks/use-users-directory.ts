"use client"

import * as React from "react"

import { getUserRoles, getUserStatuses } from "@/views/users/api/users-data"
import type {
  UserRoleOption,
  UserStatusOption,
} from "@/views/users/api/users-data"
export function useUsersDirectory() {
  const [roles, setRoles] = React.useState<UserRoleOption[]>([])
  const [statuses, setStatuses] = React.useState<UserStatusOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextRoles, nextStatuses] = await Promise.all([
        getUserRoles(),
        getUserStatuses(),
      ])
      setRoles(nextRoles)
      setStatuses(nextStatuses)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load team data.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      void load()
    })
    return () => cancelAnimationFrame(id)
  }, [load])

  return { roles, statuses, loading, error, reload: load }
}
