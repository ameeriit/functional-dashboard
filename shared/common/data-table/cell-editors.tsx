"use client"

import {
  type ComponentType,
  type ReactElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import {
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import type {
  DataTableBuiltinInputType,
  DataTableInputType,
} from "@/shared/common/data-table/types"
import {
  formatCurrencyDraft,
  formatPercentageDraft,
  normalizeNepaliDigitsToAscii,
  normalizePhoneE164,
  parseCurrencyInput,
  parsePercentageInput,
} from "@/shared/lib/parse-field-input"
import { cn } from "@/shared/lib/utils"
import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="w-full max-w-full min-w-0 text-[11px] leading-snug wrap-break-word hyphens-auto text-destructive"
    >
      {message}
    </p>
  )
}

function FieldHint({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <p
      id={id}
      className="w-full max-w-full min-w-0 text-[11px] leading-snug wrap-break-word hyphens-auto text-muted-foreground"
    >
      {children}
    </p>
  )
}

/** Constrains editors + helper/error copy to the cell width; text-align matches column meta. */
function CellEditorShell({
  align = "left",
  children,
}: {
  align?: "left" | "right" | "center"
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "w-full max-w-full min-w-0 space-y-1",
        align === "right" && "text-right [&_input]:text-right",
        align === "center" && "text-center [&_input]:text-center",
        align === "left" && "text-left"
      )}
    >
      {children}
    </div>
  )
}

function CurrencyEditableInput<T extends FieldValues>({
  field,
  fieldState,
  autoFocus,
}: {
  field: ControllerRenderProps<T, FieldPath<T>>
  fieldState: ControllerFieldState
  autoFocus?: boolean
}) {
  const hintId = useId()
  const focusedRef = useRef(false)
  const [text, setText] = useState(() => formatCurrencyDraft(field.value))

  useEffect(() => {
    if (!focusedRef.current) {
      setText(formatCurrencyDraft(field.value))
    }
  }, [field.value])

  return (
    <div className="w-full min-w-0 space-y-1">
      <div className="relative w-full min-w-0">
        <span className="pointer-events-none absolute top-1/2 left-2 z-10 -translate-y-1/2 text-xs text-muted-foreground tabular-nums select-none">
          $
        </span>
        <Input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          aria-invalid={fieldState.invalid || undefined}
          aria-describedby={hintId}
          className="h-8 w-full min-w-0 pl-6 tabular-nums"
          value={text}
          onFocus={() => {
            focusedRef.current = true
          }}
          onBlur={() => {
            focusedRef.current = false
            let n = parseCurrencyInput(text)
            if (Number.isNaN(n)) {
              n =
                typeof field.value === "number" && Number.isFinite(field.value)
                  ? field.value
                  : 0
            }
            n = Math.max(0, n)
            field.onChange(n)
            setText(formatCurrencyDraft(n))
            field.onBlur()
          }}
          onChange={(e) => {
            const raw = e.target.value
            setText(raw)
            const n = parseCurrencyInput(raw)
            if (!Number.isNaN(n)) {
              field.onChange(n)
            }
          }}
        />
      </div>
      <div className="space-y-0.5">
        <FieldHint id={hintId}>
          Optional $ or commas; saves as a whole number.
        </FieldHint>
        <FieldError message={fieldState.error?.message} />
      </div>
    </div>
  )
}

function PercentageEditableInput<T extends FieldValues>({
  field,
  fieldState,
  autoFocus,
}: {
  field: ControllerRenderProps<T, FieldPath<T>>
  fieldState: ControllerFieldState
  autoFocus?: boolean
}) {
  const hintId = useId()
  const focusedRef = useRef(false)
  const [text, setText] = useState(() => formatPercentageDraft(field.value))

  useEffect(() => {
    if (!focusedRef.current) {
      setText(formatPercentageDraft(field.value))
    }
  }, [field.value])

  return (
    <div className="w-full min-w-0 space-y-1">
      <div className="relative w-full min-w-0">
        <Input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          aria-invalid={fieldState.invalid || undefined}
          aria-describedby={hintId}
          className="h-8 w-full min-w-0 pr-7 tabular-nums"
          value={text}
          onFocus={() => {
            focusedRef.current = true
          }}
          onBlur={() => {
            focusedRef.current = false
            let n = parsePercentageInput(text)
            if (Number.isNaN(n)) {
              n =
                typeof field.value === "number" && Number.isFinite(field.value)
                  ? field.value
                  : 0
            }
            n = Math.min(100, Math.max(0, n))
            field.onChange(n)
            setText(formatPercentageDraft(n))
            field.onBlur()
          }}
          onChange={(e) => {
            const raw = e.target.value
            setText(raw)
            const n = parsePercentageInput(raw)
            if (!Number.isNaN(n)) {
              field.onChange(n)
            }
          }}
        />
        <span className="pointer-events-none absolute top-1/2 right-2 z-10 -translate-y-1/2 text-xs text-muted-foreground select-none">
          %
        </span>
      </div>
      <div className="space-y-0.5">
        <FieldHint id={hintId}>0–100; % is optional.</FieldHint>
        <FieldError message={fieldState.error?.message} />
      </div>
    </div>
  )
}

