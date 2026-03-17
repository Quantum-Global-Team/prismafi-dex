/**
 * Tessera DEX — display formatting utilities.
 * All functions are pure and side-effect free.
 */

/**
 * Format a forex price to a fixed number of decimal places.
 * Uses a narrow no-break space as a thousands separator.
 *
 * @example formatPrice(1.09542, 5) → "1.09542"
 * @example formatPrice(0.006659, 7) → "0.0066590"
 */
export function formatPrice(
  value: number,
  decimals: number,
): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false,
  })
}

/**
 * Format a forex price with automatic decimal selection based on magnitude.
 * High-value pairs (≥ 0.01) → 5 decimals; low-value pairs (< 0.01) → 7 decimals.
 */
export function formatPriceAuto(value: number): string {
  const decimals = value >= 0.01 ? 5 : 7
  return formatPrice(value, decimals)
}

/**
 * Format a percentage change with sign and two decimal places.
 *
 * @example formatChange(0.52)  → "+0.52%"
 * @example formatChange(-1.23) → "-1.23%"
 */
export function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

/**
 * Determine whether a change value is positive, negative, or neutral.
 * Useful for applying state-positive / state-negative CSS classes.
 */
export function changeDirection(
  value: number | null,
): "positive" | "negative" | "neutral" {
  if (value === null) return "neutral"
  if (value > 0) return "positive"
  if (value < 0) return "negative"
  return "neutral"
}

/**
 * Format a Unix timestamp (seconds) to a relative "last updated" string.
 *
 * @example formatPublishTime(Date.now() / 1000 - 4) → "4s ago"
 */
export function formatPublishTime(publishTime: number): string {
  const diffSeconds = Math.floor(Date.now() / 1000 - publishTime)
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
  return `${Math.floor(diffSeconds / 3600)}h ago`
}

/**
 * Format a large USD notional value with abbreviated suffix.
 *
 * @example formatNotional(1_234_567) → "$1.23M"
 * @example formatNotional(987_000)   → "$987K"
 */
export function formatNotional(value: number): string {
  if (value >= 1_000_000_000)
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}
