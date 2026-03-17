"use client"

import { useEffect, useRef, useState } from "react"
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickSeriesOptions,
  type DeepPartial,
} from "lightweight-charts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePythOHLC } from "@/web3/hooks/usePythOHLC"
import { usePythPrices } from "@/web3/hooks/usePythPrices"
import { usePyth24hChange } from "@/web3/hooks/usePyth24hChange"
import {
  BENCHMARK_SYMBOLS,
  CHART_TIMEFRAMES,
  DEFAULT_TIMEFRAME,
  type Timeframe,
} from "@/web3/constants/chartConfig"
import { FX_PAIRS } from "@/web3/constants/pairs"
import { formatPrice, formatChange, changeDirection } from "@/lib/format"

const CANDLE_STYLE: DeepPartial<CandlestickSeriesOptions> = {
  upColor: "#2EE6A6",
  downColor: "#FF5C7A",
  borderUpColor: "#2EE6A6",
  borderDownColor: "#FF5C7A",
  wickUpColor: "rgba(46,230,166,0.55)",
  wickDownColor: "rgba(255,92,122,0.55)",
}

export function ChartPanel() {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0)
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<Timeframe>(DEFAULT_TIMEFRAME)

  const selectedPair = FX_PAIRS[selectedPairIndex]
  const benchmarkSymbol = BENCHMARK_SYMBOLS[selectedPair.symbol] ?? ""
  const feedId = selectedPair.priceFeedId

  const { bars, isLoading, isError } = usePythOHLC(
    benchmarkSymbol,
    selectedTimeframe,
  )

  const { prices } = usePythPrices([feedId])
  const { historicalPrices } = usePyth24hChange([feedId])
  const normId = feedId.toLowerCase().startsWith("0x")
    ? feedId.toLowerCase()
    : `0x${feedId.toLowerCase()}`
  const livePrice = prices.get(normId)
  const historicalPrice = historicalPrices.get(normId)
  const change24h =
    livePrice && historicalPrice
      ? ((livePrice.value - historicalPrice) / historicalPrice) * 100
      : null
  const direction = changeDirection(change24h)

  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Pair selector */}
          <div className="flex items-center gap-1">
            {FX_PAIRS.map((pair, i) => (
              <button
                key={pair.symbol}
                onClick={() => setSelectedPairIndex(i)}
                className={cn(
                  "rounded-md px-2.5 py-1 font-mono text-xs tracking-wide transition-colors",
                  i === selectedPairIndex
                    ? "bg-brand-primary/15 text-brand-primary"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {pair.symbol}
              </button>
            ))}
          </div>

          {/* Live price + 24h change */}
          {livePrice && (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-semibold tabular-nums text-text-primary">
                {formatPrice(livePrice.value, selectedPair.displayDecimals)}
              </span>
              {change24h !== null && (
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    direction === "positive" && "text-state-positive",
                    direction === "negative" && "text-state-negative",
                    direction === "neutral" && "text-text-muted",
                  )}
                >
                  {formatChange(change24h)}
                </span>
              )}
            </div>
          )}

          {/* Timeframe selector */}
          <div className="flex items-center gap-0.5">
            {CHART_TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "rounded px-2 py-1 font-mono text-[11px] tracking-wider transition-colors",
                  tf.label === selectedTimeframe.label
                    ? "bg-bg-elevated text-text-primary"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <CandlestickChart bars={bars} isLoading={isLoading} isError={isError} />
      </CardContent>
    </Card>
  )
}

interface CandlestickChartProps {
  bars: { time: number; open: number; high: number; low: number; close: number }[]
  isLoading: boolean
  isError: boolean
}

function CandlestickChart({ bars, isLoading, isError }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)

  // Create chart once on mount
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "#A892AD",
        fontFamily: "monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        horzLine: {
          color: "rgba(255,182,221,0.35)",
          labelBackgroundColor: "#2A1436",
        },
        vertLine: {
          color: "rgba(255,182,221,0.35)",
          labelBackgroundColor: "#2A1436",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
        fixRightEdge: true,
      },
    })

    chartRef.current = chart
    seriesRef.current = chart.addSeries(CandlestickSeries, CANDLE_STYLE)

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  // Update candle data whenever bars change
  useEffect(() => {
    if (!seriesRef.current || bars.length === 0) return
    seriesRef.current.setData(bars)
    chartRef.current?.timeScale().fitContent()
  }, [bars])

  return (
    <div className="relative h-72 w-full">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col justify-end gap-1 p-4">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      )}

      {/* Error overlay */}
      {isError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-xs text-state-negative">
              Chart data unavailable
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-text-muted">
              Could not load Pyth price history
            </p>
          </div>
        </div>
      )}

      {/* No data (empty bars after load) */}
      {!isLoading && !isError && bars.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs text-text-muted">
            No historical data for this timeframe
          </p>
        </div>
      )}
    </div>
  )
}
