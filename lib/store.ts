import { create } from "zustand"
import type { TripResponse } from "./types"

interface TripStore {
  tripData: TripResponse | null
  setTripData: (data: TripResponse) => void
  clearTripData: () => void
}

export const useTripStore = create<TripStore>((set) => ({
  tripData: null,
  setTripData: (data) => set({ tripData: data }),
  clearTripData: () => set({ tripData: null }),
}))
