"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, ArrowRight, BookOpen, Code, CheckCircle, PlayCircle, Trophy, Lightbulb, Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { LearningPath, QuestChapter, QuestDetails, QuestStep } from "@/types/quest";
import academicApi from "@/api/academicApi";

interface ModuleLearningViewProps {
  learningPath: LearningPath;
  chapter: QuestChapter;
  questDetails: QuestDetails;
}

export function ModuleLearningView({ learningPath, chapter, questDetails }: ModuleLearningViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState<Record<string, 'Completed' | 'Pending'>>(() => {
    const initialProgress: Record<string, 'Completed' | 'Pending'> = {};
    questDetails.objectives.forEach(step => {
      initialProgress[step.id] = step.status;
    });
    return initialProgress;
  });
  const [isCompleting, setIsCompleting] = useState<string | null>(null);

  const currentStep = questDetails.objectives[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < questDetails.objectives.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleCompleteStep = async (stepId: string) => {
    setIsCompleting(stepId);
    try {
      await academicApi.updateQuestStepProgress(questDetails.id, stepId, 'Completed');
      setStepProgress(prev => ({ ...prev, [stepId]: 'Completed' }));
      // Automatically move to the next step upon completion
      if (currentStepIndex < questDetails.objectives.length - 1) {
        setTimeout(() => {
          handleNextStep();
        }, 500);
      }
    } catch (error) {
      console.error("Failed to mark step as complete:", error);
      alert("There was an error saving your progress. Please try again.");
    } finally {
      setIsCompleting(null);
    }
  };

  if (!currentStep) {
    return <div>Step not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
            <Link href={`/quests/${learningPath.id}`} className="hover:text-accent">{learningPath.name}</Link>
            <span>/</span>
            <Link href={`/quests/${learningPath.id}/${chapter.id}`} className="hover:text-accent">{chapter.title}</Link>
          </div>
          <h1 className="text-4xl font-bold font-heading flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-accent" />
            {questDetails.title}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Step {currentStep.stepNumber}: {currentStep.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 leading-relaxed">{currentStep.description}</p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-8 border-t">
        <Button variant="outline" size="lg" onClick={handlePrevStep} disabled={currentStepIndex === 0}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous Step
        </Button>

        {stepProgress[currentStep.id] !== 'Completed' ? (
          <Button size="lg" className="bg-gradient-to-r from-accent to-accent/80 text-primary" onClick={() => handleCompleteStep(currentStep.id)} disabled={isCompleting === currentStep.id}>
            {isCompleting === currentStep.id ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            Mark as Complete
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle className="w-5 h-5" />
            Step Completed
          </div>
        )}

        <Button variant="outline" size="lg" onClick={handleNextStep} disabled={currentStepIndex === questDetails.objectives.length - 1}>
          Next Step
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
