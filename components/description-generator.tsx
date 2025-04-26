"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { ListingDetails } from "@/lib/types"
import { generateDescription } from "@/lib/generate-description"
import VoiceoverGenerator from "./voiceover-generator"

interface DescriptionGeneratorProps {
  listing: ListingDetails
  onBack: () => void
}

export default function DescriptionGenerator({ listing, onBack }: DescriptionGeneratorProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [description, setDescription] = useState("")
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("30")
  const [step, setStep] = useState(1)

  async function handleGenerate() {
    setIsGenerating(true)
    try {
      const generatedDescription = await generateDescription({
        listing,
        tone,
        length: Number.parseInt(length),
      })
      setDescription(generatedDescription)
      toast({
        title: "Description generated",
        description: "Your AI-powered description is ready for review",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error generating description",
        description: error instanceof Error ? error.message : "Failed to generate description",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContinue = () => {
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Description required",
        description: "Please generate or enter a description before continuing",
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
            <CardTitle>Generate Description</CardTitle>
            <CardDescription>Create an engaging description for your video</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Tone</h3>
                <RadioGroup defaultValue={tone} onValueChange={setTone} className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="professional" />
                    <Label htmlFor="professional">Professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casual" id="casual" />
                    <Label htmlFor="casual">Casual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="luxurious" id="luxurious" />
                    <Label htmlFor="luxurious">Luxurious</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fun" id="fun" />
                    <Label htmlFor="fun">Fun</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Video Length</h3>
                <RadioGroup defaultValue={length} onValueChange={setLength} className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="30sec" />
                    <Label htmlFor="30sec">30 seconds</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="45" id="45sec" />
                    <Label htmlFor="45sec">45 seconds</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="60" id="60sec" />
                    <Label htmlFor="60sec">60 seconds</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Generate or write a description for your video"
                  className="min-h-[200px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button onClick={handleContinue}>Continue to Voiceover</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && <VoiceoverGenerator description={description} listing={listing} onBack={() => setStep(1)} />}
    </div>
  )
}
