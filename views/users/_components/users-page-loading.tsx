import { Skeleton } from "@/shared/ui/skeleton"

type UsersPageLoadingProps = {
  title?: string
}

export function UsersPageLoading({ title = "Users" }: UsersPageLoadingProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="sr-only">{title} loading</span>
        <Skeleton className="h-8 w-40" aria-hidden />
        <Skeleton className="h-4 w-full max-w-md" aria-hidden />
      </div>
      <div className="space-y-3 rounded-lg border p-4">
        <Skeleton className="h-5 w-32" aria-hidden />
        <Skeleton className="h-4 w-full max-w-lg" aria-hidden />
        <Skeleton className="h-40 w-full" aria-hidden />
      </div>
    </div>
  )
}
