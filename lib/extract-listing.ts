import { load } from "cheerio"
import type { ListingDetails } from "./types"

export async function extractListingData(url: string): Promise<ListingDetails> {
  try {
    // Validate URL
    if (!url.includes("poshmark.com")) {
      throw new Error("Invalid Poshmark URL")
    }

    // Extract listing ID from URL for unique identification
    const listingId = url.split("/").pop() || Math.random().toString(36).substring(2, 10)

    // Use a proxy to avoid CORS issues
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch listing: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = load(html)

    // Extract listing details
    const title = $(".listing-title").text().trim() || "Poshmark Listing"
    const price = $(".listing-price").text().trim().replace("$", "") || "0.00"
    const description = $(".listing-description").text().trim() || "No description available"

    // Extract brand, size, and condition
    const brand = $(".listing-brand").text().trim() || undefined
    const size = $(".listing-size").text().trim() || undefined
    const condition = $(".listing-condition").text().trim() || undefined
    const category = $(".listing-category").text().trim() || undefined

    // Extract images
    const images: string[] = []
    $(".listing-image-container img").each((_, element) => {
      const src = $(element).attr("src") || $(element).attr("data-src")
      if (src) {
        // Convert thumbnail URLs to full-size image URLs if needed
        const fullSizeUrl = src.replace("_thumbnail", "")
        images.push(fullSizeUrl)
      }
    })

    // If no images found, add placeholder
    if (images.length === 0) {
      images.push("/assorted-products-display.png")
    }

    // Extract additional attributes
    const attributes: Record<string, string> = {}
    $(".listing-attributes .attribute").each((_, element) => {
      const key = $(element).find(".attribute-name").text().trim()
      const value = $(element).find(".attribute-value").text().trim()
      if (key && value) {
        attributes[key] = value
      }
    })

    return {
      id: listingId,
      url,
      title,
      description,
      price,
      brand,
      size,
      condition,
      category,
      images,
      attributes,
    }
  } catch (error) {
    console.error("Error extracting listing data:", error)
    throw new Error("Failed to extract listing data. Please check the URL and try again.")
  }
}
