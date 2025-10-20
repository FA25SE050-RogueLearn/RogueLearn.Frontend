// roguelearn-web/src/components/features/character-creation/SelectClassStep.tsx
import { CareerClass } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dna } from "lucide-react";

interface SelectClassStepProps {
    classes: CareerClass[];
    selectedClass: CareerClass | null;
    onSelectClass: (cls: CareerClass) => void;
    onNext: () => void;
    onBack: () => void;
}

/**
 * The second step in character creation: selecting a career class (specialization).
 */
export function SelectClassStep({ classes, selectedClass, onSelectClass, onNext, onBack }: SelectClassStepProps) {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
                <Dna className="mx-auto h-12 w-12 text-accent" />
                <h1 className="mt-4 text-3xl font-bold font-heading text-white">Select Your Class</h1>
                <p className="mt-2 text-foreground/70 font-body max-w-2xl mx-auto">
                    Your Class represents your career specialization. It will add supplementary quests to bridge the gap between academia and industry.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((cls) => (
                    <Card
                        key={cls.id}
                        onClick={() => onSelectClass(cls)}
                        className={cn(
                            "cursor-pointer transition-all duration-300 border-2",
                            selectedClass?.id === cls.id
                                ? "border-accent shadow-[0_0_20px_rgba(210,49,135,0.5)]"
                                : "border-white/10 hover:border-accent/50"
                        )}
                    >
                        <CardHeader>
                            <CardTitle className="font-heading text-white">{cls.name}</CardTitle>
                            <CardDescription className="font-body text-foreground/60">{cls.description || "No description available."}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <div className="mt-8 flex justify-between">
                <Button size="lg" variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button size="lg" onClick={onNext} disabled={!selectedClass} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Next: Summary
                </Button>
            </div>
        </div>
    );
}