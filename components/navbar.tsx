"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            TripPlanner
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            FMCSA Compliant
                        </p>
                    </div>
                </Link>

                {pathname === "/results" && (
                    <Button asChild variant="outline" size="sm">
                        <Link href="/" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Plan New Trip
                        </Link>
                    </Button>
                )}
            </div>
        </nav>
    );
}
