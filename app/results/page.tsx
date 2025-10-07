"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Map, FileText, Clock, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTripStore } from "@/lib/store";
import { MapView } from "@/components/_map-view";
import { LogRenderer } from "@/components/log-renderer";
import { TimelineTable } from "@/components/timeline-table";
import { SummaryCard } from "@/components/summary-card";
import { PDFExportButton } from "@/components/pdf-export-button";
import { groupScheduleByDay } from "@/lib/utils/date-utils";
import { exportLogsToPDF } from "@/lib/utils/pdf-export";

export default function ResultsPage() {
    const router = useRouter();
    const tripData = useTripStore((state) => state.tripData);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!tripData) {
            router.push("/");
        }
    }, [tripData, router]);

    if (!mounted || !tripData) {
        return (
            <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <p className="text-muted-foreground">
                        Loading trip data...
                    </p>
                </div>
            </div>
        );
    }

    const groupedSchedule = groupScheduleByDay(tripData.schedule.schedule);

    const handleExportPDF = async () => {
        let previousTotalMiles = 0;

        const logData = Array.from(groupedSchedule.entries()).map(
            ([date, entries]) => {
                // Format date as DD/MM/YYYY
                const formattedDate = new Date(date).toLocaleDateString(
                    "fr-FR"
                );

                // Calculate total miles for this day
                const dayTotalMiles =
                    entries.length > 0
                        ? entries[entries.length - 1].miles_since_start -
                          previousTotalMiles
                        : 0;

                // Update previous total for next iteration
                previousTotalMiles += dayTotalMiles;

                return {
                    date: formattedDate,
                    totalMiles: dayTotalMiles,
                    entries,
                };
            }
        );

        await exportLogsToPDF(
            "eld-logs-container",
            "trip-eld-logs.pdf",
            logData
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8 space-y-6"
        >
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Trip Results
                </h1>
                <p className="text-muted-foreground">
                    Your FMCSA-compliant route and schedule
                </p>
            </div>

            {/* Summary Cards */}
            <SummaryCard tripData={tripData} />

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Map */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <Map className="h-5 w-5 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Route Map
                        </h2>
                    </div>
                    <MapView tripData={tripData} />
                </motion.div>

                {/* Right Column - Tabs */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-4"
                >
                    <Tabs defaultValue="timeline" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                            <TabsTrigger
                                value="timeline"
                                className="flex items-center gap-2"
                            >
                                <Clock className="h-4 w-4" />
                                Timeline
                            </TabsTrigger>
                            <TabsTrigger
                                value="logs"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Daily Logs
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="timeline"
                            className="space-y-4 mt-4"
                        >
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-500/10 p-2 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    Schedule Timeline
                                </h2>
                            </div>

                            <Alert className="bg-blue-500/10 border-blue-500/20">
                                <AlertCircle className="h-4 w-4 text-blue-500" />
                                <AlertDescription className="text-sm text-foreground">
                                    All times are in UTC. Schedule is
                                    FMCSA-compliant with required rest periods.
                                </AlertDescription>
                            </Alert>

                            <TimelineTable
                                schedule={tripData.schedule.schedule}
                            />
                        </TabsContent>

                        <TabsContent value="logs" className="space-y-6 mt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-500/10 p-2 rounded-lg">
                                        <FileText className="h-5 w-5 text-green-500" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-foreground">
                                        ELD Logs
                                    </h2>
                                </div>
                                <PDFExportButton onExport={handleExportPDF} />
                            </div>

                            <Alert className="bg-blue-500/10 border-blue-500/20">
                                <AlertCircle className="h-4 w-4 text-blue-500" />
                                <AlertDescription className="text-sm text-foreground">
                                    Electronic Logging Device (ELD) format
                                    showing Hours-of-Service by day.
                                </AlertDescription>
                            </Alert>

                            <div id="eld-logs-container" className="space-y-6">
                                {Array.from(groupedSchedule.entries()).map(
                                    ([date, entries]) => (
                                        <LogRenderer
                                            key={date}
                                            entries={entries}
                                            date={date}
                                        />
                                    )
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </motion.div>
    );
}
