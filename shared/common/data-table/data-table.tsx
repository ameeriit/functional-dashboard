"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type Header,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  Columns3,
  Pencil,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react"
import * as React from "react"
import {
  useForm,
  type Control,
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  type Resolver,
} from "react-hook-form"
import type { ZodTypeAny } from "zod/v3"

import { useDebouncedValue } from "@/hooks/use-debounced-value"

import { ConfirmDialog } from "@/shared/common/confirm-dialog"
import { DataTableCellEditor } from "@/shared/common/data-table/cell-editors"
import "@/shared/common/data-table/types"
import {
  readPersistedDataTableState,
  writePersistedDataTableState,
} from "@/shared/lib/table-persistence"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Input } from "@/shared/ui/input"
import { Skeleton } from "@/shared/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

import type { ComponentType } from "react"

export type EditMode = "off" | "row" | "cell" | "both"

export type DeleteConfirm<TData> =
  | false
  | {
      title?: React.ReactNode | ((row: TData) => React.ReactNode)
      description?: React.ReactNode | ((row: TData) => React.ReactNode)
      confirmLabel?: string
      cancelLabel?: string
    }

export type DataTableQuerySnapshot = {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
}

/**
 * Filters, global search, and pagination use local React state.
 * Editable cells use React Hook Form (`useForm` + `Controller` via `DataTableCellEditor`).
 */
export type DataTableProps<
  TData extends object,
  TFormValues extends FieldValues = FieldValues,
> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  getRowId: (row: TData) => string
  editMode?: EditMode
  onEdit?: (row: TData) => void
  onSave?: (row: TData, patch: Partial<TData>) => void | Promise<void>
  onDelete?: (row: TData) => void | Promise<void>
  deleteConfirm?: DeleteConfirm<TData>
  /** When set without `draftResolver`, the table uses `zodResolver(draftSchema)`. */
  draftSchema?: ZodTypeAny
  draftResolver?: Resolver<TFormValues>
  getDraftDefaults?: (row: TData) => TFormValues
  customEditors?: Partial<
    Record<
      string,
      ComponentType<{
        control: Control<TFormValues>
        columnId: FieldPath<TFormValues>
        autoFocus?: boolean
      }>
    >
  >
  emptyState?: React.ReactNode
  className?: string
  /** Client-side page size (TanStack pagination). */
  initialPageSize?: number
  pageSizeOptions?: number[]
  showColumnFilters?: boolean
  /** Announced as the table caption for assistive tech (visually hidden; pair with a visible heading nearby). */
  tableCaption?: string
  /** Delay before global filter is applied (server queries, expensive filtering). */
  debounceGlobalSearchMs?: number
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  /** Total rows after filtering when using manual pagination (required when `manualPagination` is true). */
  rowCount?: number
  /** Persist sorting, filters, pagination, column visibility, and search draft to localStorage. */
  persistenceKey?: string
  isLoading?: boolean
  fetchError?: string | null
  /** Fires when debounced global filter, pagination, sorting, or column filters change. */
  onQueryChange?: (snapshot: DataTableQuerySnapshot) => void
  showColumnVisibility?: boolean
}

type EditState = {
  rowId: string
  columnId?: string
}

function computePatchFromForm<
  TData extends object,
  TFormValues extends FieldValues,
