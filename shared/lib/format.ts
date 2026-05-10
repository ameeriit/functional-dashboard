export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function formatLastActive(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const usdFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export function formatUsdWhole(amount: number) {
  return usdFormatter.format(Math.round(amount))
}

export function formatPercentage(value: number) {
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}%`
}

export function formatIsoDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number)
  if (!y || !m || !d) return isoDate
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    dateStyle: "medium",
  })
}

/** Display-only formatting for E.164 stored values */
export function formatPhoneNational(e164: string) {
  const digits = e164.replace(/\D/g, "")
  if (digits.length === 11 && digits.startsWith("1")) {
    const n = digits.slice(1)
    return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return e164
}
