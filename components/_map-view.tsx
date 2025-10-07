"use client";

import dynamic from "next/dynamic";
import type { TripResponse } from "@/lib/types";

const MapViewInner = dynamic(() => import("./map-view-inner"), {
    ssr: false,
});

interface MapViewProps {
    tripData: TripResponse;
}

export function MapView(props: MapViewProps) {
    return <MapViewInner {...props} />;
}
