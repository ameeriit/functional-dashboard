import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

export function WelcomeCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">
          Welcome to your functional dashboard
        </CardTitle>
        <CardDescription>
          Use the sidebar to jump between sections. Try{" "}
          <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">⌘ B</kbd> to
          toggle the sidebar, or{" "}
          <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">D</kbd> to
          toggle dark mode.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
