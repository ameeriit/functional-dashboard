"use client"

import * as React from "react"

export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    if (ms <= 0) return
    const id = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])

  return ms <= 0 ? value : debounced
}
