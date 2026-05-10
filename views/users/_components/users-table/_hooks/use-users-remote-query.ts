"use client"

import * as React from "react"

import type { DataTableQuerySnapshot } from "@/shared/common/data-table"
import {
  fetchWorkspaceUsersPage,
  type WorkspaceUsersPageQuery,
} from "@/views/users/api/users-data"
import type { User } from "@/views/users/entities/types"

export function useUsersRemoteQuery() {
  const [rows, setRows] = React.useState<User[]>([])
  const [filteredCount, setFilteredCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const requestSeq = React.useRef(0)

  const runQuery = React.useCallback((snapshot: DataTableQuerySnapshot) => {
    const seq = ++requestSeq.current
    const payload: WorkspaceUsersPageQuery = {
      pageIndex: snapshot.pagination.pageIndex,
      pageSize: snapshot.pagination.pageSize,
      sorting: snapshot.sorting,
      globalFilter: snapshot.globalFilter,
      columnFilters: snapshot.columnFilters,
    }

    setLoading(true)
    setError(null)

    void fetchWorkspaceUsersPage(payload)
      .then((result) => {
        if (requestSeq.current !== seq) return
        setRows(result.rows)
        setFilteredCount(result.filteredCount)
      })
      .catch((e: unknown) => {
        if (requestSeq.current !== seq) return
        setError(e instanceof Error ? e.message : "Could not load users.")
        setRows([])
        setFilteredCount(0)
      })
      .finally(() => {
        if (requestSeq.current !== seq) return
        setLoading(false)
      })
  }, [])

  return { rows, setRows, filteredCount, loading, error, runQuery }
}
