/** Devanagari digits (Nepali / Hindi numerals, Unicode U+0966–U+096F) → ASCII 0–9 */
export function normalizeNepaliDigitsToAscii(input: string): string {
  const digits = "०१२३४५६७८९"
  let out = ""
  for (const ch of input) {
    const i = digits.indexOf(ch)
    out += i >= 0 ? String(i) : ch
  }
  return out
}

/** Normalize free-form phone input toward E.164 (best-effort; assumes NANP when 10 digits). */
export function normalizePhoneE164(input: string): string {
  const raw = normalizeNepaliDigitsToAscii(String(input ?? "").trim())
  if (!raw) return ""
  const hasPlus = raw.startsWith("+")
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 0) return ""
  if (hasPlus) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return `+${digits}`
}

/** Parse currency-like text ($, commas, spaces) or accept an existing finite number. */
export function parseCurrencyInput(input: unknown): number {
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : Number.NaN
  }
  const raw = normalizeNepaliDigitsToAscii(String(input ?? "")).replace(
    /[$,\s]/g,
    ""
  )
  if (raw === "" || raw === "-" || raw === ".") return Number.NaN
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : Number.NaN
}

/** Parse percentage text (% optional) or accept an existing finite number. */
export function parsePercentageInput(input: unknown): number {
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : Number.NaN
  }
  const raw = normalizeNepaliDigitsToAscii(String(input ?? ""))
    .replace(/%/g, "")
    .trim()
  if (raw === "" || raw === "-" || raw === ".") return Number.NaN
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : Number.NaN
}

const currencyDraftFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
  useGrouping: true,
})

/** Whole-dollar grouping for the currency editor when not focused on partial input. */
export function formatCurrencyDraft(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return ""
  return currencyDraftFormatter.format(value)
}

const percentageDraftFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Up to two decimal places for the percentage editor (no % suffix; UI adds it). */
export function formatPercentageDraft(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return ""
  return percentageDraftFormatter.format(value)
}
