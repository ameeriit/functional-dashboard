import type { RowData } from "@tanstack/react-table"
import type { PropsWithChildren, ReactNode } from "react"
import type { Control, FieldValues } from "react-hook-form"

/** Builtin `meta.inputType` values; editors live in `cell-editors.tsx`. */
export const DATA_TABLE_BUILTIN_INPUT_TYPES = [
  "text",
  "number",
  "select",
  "checkbox",
  "switch",
  "date",
  "phone",
  "currency",
  "percentage",
] as const

export type DataTableBuiltinInputType =
  (typeof DATA_TABLE_BUILTIN_INPUT_TYPES)[number]

export type DataTableInputType = DataTableBuiltinInputType | (string & {})

export type DataTableFilterVariant = "none" | "text" | "select"

export type DataTableCustomEditorProps<TFormValues extends FieldValues> =
  PropsWithChildren<{
    control: Control<TFormValues>
    columnId: string
    autoFocus?: boolean
  }>

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean
    inputType?: DataTableInputType
    options?: ReadonlyArray<{ value: string; label: string }>
    align?: "left" | "right" | "center"
    filterVariant?: DataTableFilterVariant
    filterOptions?: ReadonlyArray<{ value: string; label: string }>
    enableSorting?: boolean
    enableColumnFilter?: boolean
    enableResizing?: boolean
    includeInGlobalFilter?: boolean
    globalFilterText?: (cellValue: unknown) => string | undefined
    renderEditor?: (ctx: {
      control: Control<FieldValues>
      columnId: string
      autoFocus?: boolean
    }) => ReactNode
  }
}
