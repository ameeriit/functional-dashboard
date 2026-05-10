import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

export function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview for your workspace. Use the sidebar to move between sections.
        </p>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="font-heading text-base">
            About this app
          </CardTitle>
          <CardDescription className="leading-relaxed text-pretty">
            This is a small dashboard shell built with Next.js and shared UI
            components. The{" "}
            <strong className="font-medium text-foreground">Users</strong>{" "}
            section holds the team table where you can review members and use
            row or cell editing when you need to change details.
          </CardDescription>
          <Button asChild variant="outline" className="w-fit gap-2">
            <Link href="/users">
              Go to Users
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>
    </div>
  )
}
