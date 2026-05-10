import type { User } from "@/views/users/entities/types"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FIELD_LABELS: Partial<Record<keyof User, string>> = {
  name: "name",
  email: "email",
  role: "role",
  status: "status",
}

export function describePatch(patch: Partial<User>): string {
  const fields = (Object.keys(patch) as (keyof User)[])
    .map((k) => FIELD_LABELS[k])
    .filter((label): label is string => Boolean(label))
  if (fields.length === 0) return "Saved."
  if (fields.length === 1) return `Updated ${fields[0]}.`
  if (fields.length === 2) return `Updated ${fields[0]} and ${fields[1]}.`
  return `Updated ${fields.slice(0, -1).join(", ")}, and ${fields.at(-1)}.`
}

export function validateUserDraft(
  user: User,
  patch: Partial<User>
): string | null {
  const next = { ...user, ...patch }
  const name = next.name.trim()
  if (!name) {
    return "Name is required."
  }
  const email = next.email.trim()
  if (!EMAIL_RE.test(email)) {
    return "Enter a valid email address."
  }
  return null
}
