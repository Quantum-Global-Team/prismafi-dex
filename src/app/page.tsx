import { MarketsPanel } from "@/features/markets/MarketsPanel"
import { ChartPanel } from "@/features/charts/ChartPanel"
import { SwapPanel } from "@/features/swap/SwapPanel"
import { PortfolioPanel } from "@/features/portfolio/PortfolioPanel"

export default function TradingPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {/* Left column — live markets list (Pyth Network oracle) */}
      <MarketsPanel />

      {/* Right column — chart + swap + portfolio */}
      <div className="flex flex-col gap-4">
        <ChartPanel />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SwapPanel />
          <PortfolioPanel />
        </div>
      </div>
    </div>
  )
}
