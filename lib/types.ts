export interface TripLocation {
    lat: number;
    lng: number;
}

export interface TripFormData {
    current_location: TripLocation;
    pickup_location: TripLocation;
    dropoff_location: TripLocation;
    current_cycle_used_hours: number;
}

export interface ScheduleEntry {
    status: "OnDutyNotDriving" | "Driving" | "OffDuty" | "Sleeper";
    start: string;
    end: string;
    note: string;
    miles_since_start: number;
}

export interface TripSchedule {
    total_miles: number;
    schedule: ScheduleEntry[];
    estimated_drive_hours: number;
}

export interface RouteGeometry {
    type: string;
    coordinates: [number, number][];
}

export interface RouteFeature {
    geometry: RouteGeometry;
}

export interface TripRoute {
    features: RouteFeature[];
}

export interface TripSummary {
    distance_km: number;
    duration_hr: number;
}

export interface TripResponse {
    summary: TripSummary;
    route: TripRoute;
    schedule: TripSchedule;
    estimated_drive_hours: number;
}
