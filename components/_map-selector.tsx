"use client";

import dynamic from "next/dynamic";
import type { TripLocation } from "@/lib/types";

const MapSelectorInner = dynamic(() => import("./map-selector-inner"), {
    ssr: false,
});

interface MapSelectorProps {
    initialLatLng?: TripLocation;
    onSelectLocation: (latLng: TripLocation) => void;
    onClose: () => void;
}

export function MapSelector(props: MapSelectorProps) {
    return <MapSelectorInner {...props} />;
}
