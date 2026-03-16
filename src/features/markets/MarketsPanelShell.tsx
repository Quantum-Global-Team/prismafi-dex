import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MarketsPanelShell() {
  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium tracking-widest text-text-secondary uppercase">
            FX Markets
          </span>
          <Skeleton className="h-4 w-14" />
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {/* Column headers */}
        <div className="mb-2 grid grid-cols-3 px-2 text-[11px] font-mono text-text-secondary">
          <span>Pair</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h</span>
        </div>
        {/* Skeleton rows */}
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-3 items-center rounded-md px-2 py-2"
            >
              <Skeleton className="h-4 w-16" />
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="ml-auto h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