>(row: TData, values: TFormValues, keys: string[]): Partial<TData> {
  const patch = {} as Partial<TData>
  const rowRec = row as Record<string, unknown>
  const valRec = values as Record<string, unknown>
  for (const key of keys) {
    if (!(key in valRec)) continue
    const next = valRec[key]
    const prev = rowRec[key]
    if (!Object.is(next, prev)) {
      ;(patch as Record<string, unknown>)[key] = next
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

function collectLeafColumns<TData>(
  columns: ColumnDef<TData, unknown>[]
): ColumnDef<TData, unknown>[] {
  const out: ColumnDef<TData, unknown>[] = []
  const walk = (cols: ColumnDef<TData, unknown>[]) => {
    for (const col of cols) {
      if ("columns" in col && Array.isArray(col.columns)) {
        walk(col.columns as ColumnDef<TData, unknown>[])
      } else {
        out.push(col)
      }
    }
  }
  walk(columns)
  return out
}

function columnHasAccessor<TData>(col: ColumnDef<TData, unknown>): boolean {
  if ("accessorKey" in col && col.accessorKey !== undefined) return true
  const narrow = col as {
    accessorFn?: (originalRow: TData, index: number) => unknown
  }
  return typeof narrow.accessorFn === "function"
}

type GlobalFilterColumnDesc = {
  id: string
  globalFilterText?: (value: unknown) => string | undefined
}

function computeGlobalFilterDescriptors<TData>(
  columns: ColumnDef<TData, unknown>[]
): GlobalFilterColumnDesc[] {
  const out: GlobalFilterColumnDesc[] = []
  for (const col of collectLeafColumns(columns)) {
    const id =
      col.id ??
      ("accessorKey" in col && col.accessorKey !== undefined
        ? String(col.accessorKey)
        : undefined)
    if (!id || id === "_actions") continue
    if (col.meta?.includeInGlobalFilter === false) continue
    if (!columnHasAccessor(col)) continue
    out.push({
      id,
      globalFilterText: col.meta?.globalFilterText,
    })
  }
  return out
}

function computeEditableColumnIds<TData>(
  columns: ColumnDef<TData, unknown>[]
): string[] {
  const ids: string[] = []
  for (const col of collectLeafColumns(columns)) {
    if (col.meta?.editable !== true) continue
    const id =
      col.id ??
      ("accessorKey" in col && col.accessorKey !== undefined
        ? String(col.accessorKey)
        : undefined)
    if (id) ids.push(id)
  }
  return ids
}

export function DataTable<
  TData extends object,
  TFormValues extends FieldValues,
>({
  columns,
  data,
  getRowId,
  editMode = "off",
  onEdit,
  onSave,
  onDelete,
  deleteConfirm,
  draftSchema,
  draftResolver,
  getDraftDefaults,
  customEditors,
  emptyState = "No data.",
  className,
  initialPageSize = 8,
  pageSizeOptions = [5, 10, 25],
  showColumnFilters = true,
  tableCaption,
  debounceGlobalSearchMs = 0,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  rowCount: rowCountProp,
  persistenceKey,
  isLoading = false,
  fetchError = null,
  onQueryChange,
  showColumnVisibility = true,
}: DataTableProps<TData, TFormValues>) {
  const editingEnabled = editMode !== "off"

  const effectiveResolver =
    draftResolver ??
    (draftSchema != null
      ? (zodResolver(draftSchema as never) as Resolver<TFormValues>)
      : undefined)

  if (editingEnabled && (!effectiveResolver || !getDraftDefaults)) {
    throw new Error(
      'DataTable: provide `draftResolver`, or `draftSchema`, plus `getDraftDefaults`, whenever `editMode` is not "off".'
    )
  }

  const hydrated = React.useMemo(
    () => (persistenceKey ? readPersistedDataTableState(persistenceKey) : null),
    [persistenceKey]
  )

  const form = useForm<TFormValues>({
    resolver: effectiveResolver,
    mode: "onChange",
    defaultValues: {} as DefaultValues<TFormValues>,
  })

  const [edit, setEdit] = React.useState<EditState | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  )
  const [sorting, setSorting] = React.useState<SortingState>(
    () => hydrated?.sorting ?? []
  )
  const [filterInput, setFilterInput] = React.useState(
    () => hydrated?.globalFilter ?? ""
  )
  const tableGlobalFilter = useDebouncedValue(
    filterInput,
    debounceGlobalSearchMs > 0 ? debounceGlobalSearchMs : 0
  )
  const [columnSizing, setColumnSizing] = React.useState<
    Record<string, number>
  >({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => hydrated?.columnVisibility ?? {})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    () => hydrated?.columnFilters ?? []
  )
  const [pagination, setPagination] = React.useState<PaginationState>(() => ({
    pageIndex: hydrated?.pagination?.pageIndex ?? 0,
    pageSize: hydrated?.pagination?.pageSize ?? initialPageSize,
  }))

  const onQueryChangeRef = React.useRef(onQueryChange)
  React.useEffect(() => {
    onQueryChangeRef.current = onQueryChange
  }, [onQueryChange])

  React.useEffect(() => {
    if (!persistenceKey) return
    writePersistedDataTableState(persistenceKey, {
      version: 1,
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      globalFilter: filterInput,
    })
  }, [
    persistenceKey,
    sorting,
    columnFilters,
    columnVisibility,
    pagination,
    filterInput,
  ])

  const prevQueryFilterRef = React.useRef({
    gf: tableGlobalFilter,
    cf: columnFilters as ColumnFiltersState,
  })
  React.useEffect(() => {
    if (!manualPagination) return
    const prev = prevQueryFilterRef.current
    const gfChanged = prev.gf !== tableGlobalFilter
    const cfChanged = prev.cf !== columnFilters
    if (gfChanged || cfChanged) {
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    }
    prevQueryFilterRef.current = {
      gf: tableGlobalFilter,
      cf: columnFilters,
    }
  }, [manualPagination, tableGlobalFilter, columnFilters])

  const committedGlobalFilterRef = React.useRef(tableGlobalFilter)
  committedGlobalFilterRef.current = tableGlobalFilter

  React.useEffect(() => {
    const cb = onQueryChangeRef.current
    if (!cb) return
    cb({
      pagination,
      sorting,
      columnFilters,
      globalFilter: tableGlobalFilter,
    })
  }, [pagination, sorting, columnFilters, tableGlobalFilter])

  const rowEditEnabled = editMode === "row" || editMode === "both"
  const cellEditEnabled = editMode === "cell" || editMode === "both"
  const showActions = editingEnabled || onDelete !== undefined

  const globalFilterDescriptors = React.useMemo(
    () => computeGlobalFilterDescriptors(columns),
    [columns]
  )

  const editableColumnIds = React.useMemo(
    () => computeEditableColumnIds(columns),
    [columns]
  )

  const globalFilterFn = React.useMemo(() => {
    const fn: FilterFn<TData> = (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "")
        .toLowerCase()
        .trim()
      if (!q) return true
      for (const { id, globalFilterText } of globalFilterDescriptors) {
        const v = row.getValue(id)
        if (v === undefined || v === null) continue
        const base =
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean"
            ? String(v)
            : JSON.stringify(v)
        const extra = globalFilterText?.(v)
        const haystack =
          `${base}${extra !== undefined && extra !== "" ? ` ${extra}` : ""}`.toLowerCase()
        if (haystack.includes(q)) return true
      }
      return false
    }
    return fn
  }, [globalFilterDescriptors])

  const handleCancel = React.useCallback(() => {
    setEdit(null)
    setValidationError(null)
    form.clearErrors()
  }, [form])

  const submitSave = React.useMemo(
    () =>
      form.handleSubmit(async (values: TFormValues) => {
        if (!edit || !getDraftDefaults) return
        const row = data.find((r) => getRowId(r) === edit.rowId)
        if (!row) return

        const patch = computePatchFromForm(row, values, editableColumnIds)

        if (Object.keys(patch).length === 0) {
          setValidationError("No changes to save.")
          return
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
      }),
    [data, edit, editableColumnIds, form, getDraftDefaults, getRowId, onSave]
  )

  const handleSaveClick = React.useCallback(async () => {
    await submitSave()
  }, [submitSave])

  React.useEffect(() => {
    if (!edit || !getDraftDefaults || saving) return
    const row = data.find((r) => getRowId(r) === edit.rowId)
    if (!row) return
    form.reset(getDraftDefaults(row))
    setValidationError(null)
  }, [data, edit, form, getDraftDefaults, getRowId, saving])

  React.useEffect(() => {
    if (!edit) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleCancel()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [edit, handleCancel])

  const handleEnterEdit = React.useCallback(
    (rowId: string, original: TData, columnId?: string) => {
      setValidationError(null)
      form.clearErrors()
      onEdit?.(original)
      setEdit({ rowId, columnId })
    },
    [form, onEdit]
  )

  const handleColumnResizeKeyDown = React.useCallback(
    (e: React.KeyboardEvent, column: Column<TData, unknown>) => {
      const min = column.columnDef.minSize ?? 84
      const max = column.columnDef.maxSize ?? 560
      const cur = column.getSize()
      const step = e.shiftKey ? 40 : 10
      let next: number | null = null
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        next = Math.max(min, cur - step)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        next = Math.min(max, cur + step)
      } else if (e.key === "Home") {
        e.preventDefault()
        next = min
      } else if (e.key === "End") {
        e.preventDefault()
        next = max
      }
      if (next !== null && next !== cur) {
        setColumnSizing((prev) => ({ ...prev, [column.id]: next }))
      }
    },
    []
  )

  const augmentedColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!showActions) return columns
    return [
      ...columns,
      {
        id: "_actions",
        size: 112,
        minSize: 96,
        maxSize: 200,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        enableColumnFilter: false,
        meta: {
          filterVariant: "none",
          includeInGlobalFilter: false,
        },
        header: () => "Actions",
        cell: ({ row }) => {
          const rowBusy = edit?.rowId === row.id
          if (rowBusy) {
            return (
              <div className="flex items-center justify-start gap-1">
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 gap-1 px-2"
                  type="button"
                  onClick={() => void handleSaveClick()}
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
                  type="button"
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
            <div className="flex items-center justify-start gap-1">
              {rowEditEnabled && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
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
                    type="button"
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
    handleSaveClick,
    handleEnterEdit,
    handleCancel,
    saving,
  ])

  const resolvedRowCount =
    manualPagination && rowCountProp !== undefined ? rowCountProp : undefined

  const manualPageCount =
    manualPagination &&
    resolvedRowCount !== undefined &&
    pagination.pageSize > 0
      ? Math.max(1, Math.ceil(resolvedRowCount / pagination.pageSize))
      : undefined

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table hook surface
  const table = useReactTable({
    data,
    columns: augmentedColumns,
    state: {
      sorting,
      globalFilter: tableGlobalFilter,
      columnSizing,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: (updater) => {
      const base = committedGlobalFilterRef.current
      const next = typeof updater === "function" ? updater(base) : updater
      setFilterInput(next)
    },
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    enableSorting: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount: manualPageCount,
    rowCount: resolvedRowCount,
    defaultColumn: {
      minSize: 84,
      maxSize: 560,
      size: 168,
      enableSorting: true,
      enableResizing: true,
      enableHiding: true,
    },
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    ...(manualPagination
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
    globalFilterFn,
    getRowId,
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  })

  /** Horizontal padding lives on the header stack so title + filter share one inset. */
  const filterControlClass =
    "h-8 min-h-8 w-full min-w-[5.5rem] max-w-full px-0 text-xs"

  function renderSortToggle(header: Header<TData, unknown>) {
    const col = header.column
    const sorted = col.getIsSorted()
    const canSort =
      col.getCanSort() && col.columnDef.meta?.enableSorting !== false

    const align = col.columnDef.meta?.align ?? "left"

    if (!canSort) {
      return (
        <div
          className={cn(
            "flex min-h-8 w-full items-center px-0 text-xs font-medium",
            align === "left" && "justify-start text-left",
            align === "right" && "justify-end text-right",
            align === "center" && "justify-center text-center"
          )}
        >
          {flexRender(col.columnDef.header, header.getContext())}
        </div>
      )
    }

    const sortIcon =
      sorted === "desc" ? (
        <ArrowDownIcon className="size-3.5 opacity-70" />
      ) : sorted === "asc" ? (
        <ArrowUpIcon className="size-3.5 opacity-70" />
      ) : (
        <ArrowUpDownIcon className="size-3.5 opacity-35" />
      )

    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "flex h-8 w-full min-w-0 items-center gap-2 px-0 font-medium",
          align === "left" && "justify-start",
          align === "right" && "justify-end",
          align === "center" && "justify-center",
          "[&_svg]:shrink-0"
        )}
        onClick={col.getToggleSortingHandler()}
      >
        <span
          className={cn(
            "min-w-0 truncate",
            align === "left" && "flex-1 text-left",
            align === "right" && "flex-1 text-right",
            align === "center" && "flex-1 text-center"
          )}
        >
          {flexRender(col.columnDef.header, header.getContext())}
        </span>
        <span className="flex shrink-0 items-center justify-center">
          {sortIcon}
        </span>
      </Button>
    )
  }

  function renderColumnFilter(header: Header<TData, unknown>) {
    const col = header.column
    const variant = col.columnDef.meta?.filterVariant
    const explicitOff = col.columnDef.meta?.enableColumnFilter === false

    if (!showColumnFilters || explicitOff || variant === "none") {
      return null
    }

    if (variant === "select") {
      const opts = col.columnDef.meta?.filterOptions ?? []
      return (
        <Select
          value={(col.getFilterValue() as string | undefined) ?? "__all__"}
          onValueChange={(v) =>
            col.setFilterValue(v === "__all__" ? undefined : v)
          }
        >
          <SelectTrigger size="sm" className={cn(filterControlClass, "gap-1")}>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All</SelectItem>
            {opts.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (variant !== "text") {
      return null
    }

    return (
      <Input
        className={filterControlClass}
        value={(col.getFilterValue() as string) ?? ""}
        placeholder="Filter…"
        aria-label={`Filter ${col.id}`}
        onChange={(e) => col.setFilterValue(e.target.value)}
      />
    )
  }

  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1

  const pageNumbers = React.useMemo(() => {
    const total = pageCount
    const cur = currentPage
    if (total <= 0) return []
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => ({
        type: "page" as const,
        n: i + 1,
      }))
    }
    const pages = new Set<number>(
      [1, total, cur, cur - 1, cur + 1].filter((n) => n >= 1)
    )
    const sorted = [...pages]
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b)
    const out: (
      | { type: "page"; n: number }
      | { type: "ellipsis"; key: string }
    )[] = []
    let prev = 0
    for (const n of sorted) {
      if (prev && n - prev > 1) {
        out.push({ type: "ellipsis", key: `e-${prev}-${n}` })
      }
      out.push({ type: "page", n })
      prev = n
    }
    return out
  }, [currentPage, pageCount])

  const totalRows = manualPagination
    ? (resolvedRowCount ?? 0)
    : table.getFilteredRowModel().rows.length
  const pg = table.getState().pagination
  const pageStart = totalRows === 0 ? 0 : pg.pageIndex * pg.pageSize + 1
  const pageEnd =
    totalRows === 0
      ? 0
      : manualPagination
        ? Math.min(totalRows, pg.pageIndex * pg.pageSize + data.length)
        : Math.min(totalRows, (pg.pageIndex + 1) * pg.pageSize)

  const hideableColumns = table
    .getAllLeafColumns()
    .filter((c) => c.getCanHide())

  /** Matches `CardHeader` inset when this table sits inside `Card` (`group/card`). */
  const cardHeaderInsetX = "px-4 group-data-[size=sm]/card:px-3"

  return (
    <div
      className={cn(
        "flex max-w-full min-w-0 flex-col gap-3 overflow-x-hidden",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between",
          cardHeaderInsetX
        )}
      >
        <div className="flex max-w-full min-w-0 flex-1 items-center gap-2 sm:max-w-sm">
          <Search
            className="pointer-events-none size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <label
            className="sr-only text-muted-foreground"
            htmlFor="dt-global-search"
          >
            Search table
          </label>
          <Input
            id="dt-global-search"
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            placeholder="Search across columns…"
            className="min-h-9 flex-1 px-0"
            disabled={isLoading}
          />
        </div>
        {showColumnVisibility && hideableColumns.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-2"
                aria-label="Toggle column visibility"
              >
                <Columns3 className="size-3.5" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Visible columns
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hideableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="text-xs capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {fetchError ? (
        <p
          role="alert"
          className={cn(
            "text-sm font-medium text-destructive",
            cardHeaderInsetX
          )}
          aria-live="polite"
        >
          {fetchError}
        </p>
      ) : null}

      {validationError ? (
        <p
          role="alert"
          className={cn(
            "text-sm font-medium text-destructive",
            cardHeaderInsetX
          )}
          aria-live="polite"
        >
          {validationError}
        </p>
      ) : null}

      <div className="relative isolate max-w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-none border border-border">
        {isLoading ? (
          <div
            className="absolute inset-0 z-20 flex items-start justify-center bg-background/70 px-4 pt-16 backdrop-blur-[1px]"
            aria-busy="true"
            aria-live="polite"
          >
            <div className="sr-only">Loading table data</div>
            <div className="flex w-full max-w-md flex-col gap-2">
              <Skeleton className="h-9 w-full" aria-hidden />
              <Skeleton className="h-9 w-full" aria-hidden />
              <Skeleton className="h-9 w-3/4" aria-hidden />
            </div>
          </div>
        ) : null}
        <table className="w-full table-fixed caption-bottom text-xs">
          {tableCaption ? (
            <TableCaption className="sr-only">{tableCaption}</TableCaption>
          ) : null}
          <TableHeader className="bg-muted/40 [&_tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canResize =
                    header.column.getCanResize() &&
                    header.column.columnDef.enableResizing !== false

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        width: header.getSize(),
                        position: "relative",
                      }}
                      className={cn(
                        "h-auto min-h-0 py-1.5 align-top whitespace-normal"
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex w-full min-w-0 flex-col gap-1.5 px-0.5">
                          {renderSortToggle(header)}
                          {renderColumnFilter(header)}
                        </div>
                      )}
                      {canResize ? (
                        <div
                          role="separator"
                          tabIndex={0}
                          aria-orientation="vertical"
                          aria-valuenow={Math.round(header.column.getSize())}
                          aria-valuemin={header.column.columnDef.minSize ?? 84}
                          aria-valuemax={header.column.columnDef.maxSize ?? 560}
                          aria-label={`Resize ${header.column.id} column`}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onKeyDown={(e) =>
                            handleColumnResizeKeyDown(e, header.column)
                          }
                          className={cn(
                            "absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize touch-none rounded-none border-r border-transparent bg-border/80 opacity-0 select-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:outline-none",
                            header.column.getIsResizing() &&
                              "bg-primary/60 opacity-100"
                          )}
                        />
                      ) : null}
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
                        editingEnabled &&
                        ((isRowEditing && editable) ||
                          (activeCellEdit && editable && cellEditEnabled))

                      if (showInput) {
                        const columnId = cell.column
                          .id as FieldPath<TFormValues>

                        return (
                          <TableCell
                            key={cell.id}
                            style={{
                              width: cell.column.getSize(),
                            }}
                            className={cn(
                              align === "right" && "text-right",
                              align === "center" && "text-center"
                            )}
                          >
                            {meta?.renderEditor?.({
                              control: form.control as Control<FieldValues>,
                              columnId: cell.column.id,
                              autoFocus: activeCellEdit,
                            }) ?? (
                              <DataTableCellEditor<TFormValues>
                                control={form.control}
                                name={columnId}
                                inputType={meta?.inputType}
                                options={meta?.options}
                                autoFocus={activeCellEdit}
                                customEditors={customEditors}
                              />
                            )}
                          </TableCell>
                        )
                      }

                      const wholeRowEditingThisRow =
                        edit?.columnId === undefined &&
                        edit !== null &&
                        rowEditEnabled &&
                        edit.rowId === row.id

                      const canNavigateToCellEdit =
                        cellEditEnabled &&
                        editable &&
                        !wholeRowEditingThisRow &&
                        (edit === null ||
                          (edit.columnId !== undefined &&
                            (edit.rowId !== row.id ||
                              edit.columnId !== cell.column.id)) ||
                          (edit.columnId === undefined &&
                            rowEditEnabled &&
                            edit.rowId !== row.id))

                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: cell.column.getSize(),
                          }}
                          onClick={
                            canNavigateToCellEdit
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
                            canNavigateToCellEdit &&
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
        </table>
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3 sm:justify-between",
          cardHeaderInsetX
        )}
      >
        <p className="text-xs text-muted-foreground">
          {totalRows === 0
            ? "0 rows"
            : `Showing ${pageStart}–${pageEnd} of ${totalRows}`}
        </p>
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              Rows per page
            </span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" className="h-8 w-18">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  type="button"
                  disabled={totalRows === 0 || !table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                />
              </PaginationItem>
              {pageNumbers.map((item) =>
                item.type === "ellipsis" ? (
                  <PaginationItem key={item.key}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item.n}>
                    <PaginationLink
                      type="button"
                      isActive={item.n === currentPage}
                      onClick={() => table.setPageIndex(item.n - 1)}
                    >
                      {item.n}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  type="button"
                  disabled={totalRows === 0 || !table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
