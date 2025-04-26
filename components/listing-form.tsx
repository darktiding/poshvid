"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import type { ListingDetails } from "@/lib/types"
import ListingPreview from "./listing-preview"
import DescriptionGenerator from "./description-generator"

const formSchema = z.object({
  listingUrl: z
    .string()
    .url("Please enter a valid Poshmark listing URL")
    .refine((url) => url.includes("poshmark.com"), {
      message: "URL must be from poshmark.com",
    }),
})

export default function ListingForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [listingData, setListingData] = useState<ListingDetails | null>(null)
  const [step, setStep] = useState(1)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listingUrl: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Call the API route to extract listing data
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: values.listingUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to extract listing data")
      }

      const data = await response.json()
      setListingData(data)
      setStep(2)
      toast({
        title: "Listing extracted successfully",
        description: `Found ${data.title} with ${data.images.length} images`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error extracting listing",
        description: error instanceof Error ? error.message : "Failed to extract listing data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  return (
    <div className="space-y-8">
      {step === 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="listingUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poshmark Listing URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://poshmark.com/listing/..." {...field} />
                  </FormControl>
                  <FormDescription>Enter the URL of a Poshmark listing you want to create a video for</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Extract Listing Data
            </Button>
          </form>
        </Form>
      )}

      {step === 2 && listingData && (
        <div className="space-y-6">
          <ListingPreview listing={listingData} />
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Continue to Description</Button>
          </div>
        </div>
      )}

      {step === 3 && listingData && <DescriptionGenerator listing={listingData} onBack={handleBack} />}
    </div>
  )
}
