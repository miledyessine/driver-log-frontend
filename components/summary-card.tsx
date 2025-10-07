import { MapPin, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TripResponse } from "@/lib/types";
import { groupScheduleByDay } from "@/lib/utils/date-utils";

export function SummaryCard({ tripData }: { tripData: TripResponse }) {
    const totalDays = groupScheduleByDay(tripData.schedule.schedule).size;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
                <CardContent className="">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-3 rounded-lg">
                            <MapPin className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Distance
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {tripData.schedule.total_miles.toFixed(1)}{" "}
                                <span className="text-base font-normal">
                                    mi
                                </span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
                <CardContent className="">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500/10 p-3 rounded-lg">
                            <Clock className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Estimated Drive Time
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {(() => {
                                    const totalHours =
                                        tripData.schedule.estimated_drive_hours;
                                    const hrs = Math.floor(totalHours);
                                    const mins = Math.round(
                                        (totalHours - hrs) * 60
                                    );
                                    return `${hrs
                                        .toString()
                                        .padStart(2, "0")}h${mins
                                        .toString()
                                        .padStart(2, "0")}min`;
                                })()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
                <CardContent className="">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/10 p-3 rounded-lg">
                            <Calendar className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Days
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {totalDays}{" "}
                                <span className="text-base font-normal">
                                    {totalDays === 1 ? "day" : "days"}
                                </span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
