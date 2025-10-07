import { TripForm } from "@/components/trip-form"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-balance bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Driver Trip Planner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Plan your route with FMCSA-compliant Hours-of-Service scheduling. Get optimized driving schedules that keep
            you legal and efficient.
          </p>
        </div>
        <TripForm />
      </div>
    </div>
  )
}
