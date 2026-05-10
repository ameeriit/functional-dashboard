import type { FeaturePlugin, NavSection } from "./types"

export function buildNav(
  features: readonly FeaturePlugin[],
  sectionOrder: readonly string[] = ["Overview", "Workspace"]
): NavSection[] {
  const sections = new Map<string, NavSection>()

  for (const feature of features) {
    if (!feature.nav) continue
    const { section, item } = feature.nav
    const existing = sections.get(section)
    if (existing) {
      existing.items.push(item)
    } else {
      sections.set(section, { label: section, items: [item] })
    }
  }

  const ordered: NavSection[] = []
  for (const label of sectionOrder) {
    const section = sections.get(label)
    if (section) {
      ordered.push(section)
      sections.delete(label)
    }
  }
  for (const section of sections.values()) {
    ordered.push(section)
  }

  return ordered
}
