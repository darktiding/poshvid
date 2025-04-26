"use client"

import { useState } from "react"
import { Loader2, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { ListingDetails } from "@/lib/types"
import VideoCreator from "./video-creator"

interface VoiceoverGeneratorProps {
  description: string
  listing: ListingDetails
  onBack: () => void
}

export default function VoiceoverGenerator({ description, listing, onBack }: VoiceoverGeneratorProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [voiceId, setVoiceId] = useState("21m00Tcm4TlvDq8ikWAM")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [step, setStep] = useState(1)

  const voices = [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", description: "Calm female voice" },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", description: "Professional female voice" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", description: "Gentle female voice" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni", description: "Warm male voice" },
    { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", description: "Friendly female voice" },
    { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", description: "Deep male voice" },
  ]

  async function handleGenerate() {
    setIsGenerating(true)
    try {
      // Call the server API route to generate the voiceover
      const response = await fetch("/api/voiceover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: description,
          voiceId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate voiceover")
      }

      // Get the audio data as a blob
      const audioBlob = await response.blob()

      // Create a URL for the blob
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      // Create audio element for playback with error handling
      if (audioElement) {
        audioElement.pause()
        audioElement.src = url
      } else {
        const newAudio = new Audio()

        // Add error handling
        newAudio.addEventListener("error", (e) => {
          console.error("Audio playback error:", e)
          toast({
            variant: "destructive",
            title: "Audio playback error",
            description: "Could not play the generated audio. Please try again.",
          })
          setIsPlaying(false)
        })

        newAudio.addEventListener("ended", () => setIsPlaying(false))
        newAudio.src = url
        setAudioElement(newAudio)
      }

      toast({
        title: "Voiceover generated",
        description: "Your AI-powered voiceover is ready for preview",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error generating voiceover",
        description: error instanceof Error ? error.message : "Failed to generate voiceover",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayback = () => {
    if (!audioElement || !audioUrl) return

    try {
      if (isPlaying) {
        audioElement.pause()
        setIsPlaying(false)
      } else {
        // Add a promise to handle play errors
        const playPromise = audioElement.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((error) => {
              console.error("Playback error:", error)
              toast({
                variant: "destructive",
                title: "Playback error",
                description: "Could not play the audio. Please try again.",
              })
            })
        }
      }
    } catch (error) {
      console.error("Audio playback error:", error)
      toast({
        variant: "destructive",
        title: "Audio playback error",
        description: "Could not play the audio. Please try again.",
      })
    }
  }

  const handleContinue = () => {
    if (!audioUrl) {
      toast({
        variant: "destructive",
        title: "Voiceover required",
        description: "Please generate a voiceover before continuing",
      })
      return
    }
    setStep(2)
  }

  return (
    <div className="space-y-6">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Voiceover</CardTitle>
            <CardDescription>Create a voiceover for your video</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Voice Selection</h3>
                <RadioGroup
                  defaultValue={voiceId}
                  onValueChange={setVoiceId}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {voices.map((voice) => (
                    <div key={voice.id} className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value={voice.id} id={voice.id} />
                      <div>
                        <Label htmlFor={voice.id} className="font-medium">
                          {voice.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{voice.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">Preview</h3>
                  <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Voiceover
                  </Button>
                </div>

                <div className="flex items-center justify-center h-20 bg-muted rounded-md">
                  {audioUrl ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={togglePlayback}
                      disabled={!audioUrl}
                    >
                      {isPlaying ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">Generate a voiceover to preview</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button onClick={handleContinue}>Continue to Video Creation</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && audioUrl && (
        <VideoCreator listing={listing} description={description} audioUrl={audioUrl} onBack={() => setStep(1)} />
      )}
    </div>
  )
}
