// roguelearn-web/src/components/features/character-creation/CharacterCreationWizard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AcademicRoute, CareerClass } from "@/types/onboarding";
import { getRoutes, getClasses, completeOnboarding } from "@/services/onboardingService";
import { SelectRouteStep } from "./SelectRouteStep";
import { SelectClassStep } from "./SelectClassStep";
import { SummaryStep } from "./SummaryStep";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

type Step = "route" | "class" | "summary";

/**
 * A multi-step wizard component that guides the user through character creation.
 * It fetches necessary data, manages state across steps, and handles final submission.
 */
export function CharacterCreationWizard() {
    const router = useRouter();

    // State for the current step and user selections
    const [currentStep, setCurrentStep] = useState<Step>("route");
    const [selectedRoute, setSelectedRoute] = useState<AcademicRoute | null>(null);
    const [selectedClass, setSelectedClass] = useState<CareerClass | null>(null);

    // State for data fetching and submission
    const [routes, setRoutes] = useState<AcademicRoute[]>([]);
    const [classes, setClasses] = useState<CareerClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial data (routes and classes) when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [routesData, classesData] = await Promise.all([getRoutes(), getClasses()]);
                setRoutes(routesData);
                setClasses(classesData);
            } catch (err) {
                setError("Failed to load necessary data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleNext = () => {
        if (currentStep === "route" && selectedRoute) {
            setCurrentStep("class");
        } else if (currentStep === "class" && selectedClass) {
            setCurrentStep("summary");
        }
    };

    const handleBack = () => {
        if (currentStep === "summary") {
            setCurrentStep("class");
        } else if (currentStep === "class") {
            setCurrentStep("route");
        }
    };

    const handleSubmit = async () => {
        if (!selectedRoute || !selectedClass) {
            setError("Please make all selections before completing.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            // NOTE: The backend expects `curriculumVersionId`. For the MVP, we assume the `AcademicRoute.id`
            // maps directly to a `CurriculumVersionId`. This might need refinement if the mapping is more complex.
            await completeOnboarding(selectedRoute.id, selectedClass.id);
            // On success, redirect the user to their dashboard.
            router.push("/dashboard");
            router.refresh(); // Important to re-fetch server-side data on the dashboard
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    const progressValue = currentStep === "route" ? 33 : currentStep === "class" ? 66 : 100;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-accent" />
                <h2 className="text-2xl font-semibold font-heading">Forging Your Path...</h2>
                <p className="text-foreground/70">Gathering ancient knowledge and career blueprints.</p>
            </div>
        );
    }

    return (
        <Card className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-[#241012]/92 via-[#13080e]/95 to-[#060307]/98 p-4 sm:p-8 shadow-[0_32px_110px_rgba(18,5,10,0.7)]">
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.38),_transparent_70%)]" />

            <CardContent className="relative z-10 p-0 sm:p-2">
                <Progress value={progressValue} className="mb-8 h-2 bg-white/10" />

                {currentStep === "route" && (
                    <SelectRouteStep
                        routes={routes}
                        selectedRoute={selectedRoute}
                        onSelectRoute={setSelectedRoute}
                        onNext={handleNext}
                    />
                )}
                {currentStep === "class" && (
                    <SelectClassStep
                        classes={classes}
                        selectedClass={selectedClass}
                        onSelectClass={setSelectedClass}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}
                {currentStep === "summary" && selectedRoute && selectedClass && (
                    <SummaryStep
                        selectedRoute={selectedRoute}
                        selectedClass={selectedClass}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                        error={error}
                    />
                )}
            </CardContent>
        </Card>
    );
}