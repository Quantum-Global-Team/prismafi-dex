"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PYTH_HERMES_URL } from "@/web3/constants/priceFeedIds"
import type { PythHermesResponse } from "@/types/market"

/** Normalise a Pyth feed ID to lowercase with 0x prefix. */
function normaliseFeedId(id: string): string {
  const stripped = id.startsWith("0x") ? id.slice(2) : id
  return `0x${stripped.toLowerCase()}`
}

function computePrice(mantissa: string, expo: number): number {
  return Number(mantissa) * Math.pow(10, expo)
}

interface UsePyth24hChangeResult {
  /** Map of normalised feedId → price value from 24 hours ago */
  historicalPrices: Map<string, number>
  isLoading: boolean
  isError: boolean
}

/**
 * Fetches each feed's price from exactly 24 hours ago using the
 * Pyth Hermes historical price endpoint.
 *
 * Fetched once on mount. The 24h-ago timestamp is stable per page load.
 */
export function usePyth24hChange(feedIds: string[]): UsePyth24hChangeResult {
  const [historicalPrices, setHistoricalPrices] = useState<
    Map<string, number>
  >(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Snapshot the timestamp once so it doesn't drift across re-renders
  const timestampRef = useRef(Math.floor(Date.now() / 1000) - 86_400)

  const fetchHistorical = useCallback(async () => {
    const ids = feedIds
    if (ids.length === 0) {
      setIsLoading(false)
      return
    }

    try {
      const params = new URLSearchParams()
      for (const id of ids) {
        params.append("ids[]", id)
      }
      params.set("timestamp", timestampRef.current.toString())

      // Use Next.js API route as CORS-safe proxy
      const res = await fetch(
        `/api/pyth/historical?${params.toString()}`,
        { cache: "force-cache" },
      )

      if (!res.ok) {
        throw new Error(`Pyth historical proxy error: ${res.status}`)
      }

      const data: PythHermesResponse = await res.json()

      const map = new Map<string, number>()
      for (const feed of data.parsed) {
        const normId = normaliseFeedId(feed.id)
        map.set(normId, computePrice(feed.price.price, feed.price.expo))
      }

      setHistoricalPrices(map)
      setIsError(false)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [feedIds])

  useEffect(() => {
    void fetchHistorical()
  }, [fetchHistorical])

  return { historicalPrices, isLoading, isError }
}
