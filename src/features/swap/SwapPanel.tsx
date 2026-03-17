"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, Settings2, ChevronDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useSwapQuote } from "@/web3/hooks/useSwapQuote"
import { useSwapTransaction, type SwapStatus } from "@/web3/hooks/useSwapTransaction"
import { useWallet } from "@/web3/hooks/useWallet"
import { useWalletActions } from "@/web3/hooks/useWalletActions"
import { CONTRACTS } from "@/web3/constants/contracts"
import {
  FX_TOKEN_SYMBOLS,
  QUOTE_TOKEN_SYMBOL,
  type TokenSymbol,
} from "@/web3/constants/tokens"
import { TokenSelectorModal, TokenIcon } from "./TokenSelectorModal"
import { useTradingContext } from "@/contexts/TradingContext"

const ALL_SWAP_TOKENS: TokenSymbol[] = [...FX_TOKEN_SYMBOLS, QUOTE_TOKEN_SYMBOL]
const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0]
type ModalSide = "input" | "output" | null

/** Map base currency from FX pair to token symbol */
const BASE_TO_TOKEN: Record<string, TokenSymbol> = {
  EUR: "tEUR",
  GBP: "tGBP",
  JPY: "tJPY",
}

/** Get user-friendly status message */
function getStatusMessage(status: SwapStatus): string {
  switch (status) {
    case "fetching-prices":
      return "Fetching prices..."
    case "checking-allowance":
      return "Checking allowance..."
    case "approving":
      return "Approve in wallet..."
    case "awaiting-approval":
      return "Awaiting approval..."
    case "swapping":
      return "Confirm swap..."
    case "awaiting-swap":
      return "Processing swap..."
    case "success":
      return "Swap complete!"
    case "error":
      return "Swap failed"
    default:
      return ""
  }
}

