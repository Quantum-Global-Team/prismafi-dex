"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PYTH_HERMES_URL } from "@/web3/constants/priceFeedIds"
import type { FxPrice, PythHermesResponse } from "@/types/market"

/** Polling interval for live price updates (ms). */
const POLL_INTERVAL_MS = 10_000

/** Normalise a Pyth feed ID to lowercase with 0x prefix. */
function normaliseFeedId(id: string): string {
  const stripped = id.startsWith("0x") ? id.slice(2) : id
  return `0x${stripped.toLowerCase()}`
}

/**
 * Compute a float price value from Pyth's raw price data.
 * Pyth stores prices as integer mantissa + negative base-10 exponent.
 * e.g. price="109950000", expo=-8 → 1.0995
 */
function computePrice(mantissa: string, expo: number): number {
  return Number(mantissa) * Math.pow(10, expo)
}

interface UsePythPricesResult {
  /** Map of normalised feedId → live price data */
  prices: Map<string, FxPrice>
  isLoading: boolean
  isError: boolean
  lastFetchedAt: Date | null
  /** Manually trigger an immediate re-fetch */
  refetch: () => void
}

/**
 * Fetches live FX prices from the Pyth Network Hermes off-chain price service.
 * Polls on a fixed interval to keep prices up to date without a wallet.
 *
 * @param feedIds - Array of 0x-prefixed Pyth price feed IDs to subscribe to.
 *
 * @example
 * const { prices, isLoading } = usePythPrices([
 *   PYTH_PRICE_FEED_IDS.EUR_USD,
 *   PYTH_PRICE_FEED_IDS.GBP_USD,
 * ])
 */
export function usePythPrices(feedIds: string[]): UsePythPricesResult {
  const [prices, setPrices] = useState<Map<string, FxPrice>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null)

  // Stable ref so the interval callback always has the latest feedIds
  const feedIdsRef = useRef(feedIds)
  useEffect(() => {
    feedIdsRef.current = feedIds
  }, [feedIds])

  const fetchPrices = useCallback(async () => {
    const ids = feedIdsRef.current
    if (ids.length === 0) return

    try {
      const params = new URLSearchParams()
      for (const id of ids) {
        params.append("ids[]", id)
      }

      // Use Next.js API route as CORS-safe proxy
      const res = await fetch(
        `/api/pyth/prices?${params.toString()}`,
        { cache: "no-store" },
      )

      if (!res.ok) {
        throw new Error(`Pyth proxy error: ${res.status} ${res.statusText}`)
      }

      const data: PythHermesResponse = await res.json()

      const updated = new Map<string, FxPrice>()
      for (const feed of data.parsed) {
        const normId = normaliseFeedId(feed.id)
        updated.set(normId, {
          feedId: normId,
          value: computePrice(feed.price.price, feed.price.expo),
          confidence: computePrice(feed.price.conf, feed.price.expo),
          publishTime: feed.price.publish_time,
        })
      }

      setPrices(updated)
      setIsError(false)
      setLastFetchedAt(new Date())
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    void fetchPrices()

    const interval = setInterval(() => {
      void fetchPrices()
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [fetchPrices])

  return { prices, isLoading, isError, lastFetchedAt, refetch: fetchPrices }
}
