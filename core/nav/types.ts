import type { LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export type NavSection = {
  label: string
  items: NavItem[]
}

export type NavContribution = {
  section: string
  item: NavItem
}

export type FeaturePlugin = {
  id: string
  nav?: NavContribution
}