export function SwapPanel() {
  const { selectedPair } = useTradingContext()
  const [inputSymbol, setInputSymbol] = useState<TokenSymbol>("tEUR")
  const [outputSymbol, setOutputSymbol] = useState<TokenSymbol>("tUSD")
  const [inputAmount, setInputAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [modalSide, setModalSide] = useState<ModalSide>(null)

  const { quote } = useSwapQuote(inputSymbol, outputSymbol, inputAmount)
  const wallet = useWallet()
  const { openConnectModal } = useWalletActions()

  // Swap transaction hook
  const {
    status: swapStatus,
    error: swapError,
    swapTxHash,
    executeSwap: performSwap,
    reset: resetSwap,
  } = useSwapTransaction(
    inputSymbol,
    outputSymbol,
    inputAmount,
    quote?.outputAmountAfterFee ?? "0",
    slippage
  )

  const isSwapping = !["idle", "success", "error"].includes(swapStatus)
  const contractsDeployed = !!CONTRACTS.PrismaRouter

  // Sync input token with globally selected pair
  useEffect(() => {
    const tokenSymbol = BASE_TO_TOKEN[selectedPair.base]
    if (tokenSymbol) {
      setInputSymbol(tokenSymbol)
      setOutputSymbol((prev) => (tokenSymbol === prev ? "tUSD" : prev))
    }
  }, [selectedPair.base])

  // Reset swap state when inputs change
  useEffect(() => {
    if (swapStatus === "success" || swapStatus === "error") {
      resetSwap()
    }
  }, [inputSymbol, outputSymbol, inputAmount, resetSwap, swapStatus])

  function handleFlip() {
    setInputSymbol(outputSymbol)
    setOutputSymbol(inputSymbol)
    if (quote) setInputAmount(quote.outputAmount)
  }

  function handleInputChange(value: string) {
    if (/^\d*\.?\d*$/.test(value)) setInputAmount(value)
  }

  function handleSelectFromModal(symbol: TokenSymbol) {
    if (modalSide === "input") {
      setInputSymbol(symbol)
      if (symbol === outputSymbol) {
        setOutputSymbol(
          ALL_SWAP_TOKENS.find((s) => s !== symbol) ?? QUOTE_TOKEN_SYMBOL,
        )
      }
    } else if (modalSide === "output") {
      setOutputSymbol(symbol)
      if (symbol === inputSymbol) {
        setInputSymbol(
          ALL_SWAP_TOKENS.find((s) => s !== symbol) ?? FX_TOKEN_SYMBOLS[0],
        )
      }
    }
  }

  async function handleSwapClick() {
    if (!wallet.isConnected) {
      openConnectModal?.()
      return
    }
    if (canSwap && !isSwapping) {
      await performSwap()
    }
  }

  const ctaLabel = (() => {
    if (!wallet.isConnected) return "Connect Wallet"
    if (!wallet.isCorrectNetwork) return "Wrong Network"
    if (!contractsDeployed) return "Contracts Not Deployed"
    if (!inputAmount || parseFloat(inputAmount) <= 0) return "Enter Amount"
    if (!quote) return "Fetching Quote..."
    if (isSwapping) return getStatusMessage(swapStatus)
    if (swapStatus === "success") return "Swap Complete!"
    if (swapStatus === "error") return "Try Again"
    return "Swap"
  })()

  const canSwap =
    wallet.isConnected &&
    wallet.isCorrectNetwork &&
    contractsDeployed &&
    !!quote &&
    parseFloat(inputAmount) > 0 &&
    !isSwapping

  return (
    <>
      <Card className="border-border-subtle bg-bg-panel border-top-accent">
        <CardHeader className="px-4 pb-2 pt-4">
          <span className="font-mono text-xs font-medium tracking-widest text-text-secondary uppercase">
            Swap
          </span>
        </CardHeader>

        <CardContent className="space-y-2 px-4 pb-4">
          {/* Sell (input) */}
          <AmountBox
            label="You pay"
            amount={inputAmount}
            symbol={inputSymbol}
            onAmountChange={handleInputChange}
            onTriggerSelect={() => setModalSide("input")}
            readonly={false}
          />

          {/* Flip button */}
          <div className="flex justify-center py-0.5">
            <button
              onClick={handleFlip}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-muted transition-all duration-300 hover:border-brand-primary/40 hover:text-brand-primary hover:rotate-180"
              aria-label="Flip tokens"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Buy (output) */}
          <AmountBox
            label="You receive"
            amount={quote?.outputAmountAfterFee ?? ""}
            symbol={outputSymbol}
            onAmountChange={() => undefined}
            onTriggerSelect={() => setModalSide("output")}
            readonly
            placeholder={quote ? undefined : "—"}
          />

          {/* Quote details */}
          {quote && (
            <>
              <Separator className="bg-border-subtle" />
              <div className="space-y-1.5 px-1">
                <QuoteRow label="Rate" value={quote.rateFormatted} />
                <QuoteRow label="Fee" value={`${quote.feePercent}%`} />
                <QuoteRow
                  label="Min. received"
                  value={`${(
                    parseFloat(quote.outputAmountAfterFee) *
                    (1 - slippage / 100)
                  ).toFixed(5)} ${outputSymbol}`}
                  muted
                />
              </div>
            </>
          )}

          {/* Slippage */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-1 text-text-muted">
              <Settings2 className="h-3 w-3" />
              <span className="font-mono text-[10px]">Slippage</span>
            </div>
            <div className="flex gap-1">
              {SLIPPAGE_OPTIONS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => setSlippage(pct)}
                  disabled={isSwapping}
                  className={cn(
                    "rounded px-2 py-0.5 font-mono text-[10px] transition-colors",
                    slippage === pct
                      ? "bg-brand-primary/15 text-brand-primary"
                      : "text-text-muted hover:text-text-secondary",
                    isSwapping && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Swap Status */}
          {swapStatus !== "idle" && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2",
                swapStatus === "success" && "bg-state-positive/10",
                swapStatus === "error" && "bg-state-negative/10",
                isSwapping && "bg-brand-primary/10",
              )}
            >
              {isSwapping && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
              )}
              {swapStatus === "success" && (
                <CheckCircle2 className="h-3.5 w-3.5 text-state-positive" />
              )}
              {swapStatus === "error" && (
                <AlertCircle className="h-3.5 w-3.5 text-state-negative" />
              )}
              <span
                className={cn(
                  "font-mono text-[10px]",
                  swapStatus === "success" && "text-state-positive",
                  swapStatus === "error" && "text-state-negative",
                  isSwapping && "text-brand-primary",
                )}
              >
                {getStatusMessage(swapStatus)}
                {swapError && `: ${swapError}`}
              </span>
            </div>
          )}

          {/* Swap Transaction Link */}
          {swapTxHash && (
            <a
              href={`https://moonbase.moonscan.io/tx/${swapTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center font-mono text-[10px] text-brand-secondary hover:text-brand-primary underline"
            >
              View on Explorer
            </a>
          )}

          {/* CTA */}
          <Button
            className={cn(
              "w-full font-mono text-xs tracking-wider uppercase",
              canSwap || swapStatus === "error"
                ? "bg-brand-primary text-bg-primary hover:bg-brand-secondary glow-brand-sm"
                : "border border-border-subtle bg-transparent text-text-muted cursor-default",
              isSwapping && "opacity-75 cursor-wait",
            )}
            onClick={handleSwapClick}
            disabled={wallet.isConnected && !canSwap && swapStatus !== "error"}
          >
            {isSwapping && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {ctaLabel}
          </Button>
        </CardContent>
      </Card>

      <TokenSelectorModal
        open={modalSide !== null}
        onClose={() => setModalSide(null)}
        onSelect={handleSelectFromModal}
        excludeSymbol={modalSide === "input" ? outputSymbol : inputSymbol}
        selectedSymbol={modalSide === "input" ? inputSymbol : outputSymbol}
      />
    </>
  )
}

interface AmountBoxProps {
  label: string
  amount: string
  symbol: TokenSymbol
  onAmountChange: (v: string) => void
  onTriggerSelect: () => void
  readonly: boolean
  placeholder?: string
}

function AmountBox({
  label,
  amount,
  symbol,
  onAmountChange,
  onTriggerSelect,
  readonly,
  placeholder,
}: AmountBoxProps) {
  return (
    <div className="rounded-xl bg-bg-elevated px-4 py-3.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          readOnly={readonly}
          placeholder={placeholder ?? "0.00"}
          className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-medium tabular-nums text-text-primary outline-none placeholder:text-text-muted/40"
        />
        <button
          onClick={onTriggerSelect}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border-subtle bg-bg-panel px-2.5 py-2 transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/5"
        >
          <TokenIcon symbol={symbol} size="sm" />
          <span className="font-mono text-sm font-semibold text-text-primary">
            {symbol}
          </span>
          <ChevronDown className="h-3 w-3 text-text-muted" />
        </button>
      </div>
    </div>
  )
}

interface QuoteRowProps {
  label: string
  value: string
  muted?: boolean
}

function QuoteRow({ label, value, muted }: QuoteRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] text-text-muted">{label}</span>
      <span
        className={cn(
          "font-mono text-[11px] tabular-nums",
          muted ? "text-text-muted" : "text-text-secondary",
        )}
      >
        {value}
      </span>
    </div>
  )
}
