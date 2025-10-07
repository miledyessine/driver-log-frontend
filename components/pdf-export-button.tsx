"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PDFExportButtonProps {
    onExport: () => Promise<void>;
}

export function PDFExportButton({ onExport }: PDFExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await onExport();
            toast("PDF exported successfully", {
                description: "Your ELD logs have been downloaded",
            });
        } catch (error) {
            toast("Export failed", {
                description: "There was an error exporting your logs",
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            className="gap-2 bg-transparent"
        >
            {isExporting ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                </>
            ) : (
                <>
                    <Download className="h-4 w-4" />
                    Download as PDF
                </>
            )}
        </Button>
    );
}
