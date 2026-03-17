"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePythPrices } from "@/web3/hooks/usePythPrices"
import { usePyth24hChange } from "@/web3/hooks/usePyth24hChange"
import { FX_PAIRS, MARKETS_FEED_IDS } from "@/web3/constants/pairs"
import { TOKENS } from "@/web3/constants/tokens"
import {
  formatPrice,
  formatChange,
  formatPublishTime,
  changeDirection,
} from "@/lib/format"
import type { FxPair } from "@/types/market"

/** Map base currency → token logo symbol, e.g. "EUR" → "€" */
const LOGO_MAP: Record<string, string> = {
  EUR: TOKENS.tEUR.logoSymbol,
  GBP: TOKENS.tGBP.logoSymbol,
  JPY: TOKENS.tJPY.logoSymbol,
}

export function MarketsPanel() {
  const {
    prices,
    isLoading: livePricesLoading,
    isError: livePricesError,
    lastFetchedAt,
  } = usePythPrices(MARKETS_FEED_IDS)

  const {
    historicalPrices,
    isLoading: historicalLoading,
  } = usePyth24hChange(MARKETS_FEED_IDS)

  const isLoading = livePricesLoading

  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-medium tracking-widest text-text-secondary uppercase">
            Markets
          </span>
          <LiveIndicator
            isError={livePricesError}
            lastFetchedAt={lastFetchedAt}
          />
        </div>

        {/* Column headers */}
        <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-x-3 px-1">
          <span className="font-mono text-[10px] tracking-wider text-text-muted uppercase">
            Pair
          </span>
          <span className="font-mono text-[10px] tracking-wider text-text-muted uppercase text-right">
            Price
          </span>
          <span className="w-16 font-mono text-[10px] tracking-wider text-text-muted uppercase text-right">
            24h
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {livePricesError ? (
          <OracleError />
        ) : isLoading ? (
          <LoadingRows count={FX_PAIRS.length} />
        ) : (
          <div className="space-y-0.5">
            {FX_PAIRS.map((pair) => {
              const normId = pair.priceFeedId.toLowerCase().startsWith("0x")
                ? pair.priceFeedId.toLowerCase()
                : `0x${pair.priceFeedId.toLowerCase()}`

              const livePrice = prices.get(normId)
              const historicalPrice = historicalPrices.get(normId)

              const change24h =
                livePrice && historicalPrice && !historicalLoading
                  ? ((livePrice.value - historicalPrice) / historicalPrice) *
                  100
                  : null

              return (
                <MarketRow
                  key={pair.symbol}
                  pair={pair}
                  price={livePrice?.value ?? null}
                  publishTime={livePrice?.publishTime ?? null}
                  change24h={change24h}
                />
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MarketRowProps {
  pair: FxPair
  price: number | null
  publishTime: number | null
  change24h: number | null
}

function MarketRow({ pair, price, publishTime, change24h }: MarketRowProps) {
  const direction = changeDirection(change24h)

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-lg px-2 py-2.5",
        "cursor-pointer transition-colors hover:bg-bg-elevated",
      )}
    >
      {/* Pair identity */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-xs font-semibold text-text-secondary border border-border-subtle"
          aria-hidden
        >
          {LOGO_MAP[pair.base] ?? pair.base[0]}
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-semibold text-text-primary leading-tight">
            {pair.symbol}
          </p>
          {publishTime !== null && (
            <p className="font-mono text-[10px] text-text-muted leading-tight">
              {formatPublishTime(publishTime)}
            </p>
          )}
        </div>
      </div>

      {/* Price */}
      <span className="font-mono text-xs tabular-nums text-text-primary text-right">
        {price !== null ? formatPrice(price, pair.displayDecimals) : "—"}
      </span>

      {/* 24h change */}
      <span
        className={cn(
          "w-16 font-mono text-xs tabular-nums text-right",
          direction === "positive" && "text-state-positive",
          direction === "negative" && "text-state-negative",
          direction === "neutral" && "text-text-muted",
        )}
      >
        {change24h !== null ? formatChange(change24h) : "—"}
      </span>
    </div>
  )
}

function LoadingRows({ count }: { count: number }) {
  return (
    <div className="space-y-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 px-2 py-2.5"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          </div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

function OracleError() {
  return (
    <div className="rounded-lg border border-state-negative/20 bg-state-negative/5 px-3 py-3 text-center">
      <p className="font-mono text-xs text-state-negative">
        Oracle unavailable
      </p>
      <p className="mt-0.5 font-mono text-[10px] text-text-muted">
        Could not reach Pyth Network
      </p>
    </div>
  )
}

interface LiveIndicatorProps {
  isError: boolean
  lastFetchedAt: Date | null
}

function LiveIndicator({ isError, lastFetchedAt }: LiveIndicatorProps) {
  const label = useMemo(() => {
    if (isError) return "ERROR"
    if (!lastFetchedAt) return "CONNECTING"
    return "LIVE"
  }, [isError, lastFetchedAt])

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        {!isError && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-positive opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            isError ? "bg-state-negative" : "bg-state-positive",
          )}
        />
      </span>
      <span className="font-mono text-[10px] tracking-wider text-text-muted">
        {label}
      </span>
    </div>
  )
}
