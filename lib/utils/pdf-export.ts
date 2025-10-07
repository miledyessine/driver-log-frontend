// utils/exportLogsToPDF.ts
import { jsPDF } from "jspdf";
import backgroundImage from "@/public/blank-paper-log.png";
import type { ScheduleEntry } from "@/lib/types";

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

export async function exportLogsToPDF(
    containerId: string,
    fileName: string,
    logData: { date: string; totalMiles: number; entries: ScheduleEntry[] }[]
) {
    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [WIDTH, HEIGHT + 80],
    });

    for (let i = 0; i < logData.length; i++) {
        const { date, totalMiles, entries } = logData[i];

        const canvas = document.createElement("canvas");
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        const ctx = canvas.getContext("2d")!;

        // Draw background image
        const img = new Image();
        img.src = backgroundImage.src;
        await new Promise<void>((resolve) => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
                resolve();
            };
        });

        // Draw duty path (no grid)
        drawDutyPath(ctx, entries);

        // Draw date & total miles text
        ctx.fillStyle = "#111";
        ctx.font = "bold 16px system-ui, sans-serif";
        const [day, month, year] = date.split("/");
        ctx.fillText(`${month}`, WIDTH - 570, 20);
        ctx.fillText(`${day}`, WIDTH - 500, 20);
        ctx.fillText(`${year}`, WIDTH - 440, 20);
        ctx.fillText(`${totalMiles.toFixed(2)}`, WIDTH - 750, 85);

        // Add main image to PDF
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, WIDTH, HEIGHT);

        //  Compute and print time summary
        const totals = computeTotals(entries);

        // ADJUST FROM HERE: starting position on the right of the image
        const summaryX = WIDTH - 80; // X coordinate to the right of canvas/PDF image
        let summaryY = 200; // starting Y coordinate for the first line
        const lineHeight = 22; // space between each line
        // ADJUST UNTIL HERE

        const summaryParts = STATUS_ORDER.map((status) => {
            const hrs = Math.floor(totals[status]);
            const mins = Math.round((totals[status] - hrs) * 60);
            return {
                label: STATUS_LABELS[status],
                text: `${hrs.toString().padStart(2, "0")}:${mins
                    .toString()
                    .padStart(2, "0")}`,
                color: STATUS_COLORS[status],
            };
        });

        pdf.setFontSize(16);
        for (const part of summaryParts) {
            pdf.setTextColor(part.color);
            pdf.text(`${part.text}`, summaryX, summaryY);
            summaryY += lineHeight; // move down for the next line
        }
        if (i < logData.length - 1) pdf.addPage();
    }

    pdf.save(fileName);
}

function drawDutyPath(ctx: CanvasRenderingContext2D, entries: ScheduleEntry[]) {
    if (!entries.length) return;

    const noOfHorizontalGrids = STATUS_ORDER.length;
    const noOfVerticalGrids = 24;

    // ADJUST FROM HERE: padding for the whole path
    const horizontalGridOffset = (HEIGHT - 4 * PADDING) / noOfHorizontalGrids;
    const verticalGridOffset = (WIDTH - 4 * PADDING) / noOfVerticalGrids;
    // ADJUST UNTIL HERE

    const midnight = new Date(entries[0].start);
    midnight.setHours(0, 0, 0, 0);
    const maxTime = midnight.getTime() + 24 * 3600000;

    const getX = (date: Date) => {
        const diffHrs = (date.getTime() - midnight.getTime()) / 3600000;
        // ADJUST FROM HERE: horizontal scaling
        const x = 45 + PADDING + diffHrs * verticalGridOffset;
        return Math.max(PADDING, Math.min(x, WIDTH - PADDING));
        // ADJUST UNTIL HERE
    };

    const getY = (status: string) => {
        const idx = STATUS_ORDER.indexOf(status);
        // ADJUST FROM HERE: vertical scaling & spacing
        return 140 + PADDING + (idx + 0.5) * horizontalGridOffset;
        // ADJUST UNTIL HERE
    };

    entries.forEach((entry) => {
        const startTime = new Date(entry.start).getTime();
        const endTime = new Date(entry.end).getTime();
        if (startTime >= maxTime) return;

        const clippedEndTime = Math.min(endTime, maxTime);
        const x1 = getX(new Date(startTime));
        const x2 = getX(new Date(clippedEndTime));
        const y = getY(entry.status);

        if (x2 > x1) {
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            // ADJUST FROM HERE: line style for duty path
            ctx.strokeStyle = STATUS_COLORS[entry.status] || "#000";
            ctx.lineWidth = 4; // <-- adjust thickness
            ctx.lineCap = "round"; // <-- adjust line caps
            // ADJUST UNTIL HERE
            ctx.stroke();
            ctx.closePath();
        }

        const next = entries[entries.indexOf(entry) + 1];
        if (next && new Date(next.start).getTime() < maxTime) {
            const nextY = getY(next.status);
            ctx.beginPath();
            ctx.moveTo(x2, y);
            ctx.lineTo(x2, nextY);
            ctx.strokeStyle = "#999";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.closePath();
        }
    });
}

function computeTotals(entries: ScheduleEntry[]) {
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

    return totals;
}
