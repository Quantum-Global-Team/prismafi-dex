"use client"

import { useEffect, useRef, useState } from "react"
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type DeepPartial,
  type CandlestickSeriesOptions,
  type HistogramSeriesOptions,
} from "lightweight-charts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePythOHLC, type OhlcBar } from "@/web3/hooks/usePythOHLC"
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

// ── Series configuration ──────────────────────────────────────────────────────

const CANDLE_STYLE: DeepPartial<CandlestickSeriesOptions> = {
  upColor: "#2EE6A6",
  downColor: "#FF5C7A",
  borderUpColor: "#2EE6A6",
  borderDownColor: "#FF5C7A",
  wickUpColor: "rgba(46,230,166,0.65)",
  wickDownColor: "rgba(255,92,122,0.65)",
}

const VOLUME_STYLE: DeepPartial<HistogramSeriesOptions> = {
  priceScaleId: "vol",
  lastValueVisible: false,
  priceLineVisible: false,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type VolBar = { time: OhlcBar["time"]; value: number; color: string }

function toVolBars(bars: OhlcBar[]): VolBar[] {
  return bars.map((bar) => ({
    time: bar.time,
    value: ((bar.high - bar.low) / bar.open) * 10_000,
    color:
      bar.close >= bar.open
        ? "rgba(46,230,166,0.25)"
        : "rgba(255,92,122,0.20)",
  }))
}

// ── Chart panel ───────────────────────────────────────────────────────────────

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
      {/* ── Toolbar row ── */}
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between gap-4">
          {/* Pair tabs */}
          <div className="flex items-center gap-0.5">
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

          {/* Timeframe selector */}
          <div className="flex items-center rounded-lg bg-bg-elevated p-0.5">
            {CHART_TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "rounded px-2.5 py-1 font-mono text-[11px] tracking-wider transition-all",
                  tf.label === selectedTimeframe.label
                    ? "bg-brand-primary/15 text-brand-primary font-semibold"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      {/* ── Chart area ── */}
      <CardContent className="p-0">
        <div className="relative h-[28rem] w-full">
          {/* Price overlay — top-left, large, non-interactive */}
          <div className="absolute left-4 top-3 z-10 pointer-events-none select-none">
            {livePrice ? (
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-4xl font-bold tabular-nums tracking-tight text-text-primary">
                  {formatPrice(livePrice.value, selectedPair.displayDecimals)}
                </span>
                {change24h !== null && (
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold tabular-nums",
                      direction === "positive" && "text-state-positive",
                      direction === "negative" && "text-state-negative",
                      direction === "neutral" && "text-text-muted",
                    )}
                  >
                    {formatChange(change24h)}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-10 w-40 animate-pulse rounded-lg bg-bg-elevated" />
            )}
          </div>

          <CandlestickChart
            bars={bars}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ── Inner chart ───────────────────────────────────────────────────────────────

interface CandlestickChartProps {
  bars: OhlcBar[]
  isLoading: boolean
  isError: boolean
}

function CandlestickChart({ bars, isLoading, isError }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null)

  // Create chart once on mount
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#A892AD",
        fontFamily: "Geist Mono, JetBrains Mono, monospace",
        fontSize: 11,
      },
      grid: {
        // Near-invisible grid — just enough to orient the eye
        vertLines: { color: "rgba(255,255,255,0.022)" },
        horzLines: { color: "rgba(255,255,255,0.022)" },
      },
      crosshair: {
        horzLine: {
          color: "rgba(255,182,221,0.45)",
          labelBackgroundColor: "#2A1436",
          width: 1,
          style: 2,
        },
        vertLine: {
          color: "rgba(255,182,221,0.45)",
          labelBackgroundColor: "#2A1436",
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.05)",
        textColor: "#A892AD",
        // Leave room at top for the price overlay text, bottom for volume
        scaleMargins: { top: 0.18, bottom: 0.26 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.05)",
        timeVisible: true,
        secondsVisible: false,
        fixRightEdge: true,
      },
    })

    chartRef.current = chart

    seriesRef.current = chart.addSeries(CandlestickSeries, CANDLE_STYLE)

    volumeRef.current = chart.addSeries(HistogramSeries, VOLUME_STYLE)
    volumeRef.current.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    })

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      volumeRef.current = null
    }
  }, [])

  // Update data when bars change
  useEffect(() => {
    if (!seriesRef.current || !volumeRef.current || bars.length === 0) return
    seriesRef.current.setData(bars)
    volumeRef.current.setData(toVolBars(bars))
    chartRef.current?.timeScale().fitContent()
  }, [bars])

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 p-6 pt-16">
          <Skeleton className="h-full w-full rounded-none opacity-20" />
        </div>
      )}

      {/* Error state — subtle, not alarming */}
      {isError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs text-text-muted">
            Price history unavailable
          </p>
        </div>
      )}

      {/* Empty bars after successful load */}
      {!isLoading && !isError && bars.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs text-text-muted">
            No data for this timeframe
          </p>
        </div>
      )}
    </div>
  )
}
