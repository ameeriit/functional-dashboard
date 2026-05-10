import type { Row, RowData } from "@tanstack/react-table"

export function booleanStringEqualsFilter<TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
  const fv = filterValue as string | undefined
  if (fv === undefined || fv === "" || fv === "__all__") {
    return true
  }
  return String(row.getValue(columnId)) === fv
}
