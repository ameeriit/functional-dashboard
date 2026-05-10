import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"

export type PersistedDataTableStateV1 = {
  version: 1
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  pagination: PaginationState
  globalFilter: string
}

const PREFIX = "functional-dashboard:table:"

export function readPersistedDataTableState(
  persistenceKey: string
): PersistedDataTableStateV1 | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${persistenceKey}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedDataTableStateV1
    if (parsed?.version !== 1 || !parsed.pagination) return null
    return parsed
  } catch {
    return null
  }
}

export function writePersistedDataTableState(
  persistenceKey: string,
  state: PersistedDataTableStateV1
): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      `${PREFIX}${persistenceKey}`,
      JSON.stringify(state)
    )
  } catch {
    /* quota / private mode */
  }
}