function PhoneEditableInput<T extends FieldValues>({
  field,
  fieldState,
  autoFocus,
}: {
  field: ControllerRenderProps<T, FieldPath<T>>
  fieldState: ControllerFieldState
  autoFocus?: boolean
}) {
  const hintId = useId()
  const focusedRef = useRef(false)
  const [text, setText] = useState(() => String(field.value ?? ""))

  useEffect(() => {
    if (!focusedRef.current) {
      setText(String(field.value ?? ""))
    }
  }, [field.value])

  return (
    <div className="w-full min-w-0 space-y-1">
      <Input
        type="tel"
        autoComplete="tel"
        placeholder="+1 (415) 555-2671"
        autoFocus={autoFocus}
        aria-invalid={fieldState.invalid || undefined}
        aria-describedby={hintId}
        className="h-8 w-full min-w-0"
        value={text}
        onFocus={() => {
          focusedRef.current = true
        }}
        onBlur={() => {
          focusedRef.current = false
          const norm = normalizePhoneE164(text)
          field.onChange(norm)
          setText(norm)
          field.onBlur()
        }}
        onChange={(e) => {
          const raw = e.target.value
          setText(raw)
          field.onChange(raw)
        }}
      />
      <div className="space-y-0.5">
        <FieldHint id={hintId}>
          Stored as E.164. Ten-digit US numbers are prefixed with +1 on blur.
        </FieldHint>
        <FieldError message={fieldState.error?.message} />
      </div>
    </div>
  )
}

type BuiltinEditorProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  options?: ReadonlyArray<{ value: string; label: string }>
  autoFocus?: boolean
}

function BuiltinSelectEditor<T extends FieldValues>({
  control,
  name,
  options,
}: BuiltinEditorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="w-full min-w-0 space-y-1">
          <Select
            value={String(field.value ?? "")}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              size="sm"
              aria-invalid={fieldState.invalid || undefined}
              className="h-8 min-h-8 w-full min-w-0 px-0.5"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

function BuiltinCheckboxEditor<T extends FieldValues>({
  control,
  name,
}: BuiltinEditorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex w-full min-w-0 flex-col items-center gap-1">
          <Checkbox
            checked={field.value === true}
            onCheckedChange={(v) => field.onChange(v === true)}
            aria-invalid={fieldState.invalid || undefined}
            className={cn(fieldState.invalid && "border-destructive")}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

function BuiltinSwitchEditor<T extends FieldValues>({
  control,
  name,
}: BuiltinEditorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex w-full min-w-0 flex-col items-center gap-1">
          <Switch
            checked={field.value === true}
            onCheckedChange={field.onChange}
            aria-invalid={fieldState.invalid || undefined}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

function BuiltinDateEditor<T extends FieldValues>({
  control,
  name,
  autoFocus,
}: BuiltinEditorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="w-full min-w-0 space-y-1">
          <Input
            type="text"
            placeholder="YYYY-MM-DD"
            autoComplete="off"
            autoFocus={autoFocus}
            aria-invalid={fieldState.invalid || undefined}
            className="h-8 w-full min-w-0 tabular-nums"
            value={String(field.value ?? "")}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            onChange={(e) =>
              field.onChange(normalizeNepaliDigitsToAscii(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation()
              }
            }}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

function BuiltinPhoneEditor<T extends FieldValues>({
  control,
  name,
  autoFocus,
}: BuiltinEditorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <PhoneEditableInput<T>
          field={field}
          fieldState={fieldState}
          autoFocus={autoFocus}
        />
      )}
    />
  )
}

function BuiltinCurrencyEditor<T extends FieldValues>({
  control,
  name,
  autoFocus,
}: BuiltinEditorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <CurrencyEditableInput<T>
          field={field}
          fieldState={fieldState}
          autoFocus={autoFocus}
        />
      )}
    />
  )
}

