// roguelearn-web/src/components/features/character-creation/SelectClassStep.tsx
import { CareerClass } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface SelectClassStepProps {
    classes: CareerClass[];
    selectedClass: CareerClass | null;
    onSelectClass: (cls: CareerClass) => void;
    onNext: () => void;
    onBack: () => void;
}

// NOTE: Mock data for tags, as this is not yet in the API response.
const classTags: Record<string, string[]> = {
    "ASP.NET Core Roadmap": ["Backend", "C#", "Microservices"],
    "React Roadmap": ["Frontend", "TypeScript", "Web Apps"],
    "DevOps Roadmap": ["CI/CD", "Infrastructure", "Cloud"],
};

/**
 * The second step in character creation: selecting a career class (specialization).
 * Restyled to match the new design.
 */
export function SelectClassStep({ classes, selectedClass, onSelectClass, onNext, onBack }: SelectClassStepProps) {
    return (
        <div className="animate-in fade-in duration-500 h-full flex flex-col">
            <div className="text-left mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold font-heading text-white">Select Your Class</h1>
                <p className="mt-2 text-foreground/70 font-body text-sm">
                    Your Class represents your career specialization. It will add supplementary quests to bridge the gap between academia and industry.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls) => (
                        <div
                            key={cls.id}
                            onClick={() => onSelectClass(cls)}
                            className={cn(
                                "group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300",
                                selectedClass?.id === cls.id
                                    ? "border-accent shadow-[0_0_30px_rgba(210,49,135,0.5)]"
                                    : "border-white/10 hover:border-accent/50 hover:-translate-y-1"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-80 group-hover:opacity-100" />
                            <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Class Codex</p>
                                        {selectedClass?.id === cls.id && (
                                            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Selected</span>
                                        )}
                                    </div>
                                    <h3 className="mt-2 text-xl font-semibold text-white">{cls.name}</h3>
                                    <p className="mt-2 text-sm text-foreground/70 line-clamp-2">{cls.description || "A powerful specialization for the modern adventurer."}</p>
                                </div>
                                <div className="mt-3">
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {(classTags[cls.name] || []).map(tag => (
                                            <span key={tag} className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-0.5 text-[10px] text-amber-200">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="flex items-center text-xs font-semibold text-accent transition group-hover:translate-x-1">
                                        SELECT <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 flex justify-between flex-shrink-0 border-t border-white/5">
                <Button size="lg" variant="outline" onClick={onBack} className="h-10 rounded-full px-6 text-xs uppercase tracking-[0.3em]">
                    Back
                </Button>
                <Button size="lg" onClick={onNext} disabled={!selectedClass} className="h-10 rounded-full bg-accent px-6 text-xs uppercase tracking-[0.3em] text-accent-foreground hover:bg-accent/90">
                    Continue
                </Button>
            </div>
        </div>
    );
}