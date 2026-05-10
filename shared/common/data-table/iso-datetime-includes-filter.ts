import type { Row, RowData } from "@tanstack/react-table"

import { formatLastActive } from "@/shared/lib/format"

/**
 * Column filter: matches substring against ISO storage and locale-formatted display
 * (so queries like "may", "2026", "pm" work alongside ISO fragments).
 */
export function isoDateTimeIncludesFilter<TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
  const q = String(filterValue ?? "")
    .toLowerCase()
    .trim()
  if (!q) return true
  const raw = row.getValue(columnId)
  if (raw === undefined || raw === null) return false
  const iso = String(raw).toLowerCase()
  const formatted = formatLastActive(String(raw)).toLowerCase()
  return iso.includes(q) || formatted.includes(q)
}
