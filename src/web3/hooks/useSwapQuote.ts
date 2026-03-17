"use client"

import { useMemo } from "react"
import { usePythPrices } from "@/web3/hooks/usePythPrices"
import { TOKENS, type TokenSymbol } from "@/web3/constants/tokens"

/** Price for USD-pegged stablecoins (tUSD, USDC) that don't need oracle feeds */
const USD_PEGGED_PRICE = 1.0

/** Get the Pyth feed ID for a token, or empty string for USD-pegged tokens */
function getFeedId(symbol: TokenSymbol): string {
  return TOKENS[symbol].priceFeedId ?? ""
}

/** Normalize a Pyth feed ID to lowercase with 0x prefix. */
function normaliseFeed(id: string): string {
  if (!id) return ""
  const stripped = id.startsWith("0x") ? id.slice(2) : id
  return `0x${stripped.toLowerCase()}`
}

/**
 * Normalize Pyth price for JPY (Pyth provides USD/JPY, we need JPY/USD).
 * For EUR and GBP, the price is already in the correct format (EUR/USD, GBP/USD).
 */
function normalizePriceForSymbol(price: number, symbol: TokenSymbol): number {
  // JPY uses USD/JPY feed which is inverted
  if (symbol === "tJPY") {
    return 1 / price
  }
  return price
}

export interface SwapQuote {
  /** Human-readable output token amount */
  outputAmount: string
  /** Raw float output amount */
  outputAmountRaw: number
  /** How many output tokens per 1 input token */
  rate: number
  /** Formatted rate string, e.g. "1 tEUR = 1.09542 USDC" */
  rateFormatted: string
  /** Protocol fee as a percent of output, e.g. 0.05 */
  feePercent: number
  /** Output amount after fee deducted */
  outputAmountAfterFee: string
}

interface UseSwapQuoteResult {
  quote: SwapQuote | null
  isLoading: boolean
  isError: boolean
}

/** Protocol fee charged on each swap (0.05%). */
const PROTOCOL_FEE_PERCENT = 0.05

/**
 * Derives a real-time swap quote by combining live Pyth oracle prices.
 *
 * Quote formula (no mock data):
 *   rate       = priceOfInputInUSD / priceOfOutputInUSD
 *   outputRaw  = inputAmount × rate
 *   outputFee  = outputRaw × (1 − feePercent / 100)
 *
 * USDC is treated as pegged at 1.000 USD; no oracle call needed.
 *
 * @param inputSymbol  - token being sold, e.g. "tEUR"
 * @param outputSymbol - token being bought, e.g. "USDC"
 * @param inputAmount  - raw string from the amount input field
 */
export function useSwapQuote(
  inputSymbol: TokenSymbol,
  outputSymbol: TokenSymbol,
  inputAmount: string,
): UseSwapQuoteResult {
  const inputFeedId = getFeedId(inputSymbol)
  const outputFeedId = getFeedId(outputSymbol)

  const feedIds = [inputFeedId, outputFeedId].filter(Boolean)

  const { prices, isLoading, isError } = usePythPrices(feedIds)

  const quote = useMemo<SwapQuote | null>(() => {
    const parsedInput = parseFloat(inputAmount)
    if (!inputAmount || isNaN(parsedInput) || parsedInput <= 0) return null
    if (inputSymbol === outputSymbol) return null

    const inputNorm = normaliseFeed(inputFeedId)
    const outputNorm = normaliseFeed(outputFeedId)

    let inputPriceUSD = inputFeedId
      ? (prices.get(inputNorm)?.value ?? null)
      : USD_PEGGED_PRICE

    let outputPriceUSD = outputFeedId
      ? (prices.get(outputNorm)?.value ?? null)
      : USD_PEGGED_PRICE

    if (inputPriceUSD === null || outputPriceUSD === null) return null

    // Normalize prices for JPY (invert USD/JPY → JPY/USD)
    inputPriceUSD = normalizePriceForSymbol(inputPriceUSD, inputSymbol)
    outputPriceUSD = normalizePriceForSymbol(outputPriceUSD, outputSymbol)

    const rate = inputPriceUSD / outputPriceUSD
    const outputRaw = parsedInput * rate
    const outputAfterFee = outputRaw * (1 - PROTOCOL_FEE_PERCENT / 100)

    const outputDecimals = TOKENS[outputSymbol].decimals === 6 ? 4 : 6

    return {
      outputAmount: outputRaw.toFixed(outputDecimals),
      outputAmountRaw: outputRaw,
      rate,
      rateFormatted: `1 ${inputSymbol} = ${rate.toFixed(
        TOKENS[outputSymbol].decimals === 6 ? 5 : 7,
      )} ${outputSymbol}`,
      feePercent: PROTOCOL_FEE_PERCENT,
      outputAmountAfterFee: outputAfterFee.toFixed(outputDecimals),
    }
  }, [
    inputAmount,
    inputSymbol,
    outputSymbol,
    inputFeedId,
    outputFeedId,
    prices,
  ])

  return { quote, isLoading, isError }
}
