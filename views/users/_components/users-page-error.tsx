type UsersPageErrorProps = {
  message: string
  title?: string
}

export function UsersPageError({
  message,
  title = "Users",
}: UsersPageErrorProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      <p role="alert" className="text-sm font-medium text-destructive">
        {message}
      </p>
    </div>
  )
}
