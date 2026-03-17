import { NextRequest, NextResponse } from "next/server"

const PYTH_HERMES_URL = "https://hermes.pyth.network"

/**
 * Proxy endpoint for Pyth Hermes price data.
 * Avoids CORS issues by routing through Next.js backend.
 *
 * GET /api/pyth/prices?ids[]=0x...&ids[]=0x...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ids = searchParams.getAll("ids[]")

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameter: ids[]" },
        { status: 400 }
      )
    }

    // Build Pyth Hermes query
    const params = new URLSearchParams()
    for (const id of ids) {
      params.append("ids[]", id)
    }
    params.set("encoding", "hex")
    params.set("parsed", "true")

    const url = `${PYTH_HERMES_URL}/v2/updates/price/latest?${params.toString()}`

    console.log("[Pyth Prices] Fetching:", url)

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Pyth Prices] Error response:", response.status, errorText)
      throw new Error(`Pyth API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("[Pyth Proxy Error]", error)
    return NextResponse.json(
      { error: "Failed to fetch Pyth price data" },
      { status: 502 }
    )
  }
}
