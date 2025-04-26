"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ListingDetails } from "@/lib/types"

interface ListingPreviewProps {
  listing: ListingDetails
}

export default function ListingPreview({ listing }: ListingPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listing Preview</CardTitle>
        <CardDescription>Review the extracted listing details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative aspect-square overflow-hidden rounded-md">
          {listing.images.length > 0 ? (
            <>
              <Image
                src={listing.images[currentImageIndex] || "/placeholder.svg"}
                alt={`Product image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  // If image fails to load, replace with placeholder
                  const target = e.target as HTMLImageElement
                  target.src = "/assorted-products-display.png"
                  console.error("Image failed to load:", listing.images[currentImageIndex])
                }}
              />
              {listing.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 text-xs rounded-md">
                {currentImageIndex + 1} / {listing.images.length}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">No images available</div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{listing.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">${listing.price}</Badge>
              {listing.brand && <Badge variant="outline">{listing.brand}</Badge>}
              {listing.size && <Badge variant="outline">Size: {listing.size}</Badge>}
              {listing.condition && <Badge variant="outline">{listing.condition}</Badge>}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{listing.description}</p>
          </div>

          {Object.entries(listing.attributes).length > 0 && (
            <div>
              <h4 className="font-medium mb-1">Attributes</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(listing.attributes).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
