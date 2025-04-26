import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Add headers to mimic a browser request
    const headers = new Headers()
    headers.append(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    )
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
    headers.append("Accept-Language", "en-US,en;q=0.5")

    const response = await fetch(url, {
      headers,
      redirect: "follow",
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "text/html"
    const data = await response.text()

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
      },
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
