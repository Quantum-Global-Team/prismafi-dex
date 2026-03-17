import { PYTH_PRICE_FEED_IDS } from "./priceFeedIds"
import type { TokenMetadata } from "@/types/token"

/**
 * Token metadata for all assets supported by PrismaFi DEX.
 *
 * Addresses are placeholders (zero address) until contracts are deployed to testnet.
 * Replace with deployed addresses from src/web3/constants/contracts.ts.
 */
export const TOKENS = {
  tUSD: {
    symbol: "tUSD",
    name: "Prisma US Dollar",
    decimals: 6,
    address: null,
    chainId: 1287,
    logoSymbol: "$",
    priceFeedId: null, // tUSD is pegged 1:1 to USD, no feed needed
  },
  tEUR: {
    symbol: "tEUR",
    name: "Prisma Euro",
    decimals: 6,
    address: null,
    chainId: 1287,
    logoSymbol: "€",
    priceFeedId: PYTH_PRICE_FEED_IDS.EUR_USD,
  },
  tGBP: {
    symbol: "tGBP",
    name: "Prisma British Pound",
    decimals: 6,
    address: null,
    chainId: 1287,
    logoSymbol: "£",
    priceFeedId: PYTH_PRICE_FEED_IDS.GBP_USD,
  },
  tJPY: {
    symbol: "tJPY",
    name: "Prisma Japanese Yen",
    decimals: 6,
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

/** The base quote currency for all PrismaFi pairs. */
export const QUOTE_TOKEN_SYMBOL: TokenSymbol = "tUSD"
