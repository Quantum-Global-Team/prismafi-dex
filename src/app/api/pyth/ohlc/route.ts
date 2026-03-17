import { NextRequest, NextResponse } from "next/server"

const PYTH_BENCHMARKS_URL = "https://benchmarks.pyth.network"

/**
 * Proxy endpoint for Pyth Benchmarks OHLC data.
 * Avoids CORS issues by routing through Next.js backend.
 *
 * GET /api/pyth/ohlc?symbol=FX.EUR/USD&resolution=15&from=1234567890&to=1234567890
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get("symbol")
    const resolution = searchParams.get("resolution")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!symbol || !resolution || !from || !to) {
      return NextResponse.json(
        { error: "Missing required parameters: symbol, resolution, from, to" },
        { status: 400 }
      )
    }

    const params = new URLSearchParams({
      symbol,
      resolution,
      from,
      to,
    })

    const url = `${PYTH_BENCHMARKS_URL}/v1/shims/tradingview/history?${params.toString()}`

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Pyth API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("[Pyth OHLC Proxy Error]", error)
    return NextResponse.json(
      { error: "Failed to fetch Pyth OHLC data" },
      { status: 502 }
    )
  }
}
