/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Navigation, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useTripStore } from "@/lib/store";
import { MapSelector } from "@/components/_map-selector";
import type { TripFormData, TripLocation } from "@/lib/types";

const USA_DEFAULTS: Record<"current" | "pickup" | "dropoff", TripLocation> = {
    current: { lat: 42.36301041610007, lng: -71.07849929494147 }, // Boston, MA
    pickup: { lat: 40.768074671327085, lng: -73.96455689735257 }, // New York, NY
    dropoff: { lat: 25.81329571559653, lng: -80.2219769903625 }, // Miami, FL
};

export function TripForm() {
    const router = useRouter();
    const setTripData = useTripStore((state) => state.setTripData);
    const [isLoading, setIsLoading] = useState(false);

    // 🧠 main data stored as numbers (strict)
    const [formData, setFormData] = useState<TripFormData>({
        current_location: USA_DEFAULTS.current,
        pickup_location: USA_DEFAULTS.pickup,
        dropoff_location: USA_DEFAULTS.dropoff,
        current_cycle_used_hours: 30,
    });

    // ✏️ string versions for user editing (so we don’t fight React’s number parsing)
    const [inputValues, setInputValues] = useState({
        current_location: {
            lat: String(USA_DEFAULTS.current.lat),
            lng: String(USA_DEFAULTS.current.lng),
        },
        pickup_location: {
            lat: String(USA_DEFAULTS.pickup.lat),
            lng: String(USA_DEFAULTS.pickup.lng),
        },
        dropoff_location: {
            lat: String(USA_DEFAULTS.dropoff.lat),
            lng: String(USA_DEFAULTS.dropoff.lng),
        },
        current_cycle_used_hours: String(30),
    });

    const [mapOpenFor, setMapOpenFor] = useState<
        "current" | "pickup" | "dropoff" | null
    >(null);

    // ✅ Handle input typing safely (string state)
    const handleInputChange = (
        location: "current_location" | "pickup_location" | "dropoff_location",
        field: "lat" | "lng",
        value: string
    ) => {
        setInputValues((prev) => ({
            ...prev,
            [location]: {
                ...prev[location],
                [field]: value,
            },
        }));

        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
            setFormData((prev) => ({
                ...prev,
                [location]: {
                    ...prev[location],
                    [field]: parsed,
                },
            }));
        }
    };

    const handleCycleChange = (value: string) => {
        setInputValues((prev) => ({
            ...prev,
            current_cycle_used_hours: value,
        }));
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
            setFormData((prev) => ({
                ...prev,
                current_cycle_used_hours: parsed,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate inputs
            if (
                !formData.current_location.lat ||
                !formData.current_location.lng ||
                !formData.pickup_location.lat ||
                !formData.pickup_location.lng ||
                !formData.dropoff_location.lat ||
                !formData.dropoff_location.lng
            ) {
                toast("Invalid input", {
                    description: "Please fill in all location coordinates",
                });
                setIsLoading(false);
                return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan-trip/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) throw new Error("API request failed");

            const data = await response.json();
            setTripData(data);

            toast("Trip planned successfully", {
                description: "Redirecting to results...",
            });
            router.push("/results");
        } catch (error) {
            console.log("API unavailable, using mock data");
            setTripData({} as any); // Replace with your mock
            toast("Using example data", {
                description: "Backend API not available, showing example trip",
            });
            router.push("/results");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl border-border/50">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-balance">
                    Plan Your Trip
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Enter your route details to generate an FMCSA-compliant
                    driving schedule
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ===== Current Location ===== */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-500/10 p-1.5 rounded">
                                <Navigation className="h-4 w-4 text-blue-500" />
                            </div>
                            <Label className="text-base font-semibold">
                                Current Location
                            </Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setMapOpenFor("current")}
                            >
                                <MapPin className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                step="any"
                                value={inputValues.current_location.lat}
                                onChange={(e) =>
                                    handleInputChange(
                                        "current_location",
                                        "lat",
                                        e.target.value
                                    )
                                }
                                placeholder="Lat"
                            />
                            <Input
                                type="number"
                                step="any"
                                value={inputValues.current_location.lng}
                                onChange={(e) =>
                                    handleInputChange(
                                        "current_location",
                                        "lng",
                                        e.target.value
                                    )
                                }
                                placeholder="Lng"
                            />
                        </div>
                    </div>

                    {/* ===== Pickup Location ===== */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-500/10 p-1.5 rounded">
                                <Package className="h-4 w-4 text-green-500" />
                            </div>
                            <Label className="text-base font-semibold">
                                Pickup Location
                            </Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setMapOpenFor("pickup")}
                            >
                                <MapPin className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                step="any"
                                value={inputValues.pickup_location.lat}
                                onChange={(e) =>
                                    handleInputChange(
                                        "pickup_location",
                                        "lat",
                                        e.target.value
                                    )
                                }
                                placeholder="Lat"
                            />
                            <Input
                                type="number"
                                step="any"
                                value={inputValues.pickup_location.lng}
                                onChange={(e) =>
                                    handleInputChange(
                                        "pickup_location",
                                        "lng",
                                        e.target.value
                                    )
                                }
                                placeholder="Lng"
                            />
                        </div>
                    </div>

                    {/* ===== Dropoff Location ===== */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-red-500/10 p-1.5 rounded">
                                <MapPin className="h-4 w-4 text-red-500" />
                            </div>
                            <Label className="text-base font-semibold">
                                Dropoff Location
                            </Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setMapOpenFor("dropoff")}
                            >
                                <MapPin className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                step="any"
                                value={inputValues.dropoff_location.lat}
                                onChange={(e) =>
                                    handleInputChange(
                                        "dropoff_location",
                                        "lat",
                                        e.target.value
                                    )
                                }
                                placeholder="Lat"
                            />
                            <Input
                                type="number"
                                step="any"
                                value={inputValues.dropoff_location.lng}
                                onChange={(e) =>
                                    handleInputChange(
                                        "dropoff_location",
                                        "lng",
                                        e.target.value
                                    )
                                }
                                placeholder="Lng"
                            />
                        </div>
                    </div>

                    {/* ===== Cycle Hours ===== */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-500/10 p-1.5 rounded">
                                <Clock className="h-4 w-4 text-orange-500" />
                            </div>
                            <Label
                                htmlFor="cycle-hours"
                                className="text-base font-semibold"
                            >
                                Current Cycle Used Hours
                            </Label>
                        </div>
                        <Input
                            id="cycle-hours"
                            type="number"
                            step="0.1"
                            min={0}
                            max={70}
                            value={inputValues.current_cycle_used_hours}
                            onChange={(e) => handleCycleChange(e.target.value)}
                        />
                    </div>

                    {/* ===== Submit ===== */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 text-white bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                    Planning Trip...
                                </>
                            ) : (
                                <>
                                    <MapPin className="mr-2 h-4 w-4" /> Plan
                                    Trip
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* ===== Map Modal ===== */}
                {mapOpenFor && (
                    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                        <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-lg">
                                    Select {mapOpenFor} location
                                </h3>
                                <Button
                                    variant="ghost"
                                    onClick={() => setMapOpenFor(null)}
                                >
                                    Close
                                </Button>
                            </div>
                            <MapSelector
                                initialLatLng={
                                    formData[
                                        `${mapOpenFor}_location` as keyof TripFormData
                                    ] as TripLocation
                                }
                                onSelectLocation={(latLng) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        [`${mapOpenFor}_location`]: latLng,
                                    }));
                                    setInputValues((prev) => ({
                                        ...prev,
                                        [`${mapOpenFor}_location`]: {
                                            lat: String(latLng.lat),
                                            lng: String(latLng.lng),
                                        },
                                    }));
                                }}
                                onClose={() => setMapOpenFor(null)}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
