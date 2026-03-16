import type { PYTH_PRICE_FEED_IDS } from "@/web3/constants/priceFeedIds"

export type PythPriceFeedId =
  (typeof PYTH_PRICE_FEED_IDS)[keyof typeof PYTH_PRICE_FEED_IDS]

/** Raw price data as returned by the Pyth Hermes API. */
export interface PythPriceRaw {
  /** Integer mantissa as a decimal string, e.g. "109950000" */
  price: string
  /** One-sigma confidence interval as a decimal string */
  conf: string
  /** Negative base-10 exponent; actual price = parseInt(price) * 10^expo */
  expo: number
  /** Unix timestamp of the price update */
  publish_time: number
}

/** Single parsed feed entry from the Hermes `/v2/updates/price/latest` response. */
export interface PythParsedFeed {
  /** Lowercase hex price feed ID without 0x prefix */
  id: string
  price: PythPriceRaw
  ema_price: PythPriceRaw
  metadata: {
    slot: number
    proof_available_time: number
    prev_publish_time: number
  }
}

export interface PythHermesResponse {
  binary: { encoding: string; data: string[] }
  parsed: PythParsedFeed[]
}

/** Derived, human-readable price for a single FX pair. */
export interface FxPrice {
  /** Full 0x-prefixed feed ID */
  feedId: string
  /** Computed float: parseInt(raw.price) * 10^raw.expo */
  value: number
  /** Computed float: parseInt(raw.conf) * 10^raw.expo */
  confidence: number
  /** Unix timestamp of the last oracle update */
  publishTime: number
}

/** A tradeable Forex pair offered by Tessera (e.g. tEUR/USDC). */
export interface FxPair {
  /** Trading symbol shown in the UI, e.g. "tEUR/USDC" */
  symbol: string
  /** ISO 4217 base currency, e.g. "EUR" */
  base: string
  /** ISO 4217 quote currency, e.g. "USD" */
  quote: string
  /** Pyth price feed ID for this pair */
  priceFeedId: string
  /** Number of decimal places to display */
  displayDecimals: number
}

/** A row in the markets table — combines pair metadata with live price data. */
export interface MarketRow {
  pair: FxPair
  price: number | null
  priceFormatted: string
  confidence: number | null
  /** Percentage change over 24 h. Null until historical data is available. */
  change24h: number | null
  publishTime: number | null
  isLoading: boolean
  isError: boolean
}
