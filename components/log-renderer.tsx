"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import type { ScheduleEntry } from "@/lib/types";

interface LogRendererProps {
    entries: ScheduleEntry[];
    date: string;
}

const WIDTH = 900;
const HEIGHT = 280;
const PADDING = 50;

const STATUS_ORDER = ["OffDuty", "Sleeper", "Driving", "OnDutyNotDriving"];

const STATUS_COLORS: Record<string, string> = {
    OffDuty: "#22c55e",
    Sleeper: "#a855f7",
    Driving: "#3b82f6",
    OnDutyNotDriving: "#f59e0b",
};

const STATUS_LABELS: Record<string, string> = {
    OffDuty: "Off Duty",
    Sleeper: "Sleeper",
    Driving: "Driving",
    OnDutyNotDriving: "On Duty",
};

export function LogRenderer({ entries, date }: LogRendererProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoveredNote, setHoveredNote] = useState<{
        x: number;
        y: number;
        note: string;
    } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, "#fafafa");
        gradient.addColorStop(1, "#ffffff");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        drawGrid(ctx);
        drawDutyPath(ctx, entries);
        drawLabels(ctx, date);
        drawNoteMarkers(ctx, entries);
    }, [entries, date]);

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        const noOfHorizontalGrids = STATUS_ORDER.length;
        const noOfVerticalGrids = 24;

        const horizontalGridOffset =
            (HEIGHT - 2 * PADDING) / noOfHorizontalGrids;
        const verticalGridOffset = (WIDTH - 2 * PADDING) / noOfVerticalGrids;

        ctx.beginPath();
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;

        // Horizontal lines
        for (let i = 0; i <= noOfHorizontalGrids; i++) {
            const y = PADDING + i * horizontalGridOffset;
            ctx.moveTo(PADDING, y);
            ctx.lineTo(WIDTH - PADDING, y);
        }

        // Vertical lines (hour lines)
        for (let i = 0; i <= noOfVerticalGrids; i++) {
            const x = PADDING + i * verticalGridOffset;
            ctx.moveTo(x, PADDING);
            ctx.lineTo(x, HEIGHT - PADDING);

            if (i % 6 === 0) {
                ctx.strokeStyle = "#d1d5db";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = "#e5e7eb";
                ctx.lineWidth = 1;
                ctx.moveTo(x, PADDING);
                ctx.lineTo(x, HEIGHT - PADDING);
            }
        }

        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "#6b7280";
        ctx.font = "12px system-ui, sans-serif";
        ctx.textAlign = "center";
        for (let i = 0; i <= 24; i++) {
            const x = PADDING + i * verticalGridOffset;
            const label =
                i === 0
                    ? "12 AM"
                    : i === 12
                    ? "12 PM"
                    : i < 12
                    ? `${i}`
                    : `${i - 12}`;
            ctx.fillText(label, x, HEIGHT - PADDING + 18);
        }

        ctx.textAlign = "right";
        STATUS_ORDER.forEach((status, i) => {
            const y = PADDING + (i + 0.5) * horizontalGridOffset;

            // Draw color indicator circle
            ctx.fillStyle = STATUS_COLORS[status];
            ctx.beginPath();
            ctx.arc(PADDING - 20, y, 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw label
            ctx.fillStyle = "#374151";
            ctx.font = "13px system-ui, sans-serif";
            ctx.fillText(STATUS_LABELS[status], PADDING - 3, y + 14);
        });
    };

    const drawDutyPath = (
        ctx: CanvasRenderingContext2D,
        entries: ScheduleEntry[]
    ) => {
        if (!entries.length) return;

        const noOfHorizontalGrids = STATUS_ORDER.length;
        const noOfVerticalGrids = 24;
        const horizontalGridOffset =
            (HEIGHT - 2 * PADDING) / noOfHorizontalGrids;
        const verticalGridOffset = (WIDTH - 2 * PADDING) / noOfVerticalGrids;

        const midnight = new Date(entries[0].start);
        midnight.setHours(0, 0, 0, 0);

        const getX = (date: Date) => {
            const diffHrs = (date.getTime() - midnight.getTime()) / 3600000;
            const x = PADDING + diffHrs * verticalGridOffset;
            // Clamp to canvas bounds
            return Math.max(PADDING, Math.min(x, WIDTH - PADDING));
        };

        const getY = (status: string) => {
            const idx = STATUS_ORDER.indexOf(status);
            return PADDING + (idx + 0.5) * horizontalGridOffset;
        };

        const maxTime = midnight.getTime() + 24 * 3600000; // 24 hours after midnight

        entries.forEach((entry) => {
            const startTime = new Date(entry.start).getTime();
            const endTime = new Date(entry.end).getTime();

            // Skip entries that start after the 24-hour window
            if (startTime >= maxTime) return;

            // Clip the end time to the 24-hour window
            const clippedEndTime = Math.min(endTime, maxTime);

            const x1 = getX(new Date(startTime));
            const x2 = getX(new Date(clippedEndTime));
            const y = getY(entry.status);

            // Only draw if there's a visible segment
            if (x2 > x1) {
                // Draw shadow
                ctx.beginPath();
                ctx.moveTo(x1, y + 2);
                ctx.lineTo(x2, y + 2);
                ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.closePath();

                // Draw main line
                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.strokeStyle = STATUS_COLORS[entry.status] || "#000";
                ctx.lineWidth = 4;
                ctx.lineCap = "round";
                ctx.stroke();
                ctx.closePath();

                if (endTime > maxTime) {
                    // Draw arrow indicator at the end
                    ctx.fillStyle = STATUS_COLORS[entry.status];
                    ctx.beginPath();
                    ctx.moveTo(x2, y);
                    ctx.lineTo(x2 - 8, y - 5);
                    ctx.lineTo(x2 - 8, y + 5);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            const next = entries[entries.indexOf(entry) + 1];
            if (next && new Date(next.start).getTime() < maxTime) {
                const nextY = getY(next.status);
                ctx.beginPath();
                ctx.moveTo(x2, y);
                ctx.lineTo(x2, nextY);
                ctx.strokeStyle = "#9ca3af";
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.closePath();
            }
        });
    };

    const drawNoteMarkers = (
        ctx: CanvasRenderingContext2D,
        entries: ScheduleEntry[]
    ) => {
        if (!entries.length) return;

        const noOfHorizontalGrids = STATUS_ORDER.length;
        const noOfVerticalGrids = 24;
        const horizontalGridOffset =
            (HEIGHT - 2 * PADDING) / noOfHorizontalGrids;
        const verticalGridOffset = (WIDTH - 2 * PADDING) / noOfVerticalGrids;

        const midnight = new Date(entries[0].start);
        midnight.setHours(0, 0, 0, 0);

        const getX = (date: Date) => {
            const diffHrs = (date.getTime() - midnight.getTime()) / 3600000;
            const x = PADDING + diffHrs * verticalGridOffset;
            return Math.max(PADDING, Math.min(x, WIDTH - PADDING));
        };

        const getY = (status: string) => {
            const idx = STATUS_ORDER.indexOf(status);
            return PADDING + (idx + 0.5) * horizontalGridOffset;
        };

        const maxTime = midnight.getTime() + 24 * 3600000;

        entries.forEach((entry, index) => {
            const startTime = new Date(entry.start).getTime();

            // Skip entries that start after the 24-hour window
            if (startTime >= maxTime) return;

            const prevEntry = index > 0 ? entries[index - 1] : null;
            const statusChanged =
                !prevEntry || prevEntry.status !== entry.status;

            if (entry.note && entry.note.trim() && statusChanged) {
                const x = getX(new Date(entry.start));
                const y = getY(entry.status);

                // Draw note indicator circle
                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = STATUS_COLORS[entry.status];
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // Draw inner dot
                ctx.fillStyle = STATUS_COLORS[entry.status];
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            }
        });
    };

    const drawLabels = (ctx: CanvasRenderingContext2D, date: string) => {
        ctx.fillStyle = "#111827";
        ctx.font = "bold 16px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`Driver Log - ${date}`, PADDING, 30);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        const noOfHorizontalGrids = STATUS_ORDER.length;
        const noOfVerticalGrids = 24;
        const horizontalGridOffset =
            (HEIGHT - 2 * PADDING) / noOfHorizontalGrids;
        const verticalGridOffset = (WIDTH - 2 * PADDING) / noOfVerticalGrids;

        const midnight = new Date(entries[0]?.start || new Date());
        midnight.setHours(0, 0, 0, 0);

        const getX = (date: Date) => {
            const diffHrs = (date.getTime() - midnight.getTime()) / 3600000;
            const x = PADDING + diffHrs * verticalGridOffset;
            return Math.max(PADDING, Math.min(x, WIDTH - PADDING));
        };

        const getY = (status: string) => {
            const idx = STATUS_ORDER.indexOf(status);
            return PADDING + (idx + 0.5) * horizontalGridOffset;
        };

        const maxTime = midnight.getTime() + 24 * 3600000;

        let foundNote = null;
        for (let index = 0; index < entries.length; index++) {
            const entry = entries[index];
            const startTime = new Date(entry.start).getTime();

            // Skip entries that start after the 24-hour window
            if (startTime >= maxTime) continue;

            const prevEntry = index > 0 ? entries[index - 1] : null;
            const statusChanged =
                !prevEntry || prevEntry.status !== entry.status;

            if (entry.note && entry.note.trim() && statusChanged) {
                const x = getX(new Date(entry.start));
                const y = getY(entry.status);
                const distance = Math.sqrt(
                    (mouseX - x) ** 2 + (mouseY - y) ** 2
                );

                if (distance < 10) {
                    foundNote = {
                        x: e.clientX,
                        y: e.clientY,
                        note: entry.note,
                    };
                    break;
                }
            }
        }

        setHoveredNote(foundNote);
    };

    const handleMouseLeave = () => {
        setHoveredNote(null);
    };

    // Compute total hours per status
    const totals = STATUS_ORDER.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
    }, {} as Record<string, number>);

    entries.forEach((entry) => {
        const start = new Date(entry.start);
        const end = new Date(entry.end);
        const hours = (end.getTime() - start.getTime()) / 3600000;
        totals[entry.status] += hours;
    });

    return (
        <div className="bg-white border border-border rounded-lg p-6 space-y-4 shadow-sm">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    className="w-full h-auto border border-gray-200 rounded cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />

                {hoveredNote && (
                    <div
                        className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs pointer-events-none"
                        style={{
                            left: hoveredNote.x + 10,
                            top: hoveredNote.y + 10,
                        }}
                    >
                        {hoveredNote.note}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {STATUS_ORDER.map((status) => (
                    <div
                        key={status}
                        className="border-2 rounded-lg p-4 text-center transition-all hover:shadow-md"
                        style={{
                            borderColor: STATUS_COLORS[status],
                            backgroundColor: `${STATUS_COLORS[status]}10`,
                        }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                    backgroundColor: STATUS_COLORS[status],
                                }}
                            />
                            <p className="text-sm font-semibold text-gray-700">
                                {STATUS_LABELS[status]}
                            </p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {(() => {
                                const hrs = Math.floor(totals[status]);
                                const mins = Math.round(
                                    (totals[status] - hrs) * 60
                                );
                                return `${hrs
                                    .toString()
                                    .padStart(2, "0")}:${mins
                                    .toString()
                                    .padStart(2, "0")}`;
                            })()}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white" />
                    <span>Hover over markers to view notes</span>
                </div>
            </div>
        </div>
    );
}
