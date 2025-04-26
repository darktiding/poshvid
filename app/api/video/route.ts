import { NextResponse } from "next/server"
import { createCanvas } from "canvas"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import type { VideoOptions } from "@/lib/types"

// Configure ffmpeg path if needed
// ffmpeg.setFfmpegPath('/path/to/ffmpeg')

export async function POST(request: Request) {
  try {
    const { listing, audioUrl, transitionStyle, slideDuration } = (await request.json()) as VideoOptions

    if (!listing || !audioUrl || !transitionStyle || !slideDuration) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Create a unique ID for this video
    const videoId = uuidv4()
    const tempDir = path.join(process.cwd(), "tmp", videoId)

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Download images
    const imageFiles = await Promise.all(
      listing.images.map(async (imageUrl, index) => {
        try {
          const response = await fetch(imageUrl)
          if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)

          const buffer = await response.arrayBuffer()
          const imagePath = path.join(tempDir, `image_${index}.jpg`)
          fs.writeFileSync(imagePath, Buffer.from(buffer))
          return imagePath
        } catch (error) {
          console.error(`Error downloading image ${imageUrl}:`, error)
          // Create a placeholder image
          const canvas = createCanvas(800, 800)
          const ctx = canvas.getContext("2d")
          ctx.fillStyle = "#f0f0f0"
          ctx.fillRect(0, 0, 800, 800)
          ctx.fillStyle = "#333333"
          ctx.font = "30px Arial"
          ctx.textAlign = "center"
          ctx.fillText("Image not available", 400, 400)

          const imagePath = path.join(tempDir, `image_${index}.jpg`)
          fs.writeFileSync(imagePath, canvas.toBuffer("image/jpeg"))
          return imagePath
        }
      }),
    )

    // Download audio
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`)
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    const audioPath = path.join(tempDir, "audio.mp3")
    fs.writeFileSync(audioPath, Buffer.from(audioBuffer))

    // Create video with ffmpeg
    const outputPath = path.join(tempDir, "output.mp4")

    // Create a video from images
    const ffmpegCommand = ffmpeg()

    // Add each image with the specified duration
    imageFiles.forEach((imagePath) => {
      ffmpegCommand.input(imagePath).duration(slideDuration)
    })

    // Set transition based on style
    let transition = "fade"
    switch (transitionStyle) {
      case "slide":
        transition = "slideleft"
        break
      case "zoom":
        transition = "zoompan"
        break
      case "dissolve":
        transition = "dissolve"
        break
      default:
        transition = "fade"
    }

    // Configure the video
    ffmpegCommand
      .inputFPS(30)
      .complexFilter([
        `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,${transition}=duration=1:offset=0,format=yuv420p[v]`,
      ])
      .outputOptions(["-map [v]"])
      .noAudio()
      .output(outputPath)
      .on("end", () => {
        console.log("Video created successfully")
      })
      .on("error", (err) => {
        console.error("Error creating video:", err)
        throw new Error("Failed to create video")
      })
      .run()

    // Add audio to the video
    const finalOutputPath = path.join(tempDir, "final_output.mp4")
    ffmpeg()
      .input(outputPath)
      .input(audioPath)
      .outputOptions(["-c:v copy", "-c:a aac", "-shortest"])
      .output(finalOutputPath)
      .on("end", () => {
        console.log("Audio added to video successfully")
      })
      .on("error", (err) => {
        console.error("Error adding audio to video:", err)
        throw new Error("Failed to add audio to video")
      })
      .run()

    // Return the video URL
    const videoUrl = `/api/video/${videoId}`

    return NextResponse.json({ videoUrl })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create video" },
      { status: 500 },
    )
  }
}
