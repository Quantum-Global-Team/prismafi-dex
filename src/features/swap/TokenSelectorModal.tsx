"use client"

import { useState, useMemo } from "react"
import { Search, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useWallet } from "@/web3/hooks/useWallet"
import { useTokenBalance } from "@/web3/hooks/useTokenBalance"
import {
  TOKENS,
  FX_TOKEN_SYMBOLS,
  QUOTE_TOKEN_SYMBOL,
  type TokenSymbol,
} from "@/web3/constants/tokens"
import type { TokenMetadata } from "@/types/token"

const ALL_TOKENS: TokenSymbol[] = [...FX_TOKEN_SYMBOLS, QUOTE_TOKEN_SYMBOL]

type AssetClass = "All" | "Fiat" | "Stable"

const TOKEN_CLASS: Record<TokenSymbol, AssetClass> = {
  tEUR: "Fiat",
  tGBP: "Fiat",
  tJPY: "Fiat",
  USDC: "Stable",
}

const CLASS_TABS: AssetClass[] = ["All", "Fiat", "Stable"]

/**
 * Per-token icon palette. Used both inside this modal and exported for use
 * in trigger buttons (e.g. AmountBox in SwapPanel).
 */
export const TOKEN_ICON_STYLE: Record<TokenSymbol, string> = {
  tEUR: "bg-blue-500/20 text-blue-200 border-blue-500/25",
  tGBP: "bg-violet-500/20 text-violet-200 border-violet-500/25",
  tJPY: "bg-amber-500/20 text-amber-200 border-amber-500/25",
  USDC: "bg-emerald-500/20 text-emerald-200 border-emerald-500/25",
}

const CLASS_BADGE: Record<Exclude<AssetClass, "All">, string> = {
  Fiat: "bg-violet-500/10 text-violet-400",
  Stable: "bg-emerald-500/10 text-emerald-400",
}

// ── Exported token icon ───────────────────────────────────────────────────────

interface TokenIconProps {
  symbol: TokenSymbol
  size?: "sm" | "md" | "lg"
}

/**
 * Circular token icon badge. Exported so other features (e.g. SwapPanel)
 * can render a consistent icon without duplicating styles.
 */
export function TokenIcon({ symbol, size = "md" }: TokenIconProps) {
  const sizeClass = {
    sm: "h-7 w-7 text-sm",
    md: "h-9 w-9 text-base",
    lg: "h-11 w-11 text-lg",
  }[size]

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border font-mono font-bold leading-none",
        sizeClass,
        TOKEN_ICON_STYLE[symbol],
      )}
    >
      {TOKENS[symbol].logoSymbol}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export interface TokenSelectorModalProps {
  open: boolean
  onClose: () => void
  onSelect: (symbol: TokenSymbol) => void
  excludeSymbol?: TokenSymbol
  selectedSymbol?: TokenSymbol
}

export function TokenSelectorModal({
  open,
  onClose,
  onSelect,
  excludeSymbol,
  selectedSymbol,
}: TokenSelectorModalProps) {
  const [search, setSearch] = useState("")
  const [activeClass, setActiveClass] = useState<AssetClass>("All")
  const wallet = useWallet()

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return ALL_TOKENS.filter((sym) => {
      if (sym === excludeSymbol) return false
      if (activeClass !== "All" && TOKEN_CLASS[sym] !== activeClass) return false
      if (q) {
        return (
          sym.toLowerCase().includes(q) ||
          TOKENS[sym].name.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, activeClass, excludeSymbol])

  function handleSelect(symbol: TokenSymbol) {
    onSelect(symbol)
    onClose()
    setSearch("")
    setActiveClass("All")
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onClose()
      setSearch("")
      setActiveClass("All")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-sm gap-0 rounded-2xl border border-border-strong bg-bg-panel p-0 shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <DialogTitle className="font-mono text-sm font-semibold text-text-primary">
            Select Asset
          </DialogTitle>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Search ── */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-bg-elevated px-3.5 py-2.5 ring-1 ring-border-subtle transition-all focus-within:ring-brand-primary/50">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <input
              type="text"
              placeholder="Search asset name or ticker…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent font-mono text-xs text-text-primary outline-none placeholder:text-text-muted"
              autoFocus
            />
          </div>
        </div>

        {/* ── Asset class tabs ── */}
        <div className="flex gap-1 px-4 pb-3">
          {CLASS_TABS.map((cls) => (
            <button
              key={cls}
              onClick={() => setActiveClass(cls)}
              className={cn(
                "rounded-lg px-3 py-1.5 font-mono text-[11px] tracking-wider uppercase transition-all",
                activeClass === cls
                  ? "bg-brand-primary/15 text-brand-primary ring-1 ring-brand-primary/20"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {cls}
            </button>
          ))}
        </div>

        <div className="mx-4 border-t border-border-subtle" />

        {/* ── Token list ── */}
        <div className="max-h-[17rem] overflow-y-auto px-2 py-2">
          {filtered.length === 0 ? (
            <div className="flex h-20 items-center justify-center">
              <p className="font-mono text-xs text-text-muted">No assets found</p>
            </div>
          ) : (
            filtered.map((sym) => (
              <TokenRow
                key={sym}
                symbol={sym}
                token={TOKENS[sym]}
                walletAddress={wallet.address}
                assetClass={TOKEN_CLASS[sym]}
                isSelected={sym === selectedSymbol}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-border-subtle px-5 py-3">
          <p className="font-mono text-[10px] text-text-muted">
            {ALL_TOKENS.length} assets on PrismaFi
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Token row ─────────────────────────────────────────────────────────────────

interface TokenRowProps {
  symbol: TokenSymbol
  token: TokenMetadata
  walletAddress: `0x${string}` | undefined
  assetClass: Exclude<AssetClass, "All">
  isSelected: boolean
  onSelect: (symbol: TokenSymbol) => void
}

function TokenRow({
  symbol,
  token,
  walletAddress,
  assetClass,
  isSelected,
  onSelect,
}: TokenRowProps) {
  const { formatted, isLoading } = useTokenBalance(token, walletAddress)

  return (
    <button
      onClick={() => onSelect(symbol)}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left transition-colors",
        isSelected
          ? "bg-brand-primary/10 ring-1 ring-brand-primary/15"
          : "hover:bg-bg-elevated",
      )}
    >
      <TokenIcon symbol={symbol} size="md" />

      {/* Ticker + full name */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-text-primary">
            {symbol}
          </span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
              CLASS_BADGE[assetClass],
            )}
          >
            {assetClass}
          </span>
        </div>
        <span className="truncate font-mono text-[11px] text-text-muted">
          {token.name}
        </span>
      </div>

      {/* Balance */}
      <div className="flex flex-col items-end gap-0.5">
        <span
          className={cn(
            "font-mono text-sm tabular-nums",
            isLoading ? "text-text-muted" : "text-text-secondary",
          )}
        >
          {isLoading ? "—" : formatted}
        </span>
        <span className="font-mono text-[10px] text-text-muted">{symbol}</span>
      </div>

      {isSelected && (
        <Check className="ml-0.5 h-4 w-4 shrink-0 text-brand-primary" />
      )}
    </button>
  )
}
