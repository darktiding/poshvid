import { Suspense } from "react"
import ListingForm from "@/components/listing-form"
import { Toaster } from "@/components/ui/toaster"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Poshmark Video Creator</h1>
          <ModeToggle />
        </div>
      </header>
      <main className="container py-10">
        <section className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Create Engaging Videos from Poshmark Listings</h2>
            <p className="text-muted-foreground">
              Transform your Poshmark listings into professional videos with AI-generated descriptions and voiceovers
            </p>
          </div>

          <Suspense fallback={<div className="h-[400px] flex items-center justify-center">Loading form...</div>}>
            <ListingForm />
          </Suspense>
        </section>
      </main>
      <Toaster />
    </div>
  )
}
