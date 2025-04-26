import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id
    const videoPath = path.join(process.cwd(), "tmp", videoId, "final_output.mp4")

    // Check if the video exists
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Read the video file
    const videoBuffer = fs.readFileSync(videoPath)

    // Return the video
    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `inline; filename="poshmark-video-${videoId}.mp4"`,
      },
    })
  } catch (error) {
    console.error("Error serving video:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to serve video" },
      { status: 500 },
    )
  }
}
