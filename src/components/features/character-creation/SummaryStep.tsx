// roguelearn-web/src/components/features/character-creation/SummaryStep.tsx
import { AcademicRoute, CareerClass } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

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
 */
export function SummaryStep({ selectedRoute, selectedClass, onSubmit, onBack, isSubmitting, error }: SummaryStepProps) {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
                <Sparkles className="mx-auto h-12 w-12 text-accent" />
                <h1 className="mt-4 text-3xl font-bold font-heading text-white">Confirm Your Path</h1>
                <p className="mt-2 text-foreground/70 font-body max-w-2xl mx-auto">
                    Your journey is about to begin. Review your choices and embark on your quest for knowledge.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-accent/30 bg-accent/10">
                    <CardHeader>
                        <CardTitle className="font-heading text-white">Chosen Route</CardTitle>
                        <CardDescription className="font-body text-accent/80">{selectedRoute.programName}</CardDescription>
                        <p className="text-sm text-foreground/70 pt-2">{selectedRoute.description}</p>
                    </CardHeader>
                </Card>
                <Card className="border-accent/30 bg-accent/10">
                    <CardHeader>
                        <CardTitle className="font-heading text-white">Selected Class</CardTitle>
                        <CardDescription className="font-body text-accent/80">{selectedClass.name}</CardDescription>
                        <p className="text-sm text-foreground/70 pt-2">{selectedClass.description}</p>
                    </CardHeader>
                </Card>
            </div>

            {error && (
                <div className="mt-6 text-red-400 text-sm font-body p-3 bg-red-900/50 rounded-md flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="mt-8 flex justify-between">
                <Button size="lg" variant="outline" onClick={onBack} disabled={isSubmitting}>
                    Back
                </Button>
                <Button size="lg" onClick={onSubmit} disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
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