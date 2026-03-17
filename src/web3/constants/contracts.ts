import type { Address } from "viem"
import { PYTH_CONTRACT_ADDRESS_MOONBASE } from "./priceFeedIds"

/**
 * Deployed smart contract addresses for PrismaFi DEX on Moonbase Alpha.
 *
 * All values are null until contracts are deployed via Foundry scripts.
 * After deployment, paste the verified addresses here.
 *
 * See: contracts/script/ for deployment scripts.
 * See: contracts/DEPLOYMENT.md for deployment guide.
 */
export const CONTRACTS = {
  /** Main DEX router — executes FX token swaps */
  PrismaRouter: null as Address | null,
  /** Tokenized USD (base quote token) */
  tUSD: null as Address | null,
  /** Synthetic EUR token */
  tEUR: null as Address | null,
  /** Synthetic GBP token */
  tGBP: null as Address | null,
  /** Synthetic JPY token */
  tJPY: null as Address | null,
  /** Mock stablecoin (USDC equivalent for testnet) */
  USDC: null as Address | null,
}

/**
 * Pyth oracle contract on Moonbase Alpha.
 * Used by PrismaRouter to fetch on-chain FX prices.
 */
export const PYTH_CONTRACT = PYTH_CONTRACT_ADDRESS_MOONBASE as Address

export type ContractName = keyof typeof CONTRACTS

/**
 * Helper to get a contract address, throwing if not deployed.
 */
export function getContractAddress(name: ContractName): Address {
  const address = CONTRACTS[name]
  if (!address) {
    throw new Error(`Contract ${name} not deployed. Check src/web3/constants/contracts.ts`)
  }
  return address
}
