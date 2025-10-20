// roguelearn-web/src/components/features/character-creation/SelectRouteStep.tsx
import { AcademicRoute } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookMarked } from "lucide-react";

interface SelectRouteStepProps {
    routes: AcademicRoute[];
    selectedRoute: AcademicRoute | null;
    onSelectRoute: (route: AcademicRoute) => void;
    onNext: () => void;
}

/**
 * The first step in character creation: selecting an academic route (curriculum).
 */
export function SelectRouteStep({ routes, selectedRoute, onSelectRoute, onNext }: SelectRouteStepProps) {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
                <BookMarked className="mx-auto h-12 w-12 text-accent" />
                <h1 className="mt-4 text-3xl font-bold font-heading text-white">Choose Your Route</h1>
                <p className="mt-2 text-foreground/70 font-body max-w-2xl mx-auto">
                    Your Route defines your foundational questline, based on a formal academic curriculum. This is the core of your journey.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map((route) => (
                    <Card
                        key={route.id}
                        onClick={() => onSelectRoute(route)}
                        className={cn(
                            "cursor-pointer transition-all duration-300 border-2",
                            selectedRoute?.id === route.id
                                ? "border-accent shadow-[0_0_20px_rgba(210,49,135,0.5)]"
                                : "border-white/10 hover:border-accent/50"
                        )}
                    >
                        <CardHeader>
                            <CardTitle className="font-heading text-white">{route.programName}</CardTitle>
                            <CardDescription className="font-body text-foreground/60">{route.description || "No description available."}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <Button size="lg" onClick={onNext} disabled={!selectedRoute} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Next: Choose Class
                </Button>
            </div>
        </div>
    );
}