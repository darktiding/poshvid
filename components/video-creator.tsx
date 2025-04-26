"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, Play, Square, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { ListingDetails } from "@/lib/types"
import { createVideo } from "@/lib/create-video"

interface VideoCreatorProps {
  listing: ListingDetails
  description: string
  audioUrl: string
  onBack: () => void
}

export default function VideoCreator({ listing, description, audioUrl, onBack }: VideoCreatorProps) {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transitionStyle, setTransitionStyle] = useState("fade")
  const [slideDuration, setSlideDuration] = useState(5)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState("mp4")
  const [exportResolution, setExportResolution] = useState("1080p")

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("ended", () => setIsPlaying(false))

      // Add error handling for video
      videoRef.current.addEventListener("error", (e) => {
        console.error("Video playback error:", e)
        toast({
          variant: "destructive",
          title: "Video playback error",
          description: "Could not play the generated video. Please try again.",
        })
        setIsPlaying(false)
      })
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", () => setIsPlaying(false))
        videoRef.current.removeEventListener("error", () => {})
      }
    }
  }, [videoRef, toast])

  async function handleCreateVideo() {
    setIsCreating(true)
    try {
      const video = await createVideo({
        listing,
        audioUrl,
        transitionStyle,
        slideDuration,
      })
      setVideoUrl(video.videoUrl)
      toast({
        title: "Video created",
        description: "Your video is ready for preview and export",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating video",
        description: error instanceof Error ? error.message : "Failed to create video",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const togglePlayback = () => {
    if (!videoRef.current || !videoUrl) return

    try {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        // Add a promise to handle play errors
        const playPromise = videoRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((error) => {
              console.error("Video playback error:", error)
              toast({
                variant: "destructive",
                title: "Playback error",
                description: "Could not play the video. Please try again.",
              })
            })
        }
      }
    } catch (error) {
      console.error("Video playback error:", error)
      toast({
        variant: "destructive",
        title: "Video playback error",
        description: "Could not play the video. Please try again.",
      })
    }
  }

  const handleExport = async () => {
    if (!videoUrl) return

    setIsExporting(true)
    try {
      // In a real implementation, this would process the video for export
      // For now, we'll just simulate a download
      const a = document.createElement("a")
      a.href = videoUrl
      a.download = `poshmark-listing-${listing.id}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: "Video exported",
        description: `Your video has been exported in ${exportResolution} resolution`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error exporting video",
        description: error instanceof Error ? error.message : "Failed to export video",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create & Edit Video</CardTitle>
        <CardDescription>Customize and create your listing video</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Transition Style</h3>
              <Select defaultValue={transitionStyle} onValueChange={setTransitionStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transition style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="dissolve">Dissolve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Slide Duration (seconds)</h3>
              <div className="flex items-center space-x-4">
                <Slider
                  defaultValue={[slideDuration]}
                  min={3}
                  max={10}
                  step={1}
                  onValueChange={(value) => setSlideDuration(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{slideDuration}s</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateVideo} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Video
            </Button>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Video Preview</h3>
            {videoUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                  <video ref={videoRef} src={videoUrl} className="w-full h-full" controls={false} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-background/80"
                      onClick={togglePlayback}
                    >
                      {isPlaying ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Export Format</h3>
                    <Select defaultValue={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select export format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="mov">MOV</SelectItem>
                        <SelectItem value="webm">WebM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Resolution</h3>
                    <Select defaultValue={exportResolution} onValueChange={setExportResolution}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="square">Square (1:1)</SelectItem>
                        <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleExport} disabled={isExporting}>
                    {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Download className="mr-2 h-4 w-4" />
                    Export Video
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Create a video to preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
