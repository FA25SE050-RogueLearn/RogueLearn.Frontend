// roguelearn-web/src/components/quests/QuestDetailView.tsx
// ⭐ FIXED: Proper unlock logic using step IDs

'use client';

import { QuestStep, QuestDetails } from '@/types/quest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Play } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuestDetailViewProps {
  questDetails: QuestDetails;
  questProgress: {
    questId: string;
    questStatus: 'NotStarted' | 'InProgress' | 'Completed';
    stepStatuses: Record<string, 'Completed' | 'InProgress' | 'NotStarted'>;
  };
  learningPathId: string;
  learningPathName: string;
  chapterId: string;
  chapterName: string;
}

export default function QuestDetailView({
  questDetails,
  questProgress,
  learningPathId,
  learningPathName,
  chapterId,
  chapterName,
}: QuestDetailViewProps) {
  // ⭐ KEY: Build a map of stepId → stepNumber for reference
  const stepIdToNumberMap = new Map<string, number>();
  questDetails.steps.forEach(step => {
    stepIdToNumberMap.set(step.id, step.stepNumber);
  });

  console.log('Step ID to Number Map:', stepIdToNumberMap);
  console.log('Step Statuses from API:', questProgress.stepStatuses);

  // ⭐ CRITICAL: Find completed step numbers from the API response
  const completedStepNumbers = new Set<number>();
  Object.entries(questProgress.stepStatuses).forEach(([stepId, status]) => {
    if (status === 'Completed') {
      const stepNumber = stepIdToNumberMap.get(stepId);
      if (stepNumber !== undefined) {
        completedStepNumbers.add(stepNumber);
        console.log(`Found completed step: Step ${stepNumber} (ID: ${stepId})`);
      }
    }
  });

  // ⭐ Determine max completed step
  const maxCompletedStepNumber = completedStepNumbers.size > 0
    ? Math.max(...completedStepNumbers)
    : 0;

  console.log('Completed Step Numbers:', Array.from(completedStepNumbers));
  console.log('Max Completed Step:', maxCompletedStepNumber);

  // ⭐ Function to determine if a step is locked
  const isStepLocked = (stepNumber: number): boolean => {
    // Week 1 is always unlocked
    if (stepNumber === 1) return false;

    // Week is unlocked if previous week is completed
    return !completedStepNumbers.has(stepNumber - 1);
  };

  // ⭐ Function to get button action based on step status
  const getStepButtonAction = (step: QuestStep) => {
    const stepStatus = questProgress.stepStatuses[step.id];
    const locked = isStepLocked(step.stepNumber);

    if (locked) {
      return {
        text: 'Locked',
        disabled: true,
        href: null,
        icon: Lock,
      };
    }

    if (stepStatus === 'Completed') {
      return {
        text: 'Review',
        disabled: false,
        href: `/quests/${learningPathId}/${chapterId}/${questDetails.id}/week/${step.stepNumber}`,
        icon: CheckCircle,
      };
    }

    return {
      text: 'Continue',
      disabled: false,
      href: `/quests/${learningPathId}/${chapterId}/${questDetails.id}/week/${step.stepNumber}`,
      icon: Play,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-amber-100 mb-2">
          {questDetails.title}
        </h1>
        <p className="text-slate-300">
          {questDetails.description}
        </p>
      </div>

      {/* Progress Summary */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-amber-100">Quest Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Status:</span>
            <span className="font-semibold text-amber-300">{questProgress.questStatus}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Weeks Completed:</span>
            <span className="font-semibold text-amber-300">
              {completedStepNumbers.size}/{questDetails.steps.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Modules */}
      <div>
        <h2 className="text-2xl font-bold text-amber-100 mb-4">Weekly Learning Modules</h2>
        <div className="space-y-4">
          {questDetails.steps.map((step) => {
            const stepStatus = questProgress.stepStatuses[step.id];
            const locked = isStepLocked(step.stepNumber);
            const buttonAction = getStepButtonAction(step);
            const Icon = buttonAction.icon;

            return (
              <Card
                key={step.id}
                className={cn(
                  'transition-all',
                  locked
                    ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
                    : stepStatus === 'Completed'
                      ? 'bg-green-950/30 border-green-800/50'
                      : 'bg-amber-950/30 border-amber-700/50'
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-amber-100">
                          Week {step.stepNumber}: {step.title}
                        </h3>
                        {stepStatus === 'Completed' && (
                          <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                            Completed ✓
                          </span>
                        )}
                        {locked && (
                          <span className="px-2 py-1 text-xs bg-slate-600 text-white rounded">
                            Locked 🔒
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3">
                        {step.description || `Learning activities for Week ${step.stepNumber}`}
                      </p>
                      <div className="flex gap-4 text-sm text-slate-300">
                        <span>
                          📚 Activities: {step.content?.activities?.length || 0}
                        </span>
                        <span>
                          ⭐ {step.experiencePoints} XP
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      asChild={!buttonAction.disabled}
                      disabled={buttonAction.disabled}
                      className={cn(
                        'ml-4',
                        locked ? 'cursor-not-allowed' : ''
                      )}
                      variant={stepStatus === 'Completed' ? 'outline' : 'default'}
                    >
                      {buttonAction.href ? (
                        <Link href={buttonAction.href} className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {buttonAction.text}
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {buttonAction.text}
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}