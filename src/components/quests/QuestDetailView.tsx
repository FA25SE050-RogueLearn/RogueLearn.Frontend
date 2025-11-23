// roguelearn-web/src/components/quests/QuestDetailView.tsx
'use client';

import { QuestStep, QuestDetails } from '@/types/quest';
import { Button } from '@/components/ui/button';
import { Lock, Play, Trophy } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import WeeklyProgressCard from './WeeklyProgressCard';

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
  // Build a map of stepId → stepNumber for reference
  const stepIdToNumberMap = new Map<string, number>();
  questDetails.steps.forEach(step => {
    stepIdToNumberMap.set(step.id, step.stepNumber);
  });

  // Find completed step numbers from the API response
  const completedStepNumbers = new Set<number>();
  Object.entries(questProgress.stepStatuses).forEach(([stepId, status]) => {
    if (status === 'Completed') {
      const stepNumber = stepIdToNumberMap.get(stepId);
      if (stepNumber !== undefined) {
        completedStepNumbers.add(stepNumber);
      }
    }
  });

  // Determine max completed step
  const maxCompletedStepNumber = completedStepNumbers.size > 0
    ? Math.max(...completedStepNumbers)
    : 0;

  // Function to determine if a step is locked
  const isStepLocked = (stepNumber: number): boolean => {
    if (stepNumber === 1) return false;
    return !completedStepNumbers.has(stepNumber - 1);
  };

  return (
    <div className="flex flex-col gap-8 pb-24">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/asfalt-dark.png)',
            backgroundSize: '350px 350px',
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.25),_transparent_70%)]" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/50">
            <span className="text-[#f5c16c]">Quest</span>
            <span className="text-white/30">/</span>
            <span className="text-white/70">{learningPathName}</span>
            <span className="text-white/30">/</span>
            <span className="text-white/70">{chapterName}</span>
          </div>

          <div>
            <h1 className="text-4xl font-semibold text-white mb-3">
              {questDetails.title}
            </h1>
            <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
              {questDetails.description}
            </p>
          </div>

          {/* Quest Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-5">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.35),_transparent_70%)]" />
              <div className="relative z-10 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Status</p>
                <p className="text-2xl font-semibold text-[#f5c16c]">{questProgress.questStatus}</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-5">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.35),_transparent_70%)]" />
              <div className="relative z-10 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Weeks Completed</p>
                <p className="text-2xl font-semibold text-white">
                  {completedStepNumbers.size} <span className="text-white/50">/ {questDetails.steps.length}</span>
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-5">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.35),_transparent_70%)]" />
              <div className="relative z-10 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Total XP Available</p>
                <p className="text-2xl font-semibold text-emerald-400">
                  {questDetails.steps.reduce((sum, step) => sum + (step.experiencePoints || 0), 0)} XP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Modules Section */}
      <div>
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-r from-[#f5c16c]/10 via-transparent to-transparent px-6 py-4">
          <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5c16c]/20 text-[#f5c16c] shadow-[0_0_20px_rgba(245,193,108,0.35)]">
              <Trophy className="h-5 w-5" />
            </div>
            Weekly Learning Modules
          </h2>
          <span className="text-xs uppercase tracking-[0.35em] text-white/60">
            {questDetails.steps.length} weeks
          </span>
        </div>

        <div className="space-y-4">
          {questDetails.steps.map((step) => {
            const stepStatus = questProgress.stepStatuses[step.id];
            const locked = isStepLocked(step.stepNumber);
            const completedActivities = stepStatus === 'Completed'
              ? (step.content?.activities?.length || 0)
              : 0;
            const totalActivities = step.content?.activities?.length || 0;

            return (
              <div
                key={step.id}
                className={cn(
                  'transition-all',
                  locked && 'opacity-60'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Progress bar */}
                  <div className="flex-1">
                    <WeeklyProgressCard
                      step={step}
                      completedActivities={
                        stepStatus === 'Completed'
                          ? Array.from({ length: totalActivities }, (_, i) => `${i}`)
                          : []
                      }
                      totalActivities={totalActivities}
                    />
                  </div>

                  {/* Action button */}
                  <Button
                    asChild={!locked}
                    disabled={locked}
                    size="sm"
                    className={cn(
                      'whitespace-nowrap shrink-0 h-12 px-6 rounded-full font-semibold transition-all duration-300',
                      locked
                        ? 'cursor-not-allowed opacity-50 bg-white/5 border border-white/10 text-white/40'
                        : stepStatus === 'Completed'
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black hover:shadow-lg hover:shadow-[#f5c16c]/50'
                    )}
                  >
                    {locked ? (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Locked
                      </span>
                    ) : (
                      <Link
                        href={`/quests/${learningPathId}/${chapterId}/${questDetails.id}/week/${step.stepNumber}`}
                        className="flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        {stepStatus === 'Completed' ? 'Review' : 'Continue'}
                      </Link>
                    )}
                  </Button>
                </div>

                {/* Locked message */}
                {locked && (
                  <p className="text-xs text-white/40 ml-4 mt-2 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Complete Week {step.stepNumber - 1} to unlock
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}