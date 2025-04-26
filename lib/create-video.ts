import type { VideoOptions } from "./types"

export async function createVideo(options: VideoOptions): Promise<{ videoUrl: string }> {
  const { listing, audioUrl, transitionStyle, slideDuration } = options

  try {
    // Call the server API route to create the video
    const response = await fetch("/api/video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listing,
        audioUrl,
        transitionStyle,
        slideDuration,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create video")
    }

    // Get the video data
    const data = await response.json()

    return { videoUrl: data.videoUrl }
  } catch (error) {
    console.error("Error creating video:", error)
    throw new Error("Failed to create video. Please try again.")
  }
}
