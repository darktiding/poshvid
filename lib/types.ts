export interface ListingDetails {
  id: string
  url: string
  title: string
  description: string
  price: string
  brand?: string
  size?: string
  condition?: string
  category?: string
  images: string[]
  attributes: Record<string, string>
}

export interface DescriptionOptions {
  listing: ListingDetails
  tone: string
  length: number
}

export interface VoiceoverOptions {
  text: string
  voiceId: string
}

export interface VideoOptions {
  listing: ListingDetails
  audioUrl: string
  transitionStyle: string
  slideDuration: number
}
