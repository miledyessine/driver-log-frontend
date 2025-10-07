"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import type { TripLocation } from "@/lib/types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in react-leaflet
const defaultIcon = L.icon({
    iconUrl: "/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapSelectorProps {
    initialLatLng?: TripLocation;
    onSelectLocation: (latLng: TripLocation) => void;
    onClose: () => void;
}

function MapClickHandler({
    onLocationSelect,
}: {
    onLocationSelect: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click: (e) => onLocationSelect(e.latlng.lat, e.latlng.lng),
    });
    return null;
}

function LocationButton({
    onLocationFound,
}: {
    onLocationFound: (lat: number, lng: number) => void;
}) {
    const map = useMapEvents({});

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], 13);
                onLocationFound(latitude, longitude);
            },
            (err) => {
                console.error(err);
                alert("Unable to retrieve your location");
            }
        );
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleGetLocation}
            className="gap-2 bg-transparent absolute top-3 right-3 z-[1000] shadow-md"
        >
            <Navigation className="h-4 w-4" />
            Use My Location
        </Button>
    );
}

export default function MapSelectorInner({
    initialLatLng,
    onSelectLocation,
    onClose,
}: MapSelectorProps) {
    const [selectedLocation, setSelectedLocation] =
        useState<TripLocation | null>(initialLatLng || null);

    const defaultCenter: [number, number] = initialLatLng
        ? [initialLatLng.lat, initialLatLng.lng]
        : [39.8283, -98.5795]; // USA center
    const defaultZoom = initialLatLng ? 13 : 5;

    const handleLocationSelect = (lat: number, lng: number) => {
        const newLocation = { lat, lng };
        setSelectedLocation(newLocation);
        onSelectLocation(newLocation);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-border">
                <MapContainer
                    center={defaultCenter}
                    zoom={defaultZoom}
                    scrollWheelZoom={true}
                    className="w-full h-full"
                    zoomControl={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {selectedLocation && (
                        <Marker
                            position={[
                                selectedLocation.lat,
                                selectedLocation.lng,
                            ]}
                            icon={defaultIcon}
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target;
                                    const pos = marker.getLatLng();
                                    handleLocationSelect(pos.lat, pos.lng);
                                },
                            }}
                        />
                    )}

                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                    <LocationButton onLocationFound={handleLocationSelect} />
                </MapContainer>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedLocation ? (
                        <span className="font-mono">
                            {selectedLocation.lat.toFixed(6)},{" "}
                            {selectedLocation.lng.toFixed(6)}
                        </span>
                    ) : (
                        <span>Click on the map to select a location</span>
                    )}
                </div>

                <Button
                    variant="default"
                    size="sm"
                    onClick={onClose}
                    disabled={!selectedLocation}
                >
                    Confirm Location
                </Button>
            </div>
        </div>
    );
}
