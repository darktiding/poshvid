import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { DescriptionOptions } from "./types"

export async function generateDescription(options: DescriptionOptions): Promise<string> {
  const { listing, tone, length } = options

  // Create a prompt that includes all the listing details
  const prompt = `
    Create a compelling ${tone} description for a video about this Poshmark listing.
    The video will be approximately ${length} seconds long.
    
    Item Details:
    - Title: ${listing.title}
    - Price: $${listing.price}
    - Brand: ${listing.brand || "Not specified"}
    - Size: ${listing.size || "Not specified"}
    - Condition: ${listing.condition || "Not specified"}
    - Category: ${listing.category || "Not specified"}
    
    Original Description:
    ${listing.description}
    
    Additional Attributes:
    ${Object.entries(listing.attributes)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n")}
    
    Guidelines:
    - Keep the description concise but engaging
    - Highlight key selling points
    - Mention material, condition, and special features
    - Use a ${tone} tone throughout
    - The description should be suitable for a ${length}-second video
    - Focus on what makes this item special
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return text
  } catch (error) {
    console.error("Error generating description:", error)
    throw new Error("Failed to generate description. Please try again.")
  }
}
