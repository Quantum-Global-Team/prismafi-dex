import type { Address } from "viem"

/**
 * Deployed smart contract addresses for Tessera DEX on Moonbase Alpha.
 *
 * All values are null until contracts are deployed via Foundry scripts.
 * After deployment, paste the verified addresses here.
 *
 * See: contracts/script/ for deployment scripts.
 * See: contracts/DEPLOYMENT.md for deployment guide.
 */
export const CONTRACTS = {
  /** Main DEX router — executes FX token swaps */
  TesseraRouter: null as Address | null,
  /** Mock stablecoin (USDC equivalent for testnet) */
  MockUSDC: null as Address | null,
  /** Synthetic EUR token */
  tEUR: null as Address | null,
  /** Synthetic GBP token */
  tGBP: null as Address | null,
  /** Synthetic JPY token */
  tJPY: null as Address | null,
  /**
   * Pyth oracle adapter used by the router.
   * The upstream Pyth contract on Moonbase Alpha:
   * 0xa2aa501b19aff244d90cc15a4cf739d2725b5729
   */
  PythOracleAdapter: null as Address | null,
}

export type ContractName = keyof typeof CONTRACTS
