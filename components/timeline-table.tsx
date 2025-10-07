import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { ScheduleEntry } from "@/lib/types";
import { formatDateTime, calculateDuration } from "@/lib/utils/date-utils";

interface TimelineTableProps {
    schedule: ScheduleEntry[];
}

const STATUS_VARIANTS = {
    OffDuty: "default",
    Sleeper: "secondary",
    Driving: "default",
    OnDutyNotDriving: "default",
} as const;

const STATUS_COLORS = {
    OffDuty: "bg-green-500/10 text-green-500 border-green-500/20",
    Sleeper: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Driving: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    OnDutyNotDriving: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export function TimelineTable({ schedule }: TimelineTableProps) {
    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">
                            Start Time
                        </TableHead>
                        <TableHead className="font-semibold">
                            End Time
                        </TableHead>
                        <TableHead className="font-semibold">
                            Duration
                        </TableHead>
                        <TableHead className="font-semibold">Note</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedule.map((entry, index) => (
                        <TableRow
                            key={index}
                            className="hover:bg-muted/30 transition-colors"
                        >
                            <TableCell>
                                <Badge
                                    variant={STATUS_VARIANTS[entry.status]}
                                    className={STATUS_COLORS[entry.status]}
                                >
                                    {entry.status
                                        .replace(/([A-Z])/g, " $1")
                                        .trim()}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {formatDateTime(entry.start)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {formatDateTime(entry.end)}
                            </TableCell>
                            <TableCell className="font-medium">
                                {calculateDuration(entry.start, entry.end)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {entry.note}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
