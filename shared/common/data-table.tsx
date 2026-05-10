"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table"
import { Pencil, Save, Trash2, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/common/confirm-dialog"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean
    inputType?: "text" | "number" | "select"
    options?: ReadonlyArray<{ value: string; label: string }>
    align?: "left" | "right" | "center"
  }
}

export type EditMode = "off" | "row" | "cell" | "both"

export type DeleteConfirm<TData> =
  | false
  | {
      title?: React.ReactNode | ((row: TData) => React.ReactNode)
      description?: React.ReactNode | ((row: TData) => React.ReactNode)
      confirmLabel?: string
      cancelLabel?: string
    }

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  getRowId: (row: TData) => string
  editMode?: EditMode
  onEdit?: (row: TData) => void
  onSave?: (row: TData, patch: Partial<TData>) => void | Promise<void>
  onDelete?: (row: TData) => void | Promise<void>
  deleteConfirm?: DeleteConfirm<TData>
  validateDraft?: (
    row: TData,
    draft: Partial<TData>
  ) => string | null | Promise<string | null>
  emptyState?: React.ReactNode
  className?: string
}

type EditState<TData> = {
  rowId: string
  columnId?: string
  draft: Partial<TData>
}

function computePatch<TData extends object>(
  original: TData,
  draft: Partial<TData>
): Partial<TData> {
  const patch = {} as Partial<TData>
  for (const key of Object.keys(draft) as (keyof TData)[]) {
    const next = draft[key]
    if (next !== undefined && Object.is(next, original[key]) === false) {
      patch[key] = next
    }
  }
  return patch
}

function resolveCopy<TData, T>(
  value: T | ((row: TData) => T) | undefined,
  row: TData,
  fallback: T
): T {
  if (value === undefined) return fallback
  if (typeof value === "function") {
    return (value as (row: TData) => T)(row)
  }
  return value
}

