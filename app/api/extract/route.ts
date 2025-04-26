import { NextResponse } from "next/server"
import { extractListingData } from "@/lib/extract-listing"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const listingData = await extractListingData(url)

    return NextResponse.json(listingData)
  } catch (error) {
    console.error("Error extracting listing:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract listing data" },
      { status: 500 },
    )
  }
}
