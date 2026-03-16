import { PYTH_PRICE_FEED_IDS } from "./priceFeedIds"
import type { TokenMetadata } from "@/types/token"

/**
 * Token metadata for all assets supported by Tessera DEX.
 *
 * Addresses are placeholders (zero address) until contracts are deployed to testnet.
 * Replace with deployed addresses from src/web3/constants/contracts.ts.
 */
export const TOKENS = {
  tEUR: {
    symbol: "tEUR",
    name: "Tessera Euro",
    decimals: 18,
    address: null,
    chainId: 1287,
    logoSymbol: "€",
    priceFeedId: PYTH_PRICE_FEED_IDS.EUR_USD,
  },
  tGBP: {
    symbol: "tGBP",
    name: "Tessera British Pound",
    decimals: 18,
    address: null,
    chainId: 1287,
    logoSymbol: "£",
    priceFeedId: PYTH_PRICE_FEED_IDS.GBP_USD,
  },
  tJPY: {
    symbol: "tJPY",
    name: "Tessera Japanese Yen",
    decimals: 18,
    address: null,
    chainId: 1287,
    logoSymbol: "¥",
    priceFeedId: PYTH_PRICE_FEED_IDS.JPY_USD,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: null,
    chainId: 1287,
    logoSymbol: "$",
    priceFeedId: null,
  },
} satisfies Record<string, TokenMetadata>

export type TokenSymbol = keyof typeof TOKENS

/** Ordered list of FX tokens available for trading (not the stablecoin). */
export const FX_TOKEN_SYMBOLS: TokenSymbol[] = ["tEUR", "tGBP", "tJPY"]

/** The base quote currency for all Tessera pairs. */
export const QUOTE_TOKEN_SYMBOL: TokenSymbol = "USDC"
