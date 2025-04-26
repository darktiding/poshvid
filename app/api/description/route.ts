import { NextResponse } from "next/server"
import { generateDescription } from "@/lib/generate-description"

export async function POST(request: Request) {
  try {
    const { listing, tone, length } = await request.json()

    if (!listing || !tone || !length) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const description = await generateDescription({
      listing,
      tone,
      length,
    })

    return NextResponse.json({ description })
  } catch (error) {
    console.error("Error generating description:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate description" },
      { status: 500 },
    )
  }
}
