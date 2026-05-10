import Link from "next/link"
import { ArrowRight, TableProperties } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

export function TeamTableCard() {
  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <TableProperties className="size-4" />
          </span>
          <div className="space-y-1.5">
            <CardTitle className="font-heading text-base">
              Editable members table
            </CardTitle>
            <CardDescription className="text-pretty">
              On <strong className="font-medium text-foreground">Users</strong>,
              the team grid is view-only until you edit: use the row{" "}
              <strong className="font-medium text-foreground">Edit</strong>{" "}
              control for a full row, or click{" "}
              <strong className="font-medium text-foreground">Name</strong>,{" "}
              <strong className="font-medium text-foreground">Email</strong>,{" "}
              <strong className="font-medium text-foreground">Role</strong>, or{" "}
              <strong className="font-medium text-foreground">Status</strong>{" "}
              for a single field.{" "}
              <strong className="font-medium text-foreground">Save</strong>{" "}
              applies validated changes;{" "}
              <strong className="font-medium text-foreground">Cancel</strong>{" "}
              drops drafts without updating data.
            </CardDescription>
          </div>
        </div>
        <Button asChild className="w-fit gap-2">
          <Link href="/users">
            Open Users table
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
    </Card>
  )
}
