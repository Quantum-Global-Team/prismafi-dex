import { defineChain } from "viem"

/**
 * Moonbase Alpha — Polkadot EVM-compatible testnet (Moonbeam ecosystem).
 * https://docs.moonbeam.network/networks/testnet/
 */
export const moonbaseAlpha = defineChain({
  id: 1287,
  name: "Moonbase Alpha",
  nativeCurrency: {
    decimals: 18,
    name: "Dev",
    symbol: "DEV",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL ??
        "https://rpc.api.moonbase.moonbeam.network",
      ],
      webSocket: ["wss://wss.api.moonbase.moonbeam.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonbase.moonscan.io",
      apiUrl: "https://api-moonbase.moonscan.io/api",
    },
  },
  testnet: true,
})

export const SUPPORTED_CHAINS = [moonbaseAlpha] as const

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]
export type SupportedChainId = SupportedChain["id"]

/** Chain ID used for the application. Override via NEXT_PUBLIC_CHAIN_ID. */
export const TARGET_CHAIN_ID: SupportedChainId =
  (Number(process.env.NEXT_PUBLIC_CHAIN_ID) as SupportedChainId) ?? 1287
