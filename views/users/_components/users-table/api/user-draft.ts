import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { z } from "zod/v3"

import {
  normalizeNepaliDigitsToAscii,
  normalizePhoneE164,
  parseCurrencyInput,
  parsePercentageInput,
} from "@/shared/lib/parse-field-input"
import type { User } from "@/views/users/entities/types"

const roleEnum = z.enum(["Owner", "Admin", "Member", "Viewer"])
const statusEnum = z.enum(["active", "invited", "suspended"])

const phoneSchema = z.preprocess(
  (v) => normalizePhoneE164(String(v ?? "")),
  z
    .string()
    .min(1, "Phone number is required.")
    .regex(
      /^\+[1-9]\d{9,14}$/,
      "After +, use 10–15 digits (Western 0–9 or Nepali ०–९)."
    )
)

const salarySchema = z.preprocess(
  (v) => {
    const n = parseCurrencyInput(v)
    return Number.isNaN(n) ? v : n
  },
  z
    .number({
      message: "Enter a valid amount (Western or Nepali digits).",
    })
    .min(0, "Amount must be zero or greater.")
    .max(999_999_999, "Amount is too large.")
)

const bonusSchema = z.preprocess(
  (v) => {
    const n = parsePercentageInput(v)
    return Number.isNaN(n) ? v : n
  },
  z
    .number({
      message: "Enter a valid percentage (Western or Nepali digits).",
    })
    .min(0, "Percentage must be at least 0.")
    .max(100, "Percentage cannot exceed 100.")
)

const hireDateSchema = z.preprocess(
  (v) => normalizeNepaliDigitsToAscii(String(v ?? "").trim()),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD (Western or Nepali digits).")
    .refine((s) => !Number.isNaN(Date.parse(`${s}T12:00:00Z`)), {
      message: "Pick a real calendar date.",
    })
)

const ptoDaysSchema = z.preprocess(
  (v) => {
    if (typeof v === "number" && Number.isFinite(v)) return v
    const s = normalizeNepaliDigitsToAscii(String(v ?? "").trim())
    if (s === "") return v
    const n = Number.parseInt(s, 10)
    return Number.isFinite(n) ? n : v
  },
  z
    .number({
      message: "Enter a valid number of days (Western or Nepali digits).",
    })
    .int("Use whole days.")
    .min(0, "PTO days cannot be negative.")
    .max(365, "PTO days cannot exceed 365.")
)

export const userDraftFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  role: roleEnum,
  status: statusEnum,
  phone: phoneSchema,
  annualSalary: salarySchema,
  bonusPercent: bonusSchema,
  ptoDays: ptoDaysSchema,
  hireDate: hireDateSchema,
  notificationsEnabled: z.boolean(),
  marketingOptIn: z.boolean(),
})

export type UserDraftFormValues = z.infer<typeof userDraftFormSchema>

export const userDraftResolver = zodResolver(
  userDraftFormSchema
) as Resolver<UserDraftFormValues>

export function getUserDraftDefaults(row: User): UserDraftFormValues {
  return {
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    phone: row.phone,
    annualSalary: row.annualSalary,
    bonusPercent: row.bonusPercent,
    ptoDays: row.ptoDays,
    hireDate: row.hireDate,
    notificationsEnabled: row.notificationsEnabled,
    marketingOptIn: row.marketingOptIn,
  }
}
