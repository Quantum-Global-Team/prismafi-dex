import { PYTH_PRICE_FEED_IDS } from "./priceFeedIds"
import type { FxPair } from "@/types/market"

/**
 * All FX pairs listed on Tessera DEX.
 *
 * Prices are quoted as "USD per 1 unit of base currency" — the same
 * convention used by Pyth Network's FX feeds.
 * e.g. tEUR/USDC price = USD cost of 1 tEUR ≈ 1.095
 *      tJPY/USDC price = USD cost of 1 tJPY ≈ 0.00666 (JPY/USD feed)
 */
export const FX_PAIRS: FxPair[] = [
  {
    symbol: "tEUR/USDC",
    base: "EUR",
    quote: "USD",
    priceFeedId: PYTH_PRICE_FEED_IDS.EUR_USD,
    displayDecimals: 5,
  },
  {
    symbol: "tGBP/USDC",
    base: "GBP",
    quote: "USD",
    priceFeedId: PYTH_PRICE_FEED_IDS.GBP_USD,
    displayDecimals: 5,
  },
  {
    symbol: "tJPY/USDC",
    base: "JPY",
    quote: "USD",
    priceFeedId: PYTH_PRICE_FEED_IDS.JPY_USD,
    displayDecimals: 7,
  },
]

/** All Pyth feed IDs needed by the markets screen — derived from FX_PAIRS. */
export const MARKETS_FEED_IDS = FX_PAIRS.map((p) => p.priceFeedId)
