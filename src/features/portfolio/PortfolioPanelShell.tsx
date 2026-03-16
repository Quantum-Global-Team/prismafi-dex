import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function PortfolioPanelShell() {
  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="px-4 pb-3 pt-4">
        <span className="text-xs font-mono font-medium tracking-widest text-text-secondary uppercase">
          Portfolio
        </span>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {/* Total value */}
        <div className="rounded-md bg-bg-primary px-4 py-3">
          <Skeleton className="mb-1.5 h-3 w-20" />
          <Skeleton className="h-7 w-32" />
        </div>

        <Separator className="bg-border-subtle" />

        {/* Holdings */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-16" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="text-right">
                <Skeleton className="mb-1 h-4 w-20" />
                <Skeleton className="ml-auto h-3 w-14" />
              </div>
            </div>
          ))}
        </div>

        {/* Wallet not connected nudge */}
        <div className="rounded-md border border-border-subtle px-3 py-2 text-center">
          <Skeleton className="mx-auto h-3.5 w-36" />
        </div>
      </CardContent>
    </Card>
  )
}
