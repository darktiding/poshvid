import type { VoiceoverOptions } from "./types"

export async function generateVoiceover(options: VoiceoverOptions): Promise<{ audioUrl: string }> {
  const { text, voiceId } = options

  try {
    // Prepare the request to Eleven Labs API
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
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
      throw new Error(`Failed to generate voiceover: ${response.statusText}`)
    }

    // Get the audio data as a blob
    const audioBlob = await response.blob()

    // Create a URL for the blob
    const audioUrl = URL.createObjectURL(audioBlob)

    return { audioUrl }
  } catch (error) {
    console.error("Error generating voiceover:", error)
    throw new Error("Failed to generate voiceover. Please try again.")
  }
}
