// roguelearn-web/src/components/features/character-creation/SummaryStep.tsx
import { AcademicRoute, CareerClass } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface SummaryStepProps {
    selectedRoute: AcademicRoute;
    selectedClass: CareerClass;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
    error: string | null;
}

/**
 * The final step in character creation: reviewing choices and submitting.
 * Restyled to match the new design.
 */
export function SummaryStep({ selectedRoute, selectedClass, onSubmit, onBack, isSubmitting, error }: SummaryStepProps) {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="text-left mb-8">
                <h1 className="text-4xl font-bold font-heading text-white">Confirm Your Path</h1>
                <p className="mt-2 text-foreground/70 font-body max-w-2xl">
                    Your journey is about to begin. Review your choices and embark on your quest for knowledge.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-[28px] border-2 border-accent/30 bg-accent/10 p-6">
                    <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Chosen Route</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">{selectedRoute.programName}</h3>
                    <p className="mt-2 text-sm text-foreground/70 line-clamp-4">{selectedRoute.description}</p>
                </div>
                <div className="rounded-[28px] border-2 border-accent/30 bg-accent/10 p-6">
                    <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Selected Class</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">{selectedClass.name}</h3>
                    <p className="mt-2 text-sm text-foreground/70 line-clamp-4">{selectedClass.description}</p>
                </div>
            </div>

            {error && (
                <div className="mt-8 text-red-400 text-sm font-body p-4 bg-red-900/50 rounded-2xl flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="mt-12 flex justify-between">
                <Button size="lg" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-12 rounded-full px-8 text-xs uppercase tracking-[0.4em]">
                    Back
                </Button>
                <Button size="lg" onClick={onSubmit} disabled={isSubmitting} className="h-12 rounded-full bg-accent px-8 text-xs uppercase tracking-[0.4em] text-accent-foreground hover:bg-accent/90">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Finalizing...
                        </>
                    ) : (
                        "Begin Journey"
                    )}
                </Button>
            </div>
        </div>
    );
}