export function DataTable<TData extends object>({
  columns,
  data,
  getRowId,
  editMode = "off",
  onEdit,
  onSave,
  onDelete,
  deleteConfirm,
  validateDraft,
  emptyState = "No data.",
  className,
}: DataTableProps<TData>) {
  const [edit, setEdit] = React.useState<EditState<TData> | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  )

  const rowEditEnabled = editMode === "row" || editMode === "both"
  const cellEditEnabled = editMode === "cell" || editMode === "both"

  const showActions = editMode !== "off" || onDelete !== undefined

  const handleCancel = React.useCallback(() => {
    setEdit(null)
    setValidationError(null)
  }, [])

  const handleSave = React.useCallback(
    async (row: TData) => {
      if (!edit) return
      const patch = computePatch(row, edit.draft)

      if (Object.keys(patch).length === 0) {
        setValidationError("No changes to save.")
        return
      }

      if (validateDraft) {
        const err = await validateDraft(row, patch)
        if (err) {
          setValidationError(err)
          return
        }
      }

      setValidationError(null)
      if (onSave) {
        setSaving(true)
        try {
          await onSave(row, patch)
        } finally {
          setSaving(false)
        }
      }
      setEdit(null)
    },
    [edit, onSave, validateDraft]
  )

  const handleEnterEdit = React.useCallback(
    (rowId: string, original: TData, columnId?: string) => {
      setValidationError(null)
      onEdit?.(original)
      setEdit({ rowId, columnId, draft: {} })
    },
    [onEdit]
  )

  const augmentedColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!showActions) return columns
    return [
      ...columns,
      {
        id: "_actions",
        size: 112,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const rowBusy = edit?.rowId === row.id
          if (rowBusy) {
            return (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 gap-1 px-2"
                  onClick={() => void handleSave(row.original)}
                  disabled={saving}
                  aria-label="Save changes"
                >
                  <Save className="size-3.5" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-2"
                  onClick={handleCancel}
                  disabled={saving}
                  aria-label="Cancel editing"
                >
                  <X className="size-3.5" />
                  Cancel
                </Button>
              </div>
            )
          }
          return (
            <div className="flex items-center justify-end gap-1">
              {rowEditEnabled && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleEnterEdit(row.id, row.original)}
                  aria-label="Edit row"
                >
                  <Pencil className="size-4" />
                </Button>
              )}
              {onDelete &&
                (deleteConfirm === false ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(row.original)}
                    aria-label="Delete row"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                ) : (
                  <ConfirmDialog
                    variant="destructive"
                    title={resolveCopy(
                      deleteConfirm?.title,
                      row.original,
                      "Delete this item?"
                    )}
                    description={resolveCopy(
                      deleteConfirm?.description,
                      row.original,
                      "This action cannot be undone."
                    )}
                    confirmLabel={deleteConfirm?.confirmLabel ?? "Delete"}
                    cancelLabel={deleteConfirm?.cancelLabel ?? "Cancel"}
                    onConfirm={() => onDelete(row.original)}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete row"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    }
                  />
                ))}
            </div>
          )
        },
      },
    ]
  }, [
    columns,
    showActions,
    edit,
    rowEditEnabled,
    onDelete,
    deleteConfirm,
    handleSave,
    handleEnterEdit,
    handleCancel,
    saving,
  ])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: augmentedColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  })

  const updateDraft = React.useCallback((columnId: string, value: unknown) => {
    setValidationError(null)
    setEdit((prev) =>
      prev ? { ...prev, draft: { ...prev.draft, [columnId]: value } } : prev
    )
  }, [])

  function editableValue(
    row: TData,
    columnId: string,
    cellValue: unknown
  ): unknown {
    const d = edit?.draft[columnId as keyof TData]
    return d !== undefined ? d : cellValue
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {validationError ? (
        <p
          role="alert"
          className="text-sm font-medium text-destructive"
          aria-live="polite"
        >
          {validationError}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align ?? "left"
                  return (
                    <TableHead
                      key={header.id}
                      style={
                        header.getSize() !== 150
                          ? { width: header.getSize() }
                          : undefined
                      }
                      className={cn(
                        align === "right" && "text-right",
                        align === "center" && "text-center"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={augmentedColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isRowEditing =
                  edit?.rowId === row.id && !edit.columnId && rowEditEnabled

                return (
                  <TableRow
                    key={row.id}
                    data-editing={edit?.rowId === row.id ? "true" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta
                      const align = meta?.align ?? "left"
                      const editable = meta?.editable === true
                      const activeCellEdit =
                        edit?.rowId === row.id &&
                        edit.columnId === cell.column.id

                      const showInput =
                        (isRowEditing && editable) ||
                        (activeCellEdit && editable && cellEditEnabled)

                      if (showInput) {
                        const rawValue = cell.getValue()
                        const currentValue = editableValue(
                          row.original,
                          cell.column.id,
                          rawValue
                        )

                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              align === "right" && "text-right",
                              align === "center" && "text-center"
                            )}
                          >
                            {meta?.inputType === "select" ? (
                              <Select
                                value={String(currentValue ?? "")}
                                onValueChange={(v) =>
                                  updateDraft(cell.column.id, v)
                                }
                              >
                                <SelectTrigger size="sm" className="h-8 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {meta.options?.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                autoFocus={activeCellEdit}
                                className="h-8"
                                type={
                                  meta?.inputType === "number"
                                    ? "number"
                                    : "text"
                                }
                                value={String(currentValue ?? "")}
                                onChange={(e) =>
                                  updateDraft(
                                    cell.column.id,
                                    meta?.inputType === "number"
                                      ? Number(e.target.value)
                                      : e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    void handleSave(row.original)
                                  } else if (e.key === "Escape") {
                                    handleCancel()
                                  }
                                }}
                                aria-invalid={
                                  validationError ? true : undefined
                                }
                              />
                            )}
                          </TableCell>
                        )
                      }

                      const canStartCellEdit =
                        cellEditEnabled && editable && edit === null

                      return (
                        <TableCell
                          key={cell.id}
                          onClick={
                            canStartCellEdit
                              ? () =>
                                  handleEnterEdit(
                                    row.id,
                                    row.original,
                                    cell.column.id
                                  )
                              : undefined
                          }
                          className={cn(
                            align === "right" && "text-right",
                            align === "center" && "text-center",
                            canStartCellEdit &&
                              "cursor-pointer hover:bg-muted/50"
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
