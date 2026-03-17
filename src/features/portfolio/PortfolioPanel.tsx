"use client"

import { useMemo } from "react"
import { Wallet } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useWallet } from "@/web3/hooks/useWallet"
import { useWalletActions } from "@/web3/hooks/useWalletActions"
import { useTokenBalance } from "@/web3/hooks/useTokenBalance"
import { usePythPrices } from "@/web3/hooks/usePythPrices"
import { TOKENS } from "@/web3/constants/tokens"
import { MARKETS_FEED_IDS } from "@/web3/constants/pairs"
import { PYTH_PRICE_FEED_IDS } from "@/web3/constants/priceFeedIds"
import { formatNotional } from "@/lib/format"

function normalise(feedId: string): string {
  const s = feedId.startsWith("0x") ? feedId.slice(2) : feedId
  return `0x${s.toLowerCase()}`
}

/** Truncate a hex address to "0x1234…5678" format. */
function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function PortfolioPanel() {
  const wallet = useWallet()
  const { openConnectModal } = useWalletActions()

  const { prices } = usePythPrices(MARKETS_FEED_IDS)

  const eurUSD = prices.get(normalise(PYTH_PRICE_FEED_IDS.EUR_USD))?.value ?? 0
  const gbpUSD = prices.get(normalise(PYTH_PRICE_FEED_IDS.GBP_USD))?.value ?? 0
  const jpyUSD = prices.get(normalise(PYTH_PRICE_FEED_IDS.JPY_USD))?.value ?? 0

  // Individual balance hooks — must be called unconditionally
  const tEURBal = useTokenBalance(TOKENS.tEUR, wallet.address)
  const tGBPBal = useTokenBalance(TOKENS.tGBP, wallet.address)
  const tJPYBal = useTokenBalance(TOKENS.tJPY, wallet.address)
  const usdcBal = useTokenBalance(TOKENS.USDC, wallet.address)

  const totalUSD = useMemo(() => {
    const tEURVal = parseFloat(tEURBal.formatted) * eurUSD
    const tGBPVal = parseFloat(tGBPBal.formatted) * gbpUSD
    const tJPYVal = parseFloat(tJPYBal.formatted) * jpyUSD
    const usdcVal = parseFloat(usdcBal.formatted) * 1.0
    return tEURVal + tGBPVal + tJPYVal + usdcVal
  }, [tEURBal, tGBPBal, tJPYBal, usdcBal, eurUSD, gbpUSD, jpyUSD])

  const rows = [
    { token: TOKENS.tEUR, bal: tEURBal, priceUSD: eurUSD },
    { token: TOKENS.tGBP, bal: tGBPBal, priceUSD: gbpUSD },
    { token: TOKENS.tJPY, bal: tJPYBal, priceUSD: jpyUSD },
    { token: TOKENS.USDC, bal: usdcBal, priceUSD: 1.0 },
  ]

  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-medium tracking-widest text-text-secondary uppercase">
            Portfolio
          </span>
          {wallet.isConnected && wallet.address && (
            <span className="font-mono text-[10px] text-text-muted">
              {truncateAddress(wallet.address)}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {!wallet.isConnected ? (
          <NotConnectedState onConnect={openConnectModal} />
        ) : (
          <div className="space-y-3">
            {/* Total value */}
            <div className="rounded-lg bg-bg-elevated px-3 py-2.5">
              <p className="font-mono text-[10px] text-text-muted">
                Total Value
              </p>
              <p className="mt-0.5 font-mono text-xl font-semibold tabular-nums text-text-primary">
                {formatNotional(totalUSD)}
              </p>
            </div>

            <Separator className="bg-border-subtle" />

            {/* Holdings */}
            <div className="space-y-0.5">
              {rows.map(({ token, bal, priceUSD }) => {
                const balFloat = parseFloat(bal.formatted)
                const usdValue = balFloat * priceUSD

                return (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between rounded-lg px-2 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated text-xs text-text-secondary">
                        {token.logoSymbol}
                      </span>
                      <div>
                        <p className="font-mono text-xs font-semibold text-text-primary leading-tight">
                          {token.symbol}
                        </p>
                        <p className="font-mono text-[10px] text-text-muted leading-tight">
                          {token.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {bal.isLoading ? (
                        <>
                          <Skeleton className="mb-1 h-3.5 w-16" />
                          <Skeleton className="ml-auto h-3 w-10" />
                        </>
                      ) : (
                        <>
                          <p className="font-mono text-xs tabular-nums text-text-primary">
                            {bal.formatted}
                          </p>
                          <p
                            className={cn(
                              "font-mono text-[10px] tabular-nums",
                              usdValue > 0
                                ? "text-text-muted"
                                : "text-border-subtle",
                            )}
                          >
                            {usdValue > 0
                              ? formatNotional(usdValue)
                              : "—"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Note — contracts not yet deployed */}
            {TOKENS.tEUR.address === null && (
              <p className="text-center font-mono text-[10px] text-text-muted">
                Contracts deploying to Moonbase Alpha
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NotConnectedState({ onConnect }: { onConnect?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated">
        <Wallet className="h-4 w-4 text-text-muted" />
      </div>
      <div>
        <p className="font-mono text-xs text-text-secondary">
          Wallet not connected
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-text-muted">
          Connect to view your balances
        </p>
      </div>
      <button
        onClick={onConnect}
        className="font-mono text-[11px] text-brand-primary underline-offset-2 hover:underline"
      >
        Connect Wallet
      </button>
    </div>
  )
}
