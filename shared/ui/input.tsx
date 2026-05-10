import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 min-h-9 w-full min-w-0 rounded-none border-0 border-b border-border bg-transparent px-1 py-2 text-xs shadow-none transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "hover:border-muted-foreground/60",
        "focus-visible:border-ring focus-visible:ring-0",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-0",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:px-1 file:text-xs file:font-medium file:text-foreground",
        "md:text-xs dark:bg-transparent dark:hover:bg-transparent dark:focus-visible:ring-0 dark:disabled:bg-transparent dark:aria-invalid:ring-0",
        className
      )}
      {...props}
    />
  )
}

export { Input }