function BuiltinPercentageEditor<T extends FieldValues>({
  control,
  name,
  autoFocus,
}: BuiltinEditorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <PercentageEditableInput<T>
          field={field}
          fieldState={fieldState}
          autoFocus={autoFocus}
        />
      )}
    />
  )
}

function BuiltinNumberEditor<T extends FieldValues>({
  control,
  name,
  autoFocus,
}: BuiltinEditorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="w-full min-w-0 space-y-1">
          <Input
            type="text"
            inputMode="numeric"
            autoFocus={autoFocus}
            aria-invalid={fieldState.invalid || undefined}
            className="h-8 w-full min-w-0 tabular-nums"
            value={
              typeof field.value === "number" && Number.isFinite(field.value)
                ? String(field.value)
                : typeof field.value === "string"
                  ? field.value
                  : ""
            }
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            onChange={(e) => {
              const ascii = normalizeNepaliDigitsToAscii(e.target.value).trim()
              if (ascii === "") {
                field.onChange("")
                return
              }
              if (/^\d+$/.test(ascii)) {
                field.onChange(Number.parseInt(ascii, 10))
              } else {
                field.onChange(ascii)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation()
              }
            }}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

function BuiltinTextEditor<T extends FieldValues>({
  control,
  name,
  autoFocus,
}: BuiltinEditorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="w-full min-w-0 space-y-1">
          <Input
            {...field}
            value={String(field.value ?? "")}
            type="text"
            autoFocus={autoFocus}
            aria-invalid={fieldState.invalid || undefined}
            className="h-8 w-full min-w-0"
            onChange={(e) => field.onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation()
              }
            }}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

type AnyBuiltinEditorFn = (
  props: BuiltinEditorProps<FieldValues>
) => ReactElement

/** Extend here when adding a new built-in `meta.inputType`. */
const BUILTIN_CELL_EDITORS: Partial<
  Record<DataTableBuiltinInputType, AnyBuiltinEditorFn>
> = {
  text: BuiltinTextEditor as AnyBuiltinEditorFn,
  number: BuiltinNumberEditor as AnyBuiltinEditorFn,
  select: BuiltinSelectEditor as AnyBuiltinEditorFn,
  checkbox: BuiltinCheckboxEditor as AnyBuiltinEditorFn,
  switch: BuiltinSwitchEditor as AnyBuiltinEditorFn,
  date: BuiltinDateEditor as AnyBuiltinEditorFn,
  phone: BuiltinPhoneEditor as AnyBuiltinEditorFn,
  currency: BuiltinCurrencyEditor as AnyBuiltinEditorFn,
  percentage: BuiltinPercentageEditor as AnyBuiltinEditorFn,
}

type CellEditorProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  inputType: DataTableInputType | undefined
  options?: ReadonlyArray<{ value: string; label: string }>
  autoFocus?: boolean
  /** From column `meta.align`; toggles default to centered helpers when omitted. */
  cellAlign?: "left" | "right" | "center"
  customEditors?: Partial<
    Record<
      string,
      ComponentType<{
        control: Control<T>
        columnId: FieldPath<T>
        autoFocus?: boolean
      }>
    >
  >
}

export function DataTableCellEditor<T extends FieldValues>({
  control,
  name,
  inputType,
  options,
  autoFocus,
  cellAlign,
  customEditors,
}: CellEditorProps<T>) {
  const resolvedAlign =
    cellAlign ??
    (inputType === "switch" || inputType === "checkbox" ? "center" : "left")

  const wrap = (node: ReactElement) => (
    <CellEditorShell align={resolvedAlign}>{node}</CellEditorShell>
  )

  const key = typeof inputType === "string" ? inputType : undefined
  const Custom = key ? customEditors?.[key] : undefined
  if (Custom) {
    return wrap(
      <Custom control={control} columnId={name} autoFocus={autoFocus} />
    )
  }

  const builtinKey: DataTableBuiltinInputType =
    key !== undefined && key in BUILTIN_CELL_EDITORS
      ? (key as DataTableBuiltinInputType)
      : "text"

  const Builtin = BUILTIN_CELL_EDITORS[builtinKey]
  if (Builtin) {
    return wrap(
      Builtin({
        control: control as Control<FieldValues>,
        name: name as FieldPath<FieldValues>,
        options,
        autoFocus,
      })
    )
  }

  return wrap(
    BuiltinTextEditor({
      control: control as Control<FieldValues>,
      name: name as FieldPath<FieldValues>,
      autoFocus,
    })
  )
}
