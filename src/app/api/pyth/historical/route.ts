import { NextRequest, NextResponse } from "next/server"

const PYTH_HERMES_URL = "https://hermes.pyth.network"

/**
 * Proxy endpoint for Pyth Hermes historical price data.
 * Avoids CORS issues by routing through Next.js backend.
 *
 * GET /api/pyth/historical?timestamp=1234567890&ids[]=0x...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timestamp = searchParams.get("timestamp")
    const ids = searchParams.getAll("ids[]")

    if (!timestamp) {
      return NextResponse.json(
        { error: "Missing required parameter: timestamp" },
        { status: 400 }
      )
    }

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

    const url = `${PYTH_HERMES_URL}/v2/updates/price/${timestamp}?${params.toString()}`

    console.log("[Pyth Historical] Fetching:", url)

    const response = await fetch(url, {
      cache: "force-cache",
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Pyth Historical] Error response:", response.status, errorText)
      throw new Error(`Pyth API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    })
  } catch (error) {
    console.error("[Pyth Historical Proxy Error]", error)
    return NextResponse.json(
      { error: "Failed to fetch Pyth historical data" },
      { status: 502 }
    )
  }
}
