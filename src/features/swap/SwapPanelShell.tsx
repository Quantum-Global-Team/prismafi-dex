import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function SwapPanelShell() {
  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="px-4 pb-3 pt-4">
        <span className="text-xs font-mono font-medium tracking-widest text-text-secondary uppercase">
          Swap
        </span>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {/* From token input */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-8" />
          <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-primary px-3 py-2.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="ml-auto h-5 w-24" />
          </div>
        </div>

        {/* Switch arrow */}
        <div className="flex justify-center">
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>

        {/* To token input */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-6" />
          <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-primary px-3 py-2.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="ml-auto h-5 w-24" />
          </div>
        </div>

        <Separator className="bg-border-subtle" />

        {/* Quote details */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  )
}
