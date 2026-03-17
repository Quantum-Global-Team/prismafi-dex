"use client"

import { useCallback, useEffect, useState } from "react"
import type { UTCTimestamp } from "lightweight-charts"
import { PYTH_BENCHMARKS_URL } from "@/web3/constants/chartConfig"
import type { Timeframe } from "@/web3/constants/chartConfig"

/** A single OHLC bar formatted for lightweight-charts v5. */
export interface OhlcBar {
  /** UTC timestamp in seconds, branded as UTCTimestamp for lightweight-charts */
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
}

/** Raw successful response from Pyth Benchmarks TradingView UDF shim. */
interface BenchmarksOkResponse {
  s: "ok"
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
}

type BenchmarksResponse =
  | BenchmarksOkResponse
  | { s: "no_data" }
  | { s: "error"; errmsg: string }

interface UsePythOHLCResult {
  bars: OhlcBar[]
  isLoading: boolean
  isError: boolean
}

/**
 * Fetches OHLC candlestick data from Pyth Benchmarks for a given FX pair.
 *
 * The Pyth Benchmarks API serves TradingView UDF-compatible price history.
 * Each timeframe change triggers a new fetch.
 *
 * @param benchmarkSymbol - e.g. "FX.EUR/USD" (from BENCHMARK_SYMBOLS)
 * @param timeframe       - resolution + window from CHART_TIMEFRAMES
 *
 * @see https://benchmarks.pyth.network/v1/shims/tradingview/history
 */
export function usePythOHLC(
  benchmarkSymbol: string,
  timeframe: Timeframe,
): UsePythOHLCResult {
  const [bars, setBars] = useState<OhlcBar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const fetchBars = useCallback(async () => {
    if (!benchmarkSymbol) return

    setIsLoading(true)
    setIsError(false)

    try {
      const now = Math.floor(Date.now() / 1000)
      const from = now - timeframe.windowSeconds

      const params = new URLSearchParams({
        symbol: benchmarkSymbol,
        resolution: timeframe.resolution,
        from: String(from),
        to: String(now),
      })

      // Use Next.js API route as CORS-safe proxy
      const res = await fetch(
        `/api/pyth/ohlc?${params.toString()}`,
        { cache: "no-store" },
      )

      if (!res.ok) {
        throw new Error(`Pyth OHLC proxy error: ${res.status}`)
      }

      const data: BenchmarksResponse = await res.json()

      if (data.s === "no_data" || data.s === "error") {
        setBars([])
        setIsError(data.s === "error")
        return
      }

      const parsed: OhlcBar[] = data.t.map((time, i) => ({
        time: time as UTCTimestamp,
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
      }))

      // lightweight-charts requires bars sorted ascending by time
      parsed.sort((a, b) => a.time - b.time)

      setBars(parsed)
    } catch {
      setIsError(true)
      setBars([])
    } finally {
      setIsLoading(false)
    }
  }, [benchmarkSymbol, timeframe])

  useEffect(() => {
    void fetchBars()
  }, [fetchBars])

  return { bars, isLoading, isError }
}
