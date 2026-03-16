import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const TIMEFRAMES = ["1H", "4H", "1D", "1W"] as const

export function ChartPanelShell() {
  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
        {/* Timeframe selector */}
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              className="rounded px-2 py-1 font-mono text-xs text-text-secondary transition-colors first:bg-bg-primary first:text-brand-primary hover:text-text-primary"
            >
              {tf}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {/* Chart area placeholder */}
        <Skeleton className="h-64 w-full rounded-md" />
        {/* Price axis hint */}
        <div className="mt-2 flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </CardContent>
    </Card>
  )
}
