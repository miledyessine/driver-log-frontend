"use client";

import { useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TripResponse } from "@/lib/types";

// Custom marker icons
const createCustomIcon = (color: string, size = 24) => {
    return L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

const currentIcon = createCustomIcon("#3b82f6", 24);
const pickupIcon = createCustomIcon("#22c55e", 24);
const dropoffIcon = createCustomIcon("#ef4444", 24);
const restIcon = createCustomIcon("#f59e0b", 16);

// Component to fit map bounds to route
function FitBounds({ coordinates }: { coordinates: [number, number][] }) {
    const map = useMap();

    useMemo(() => {
        if (coordinates.length > 0) {
            const bounds = L.latLngBounds(coordinates);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coordinates, map]);

    return null;
}



export default function MapViewInner({ tripData }: { tripData: TripResponse }) {
    // Extract and convert coordinates from [lng, lat] to [lat, lng]
    const coordinates = useMemo(() => {
        const coords = tripData.route.features[0]?.geometry.coordinates || [];
        return coords.map((coord): [number, number] => [coord[1], coord[0]]);
    }, [tripData]);

    // Calculate marker positions
    const startCoord = coordinates[0];
    const endCoord = coordinates[coordinates.length - 1];
    const pickupCoord = coordinates[Math.floor(coordinates.length / 3)];

    // Get rest stops from schedule
    const restStops = useMemo(() => {
        const totalMiles = tripData?.schedule?.total_miles;
        const restEntries = tripData.schedule.schedule.filter(
            (entry) => entry.status === "OffDuty" || entry.status === "Sleeper"
        );

        return restEntries.map((stop) => {
            const progress = (stop.miles_since_start || 0) / totalMiles;
            const coordIndex = Math.min(
                Math.floor(progress * (coordinates.length - 1)),
                coordinates.length - 1
            );
            return {
                position: coordinates[coordIndex],
                note: stop.note,
            };
        });
    }, [tripData.schedule.schedule, coordinates]);

    if (!coordinates.length) {
        return (
            <div className="w-full h-full min-h-[500px] rounded-lg border border-border flex items-center justify-center">
                <p className="text-muted-foreground">No route data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-border">
            <MapContainer
                center={startCoord || [37.0, -115.0]}
                zoom={6}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />

                {/* Route polyline */}
                <Polyline
                    positions={coordinates}
                    pathOptions={{
                        color: "#3b82f6",
                        weight: 4,
                        opacity: 0.8,
                    }}
                />

                {/* Current location marker */}
                {startCoord && (
                    <Marker position={startCoord} icon={currentIcon}>
                        <Popup>
                            <div className="font-sans p-1">
                                <strong className="text-blue-500">
                                    Current Location
                                </strong>
                                <br />
                                <span className="text-xs text-muted-foreground">
                                    Start of route
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Pickup location marker */}
                {pickupCoord && (
                    <Marker position={pickupCoord} icon={pickupIcon}>
                        <Popup>
                            <div className="font-sans p-1">
                                <strong className="text-green-500">
                                    Pickup Location
                                </strong>
                                <br />
                                <span className="text-xs text-muted-foreground">
                                    Cargo pickup point
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Dropoff location marker */}
                {endCoord && (
                    <Marker position={endCoord} icon={dropoffIcon}>
                        <Popup>
                            <div className="font-sans p-1">
                                <strong className="text-red-500">
                                    Dropoff Location
                                </strong>
                                <br />
                                <span className="text-xs text-muted-foreground">
                                    Final destination
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Rest stop markers */}
                {restStops.map((stop, index) => (
                    <Marker
                        key={index}
                        position={stop.position}
                        icon={restIcon}
                    >
                        <Popup>
                            <div className="font-sans p-1">
                                <strong className="text-orange-500">
                                    Rest Stop
                                </strong>
                                <br />
                                <span className="text-xs text-muted-foreground">
                                    {stop.note}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Fit bounds to show entire route */}
                <FitBounds coordinates={coordinates} />
            </MapContainer>
        </div>
    );
}
