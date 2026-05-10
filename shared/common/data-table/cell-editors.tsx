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
      className="mt-0.5 max-w-[14rem] text-[11px] leading-tight break-words text-destructive"
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
      className="mt-0.5 max-w-[14rem] text-[11px] leading-snug text-muted-foreground"
    >
      {children}
    </p>
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
    <div className="relative min-w-[7rem] space-y-0.5">
      <span className="pointer-events-none absolute top-1/2 left-0 z-10 -translate-y-1/2 text-xs text-muted-foreground tabular-nums select-none">
        $
      </span>
      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        aria-invalid={fieldState.invalid || undefined}
        aria-describedby={hintId}
        className="h-8 pl-4 tabular-nums"
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
      <FieldHint id={hintId}>
        Optional $ or commas; saves as a whole number.
      </FieldHint>
      <FieldError message={fieldState.error?.message} />
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
    <div className="relative min-w-[5rem] space-y-0.5">
      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        aria-invalid={fieldState.invalid || undefined}
        aria-describedby={hintId}
        className="h-8 pr-6 tabular-nums"
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
      <span className="pointer-events-none absolute top-1/2 right-1 z-10 -translate-y-1/2 text-xs text-muted-foreground select-none">
        %
      </span>
      <FieldHint id={hintId}>0–100; % is optional.</FieldHint>
      <FieldError message={fieldState.error?.message} />
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
    <div className="min-w-[10rem] space-y-0.5">
      <Input
        type="tel"
        autoComplete="tel"
        placeholder="+1 (415) 555-2671"
        autoFocus={autoFocus}
        aria-invalid={fieldState.invalid || undefined}
        aria-describedby={hintId}
        className="h-8"
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
      <FieldHint id={hintId}>
        Stored as E.164. Ten-digit US numbers are prefixed with +1 on blur.
      </FieldHint>
      <FieldError message={fieldState.error?.message} />
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
        <div className="min-w-[8rem] space-y-0.5">
          <Select
            value={String(field.value ?? "")}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              size="sm"
              aria-invalid={fieldState.invalid || undefined}
              className="h-8 min-h-8 w-full px-0.5"
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
        <div className="flex flex-col items-center gap-0.5">
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
        <div className="flex flex-col items-center gap-0.5">
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
        <div className="min-w-[9rem] space-y-0.5">
          <Input
            {...field}
            value={String(field.value ?? "")}
            type="date"
            autoFocus={autoFocus}
            aria-invalid={fieldState.invalid || undefined}
            className="h-8"
            onChange={(e) => field.onChange(e.target.value)}
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
        <div className="min-w-[5rem] space-y-0.5">
          <Input
            type="number"
            inputMode="decimal"
            autoFocus={autoFocus}
            aria-invalid={fieldState.invalid || undefined}
            className="h-8"
            value={
              typeof field.value === "number" && Number.isFinite(field.value)
                ? field.value
                : typeof field.value === "string"
                  ? field.value
                  : ""
            }
            onChange={(e) => {
              const v = e.target.value
              field.onChange(v === "" ? "" : Number(v))
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
        <div className="min-w-[6rem] space-y-0.5">
          <Input
            {...field}
            value={String(field.value ?? "")}
            type="text"
            autoFocus={autoFocus}
            aria-invalid={fieldState.invalid || undefined}
            className="h-8"
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
  customEditors,
}: CellEditorProps<T>) {
  const key = typeof inputType === "string" ? inputType : undefined
  const Custom = key ? customEditors?.[key] : undefined
  if (Custom) {
    return <Custom control={control} columnId={name} autoFocus={autoFocus} />
  }

  const builtinKey: DataTableBuiltinInputType =
    key !== undefined && key in BUILTIN_CELL_EDITORS
      ? (key as DataTableBuiltinInputType)
      : "text"

  const Builtin = BUILTIN_CELL_EDITORS[builtinKey]
  if (Builtin) {
    return Builtin({
      control: control as Control<FieldValues>,
      name: name as FieldPath<FieldValues>,
      options,
      autoFocus,
    })
  }

  return BuiltinTextEditor({
    control: control as Control<FieldValues>,
    name: name as FieldPath<FieldValues>,
    autoFocus,
  })
}
