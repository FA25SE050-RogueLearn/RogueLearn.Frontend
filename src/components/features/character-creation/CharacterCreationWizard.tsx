// roguelearn-web/src/components/features/character-creation/CharacterCreationWizard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AcademicRoute, CareerClass } from "@/types/onboarding";
import { getRoutes, getClasses, completeOnboarding } from "@/services/onboardingService";
import { SelectRouteStep } from "./SelectRouteStep";
import { SelectClassStep } from "./SelectClassStep";
import { SummaryStep } from "./SummaryStep";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

// MODIFIED: Renamed prop for better clarity.
interface CharacterCreationWizardProps {
  onOnboardingComplete: () => void;
}

type Step = "route" | "class" | "summary";

export function CharacterCreationWizard({ onOnboardingComplete }: CharacterCreationWizardProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>("route");
  const [selectedRoute, setSelectedRoute] = useState<AcademicRoute | null>(null);
  const [selectedClass, setSelectedClass] = useState<CareerClass | null>(null);

  const [routes, setRoutes] = useState<AcademicRoute[]>([]);
  const [classes, setClasses] = useState<CareerClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await completeOnboarding(selectedRoute.id, selectedClass.id);
      
      // MODIFIED: Call the handler passed from the parent to update state and close the dialog.
      onOnboardingComplete();

      // The router push and refresh will still happen as the dialog closes.
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const stepNumber = currentStep === "route" ? 1 : currentStep === "class" ? 2 : 3;
  const progressValue = (stepNumber / 3) * 100;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <h2 className="text-2xl font-semibold font-heading text-white">Forging Your Path...</h2>
        <p className="text-foreground/70">Gathering ancient knowledge and career blueprints.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">RogueLearn Character Creation</p>
        <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">Step {stepNumber} / 3</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
            <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Progress</p>
            <p className="text-sm font-semibold text-white">{Math.round(progressValue)}%</p>
        </div>
        <Progress value={progressValue} className="h-2 bg-white/10" />
      </div>
      
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
    </div>
  );
}