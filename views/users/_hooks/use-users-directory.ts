"use client"

import * as React from "react"

import {
  getUserRoles,
  getUsers,
  getUserStatuses,
} from "@/views/users/api/users-data"
import type {
  UserRoleOption,
  UserStatusOption,
} from "@/views/users/api/users-data"
import type { User } from "@/views/users/entities/types"

export function useUsersDirectory() {
  const [users, setUsers] = React.useState<User[]>([])
  const [roles, setRoles] = React.useState<UserRoleOption[]>([])
  const [statuses, setStatuses] = React.useState<UserStatusOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextUsers, nextRoles, nextStatuses] = await Promise.all([
        getUsers(),
        getUserRoles(),
        getUserStatuses(),
      ])
      setUsers(nextUsers)
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

  return { users, setUsers, roles, statuses, loading, error, reload: load }
}
