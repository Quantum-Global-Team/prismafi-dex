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
  PrismaRouter: "0x8169FbE33d2A267dd2994B959E80937963F567Ee" as Address,
  /** Tokenized USD (base quote token) */
  tUSD: "0xEd379C7131A375EcCFD315b3992a0c28E9CeFe11" as Address,
  /** Synthetic EUR token */
  tEUR: "0x6bcb5E49fa2f69e7E69E7A48B905A024119666BD" as Address,
  /** Synthetic GBP token */
  tGBP: "0xbdFde5ED83359311f4FB739D4340FB170aeD1F3b" as Address,
  /** Synthetic JPY token */
  tJPY: "0xbA6bC58c9adc7EB1029C3E64c50211794b8db3e8" as Address,
  /** Mock stablecoin (USDC equivalent for testnet) */
  USDC: "0x81832F6F0fBc3413767b973853bB4929698980d3" as Address,
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
