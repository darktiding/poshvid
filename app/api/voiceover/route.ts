import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text, voiceId } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Call Eleven Labs API directly from the server
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Eleven Labs API error:", errorData)
      return NextResponse.json(
        { error: `Failed to generate voiceover: ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()

    // Return the audio as a response
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Error generating voiceover:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate voiceover" },
      { status: 500 },
    )
  }
}
