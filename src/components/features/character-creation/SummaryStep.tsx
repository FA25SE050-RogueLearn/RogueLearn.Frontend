// roguelearn-web/src/components/features/character-creation/SummaryStep.tsx
import { AcademicRoute, CareerClass } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, BookMarked, Shield, CheckCircle2 } from "lucide-react";

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
        <div className="animate-in fade-in duration-500 h-full flex flex-col">
            <div className="text-left mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold font-heading text-white">Confirm Your Path</h1>
                <p className="mt-2 text-foreground/70 font-body text-sm">
                    Your journey is about to begin. Review your choices and embark on your quest for knowledge.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Chosen Route Card */}
                    <div className="group relative overflow-hidden rounded-2xl border-2 border-accent p-5 transition-all duration-300 shadow-[0_0_30px_rgba(210,49,135,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-80" />
                        <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BookMarked className="w-4 h-4 text-accent" />
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Chosen Route</p>
                                </div>
                                <CheckCircle2 className="w-4 h-4 text-accent" />
                            </div>
                            <div className="mt-3 flex-1">
                                <span className="inline-block px-2 py-0.5 bg-accent/15 text-accent text-[10px] font-bold rounded mb-2">
                                    {selectedRoute.programCode || 'Program'}
                                </span>
                                <h3 className="text-xl font-semibold text-white">{selectedRoute.programName}</h3>
                                <p className="mt-2 text-sm text-foreground/70 line-clamp-3">{selectedRoute.description}</p>
                            </div>
                        </div>
                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
                    </div>

                    {/* Selected Class Card */}
                    <div className="group relative overflow-hidden rounded-2xl border-2 border-accent p-5 transition-all duration-300 shadow-[0_0_30px_rgba(210,49,135,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-80" />
                        <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-accent" />
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Selected Class</p>
                                </div>
                                <CheckCircle2 className="w-4 h-4 text-accent" />
                            </div>
                            <div className="mt-3 flex-1">
                                <h3 className="text-xl font-semibold text-white">{selectedClass.name}</h3>
                                <p className="mt-2 text-sm text-foreground/70 line-clamp-3">{selectedClass.description}</p>
                            </div>
                        </div>
                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
                    </div>
                </div>

                {error && (
                    <div className="mt-6 text-red-400 text-sm font-body p-4 bg-red-900/30 border border-red-500/30 rounded-2xl flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}
            </div>

            <div className="pt-4 flex justify-between flex-shrink-0 border-t border-white/5">
                <Button size="lg" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-10 rounded-full px-6 text-xs uppercase tracking-[0.3em]">
                    Back
                </Button>
                <Button size="lg" onClick={onSubmit} disabled={isSubmitting} className="h-10 rounded-full bg-accent px-6 text-xs uppercase tracking-[0.3em] text-accent-foreground hover:bg-accent/90">
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