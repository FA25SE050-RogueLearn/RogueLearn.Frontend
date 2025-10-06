'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Import the newly created step components
import { Step1_RouteSelection } from '@/components/character-creation/Step1_RouteSelection';
import { Step2_ClassSelection } from '@/components/character-creation/Step2_ClassSelection';
import { Step3_SpecializationSelection } from '@/components/character-creation/Step3_SpecializationSelection';
import { Step4_Confirmation } from '@/components/character-creation/Step4_Confirmation';

export default function CharacterCreationPage() {
    const [step, setStep] = useState(1);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

    const progress = (step / 4) * 100;

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const canProceed = () => {
        if (step === 1) return selectedRoute !== null;
        if (step === 2) return selectedClass !== null;
        if (step === 3) return selectedSpecialization !== null;
        return true;
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1_RouteSelection selectedRoute={selectedRoute} setSelectedRoute={setSelectedRoute} />;
            case 2:
                return <Step2_ClassSelection selectedClass={selectedClass} setSelectedClass={setSelectedClass} />;
            case 3:
                return <Step3_SpecializationSelection selectedSpecialization={selectedSpecialization} setSelectedSpecialization={setSelectedSpecialization} selectedRoute={selectedRoute} selectedClass={selectedClass} />;
            case 4:
                return <Step4_Confirmation selectedRoute={selectedRoute} selectedClass={selectedClass} selectedSpecialization={selectedSpecialization} setStep={setStep} />;
            default:
                return <Step1_RouteSelection selectedRoute={selectedRoute} setSelectedRoute={setSelectedRoute} />;
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 flex items-center justify-center">
            <Card className="w-full max-w-4xl bg-card/50">
                <CardHeader className="border-b border-border/50">
                    <div className="flex justify-between items-center mb-4">
                        <CardTitle className="font-heading text-2xl">
                            RogueLearn Character Creation
                        </CardTitle>
                        <span className="text-sm font-body text-foreground/70">
                            Step {step}/4
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-body">
                            <span>Progress {progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </CardHeader>

                <CardContent className="p-8">
                    {renderStep()}

                    {/* Navigation for steps 1-3 */}
                    {step < 4 && (
                        <div className={`flex ${step === 1 ? 'justify-end' : 'justify-between'} pt-6 border-t border-border/50 mt-6`}>
                            {step > 1 && (
                                <Button variant="outline" onClick={handleBack}>
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}
                            <Button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="bg-accent text-accent-foreground hover:bg-accent/90"
                            >
                                Continue <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
