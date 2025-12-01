"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AcademicRoute, CareerClass } from "@/types/onboarding";
import onboardingApi from "@/api/onboardingApi";
import profileApi from "@/api/profileApi";
import { RouteSelectionStep } from '@/components/features/character-creation/RouteSelectionStep';
import { SelectClassStep } from "./SelectClassStep";
import { SummaryStep } from "./SummaryStep";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

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
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [routesResult, classesResult] = await Promise.all([
          onboardingApi.getRoutes(),
          onboardingApi.getClasses()
        ]);

        if (routesResult.isSuccess && routesResult.data) {
          setRoutes(routesResult.data);
        } else {
          throw new Error("Failed to fetch academic routes.");
        }

        if (classesResult.isSuccess && classesResult.data) {
          setClasses(classesResult.data);
        } else {
          throw new Error("Failed to fetch career classes.");
        }

      } catch (err: any) {
        setError(err.message || "Failed to load necessary data. Please try again later.");
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
      // Step 1: Call the onboarding completion API
      await onboardingApi.completeOnboarding({
        curriculumProgramId: selectedRoute.id,
        careerRoadmapId: selectedClass.id
      });

      // Step 2: Verify by checking the user profile
      const profileResult = await profileApi.getMyProfile();

      if (profileResult.isSuccess && profileResult.data?.onboardingCompleted) {
        // ✅ Profile confirms onboarding is complete
        setIsCompleted(true);
        onOnboardingComplete();

        // Delay redirect to show success state briefly
        setTimeout(() => {
          router.push("/onboarding/connect-fap");
          router.refresh();
        }, 1500);
      } else {
        // ❌ Profile check failed - show error
        throw new Error("Failed to verify onboarding completion. Please try again.");
      }

    } catch (err: any) {
      const errorMessage = (err.response?.data?.message || err.message) ?? "An unexpected error occurred. Please try again.";
      setError(errorMessage);
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

  if (error && !isSubmitting && !isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center min-h-[50vh]">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-2xl font-semibold font-heading text-red-400">Failed to Load Data</h2>
        <p className="text-foreground/70">{error}</p>
      </div>
    );
  }

  // SUCCESS STATE - Show completion and prevent further interaction
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center min-h-[50vh]">
        <CheckCircle2 className="w-16 h-16 text-accent animate-pulse" />
        <h2 className="text-3xl font-semibold font-heading text-white">Path Forged Successfully!</h2>
        <p className="text-foreground/70 max-w-md">
          Your character has been created with Route: <span className="text-accent font-semibold">{selectedRoute?.programName}</span> and Class: <span className="text-accent font-semibold">{selectedClass?.name}</span>
        </p>
        <p className="text-foreground/50 text-sm">Redirecting to next step...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header Section - Fixed */}
      <div className="px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">RogueLearn Character Creation</p>
          <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">Step {stepNumber} / 3</p>
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Progress</p>
          <p className="text-sm font-semibold text-white">{Math.round(progressValue)}%</p>
        </div>
        <Progress value={progressValue} className="h-2 bg-white/10" />
      </div>

      {/* Content Section - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
        <div className="max-w-6xl mx-auto h-full">
          {currentStep === "route" && (
            <RouteSelectionStep
              routes={routes}
              selectedRoute={selectedRoute}
              onSelectRoute={setSelectedRoute}
              onNext={handleNext}
              isDisabled={false}
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
      </div>
    </div>
  );
}
