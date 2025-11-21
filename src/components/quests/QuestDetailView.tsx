// roguelearn-web/src/components/quests/QuestDetailView.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, Play, BookOpen, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuestDetails, QuestStep } from "@/types/quest";
import WeekStepSelector from "./WeekStepSelector";

interface QuestDetailViewProps {
  questDetails: QuestDetails;
  learningPathId: string;
  learningPathName?: string;  // ⭐ ADD THIS
  chapterId: string;
  chapterName?: string;  // ⭐ ADD THIS
  completedSteps?: number[];
  currentStepNumber?: number;
}

export function QuestDetailView({
  questDetails,
  learningPathId,
  learningPathName,  // ⭐ ADD THIS
  chapterId,
  chapterName,  // ⭐ ADD THIS
  completedSteps = [],
  currentStepNumber = 1
}: QuestDetailViewProps) {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const [selectedStepNumber, setSelectedStepNumber] = useState(currentStepNumber);

  const steps = questDetails.steps || [];
  const completedWeeks = completedSteps.length;
  const totalWeeks = steps.length;
  const progressPercentage = totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          opacity: 0, y: -30, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "all"
        });
      }
      if (modulesRef.current) {
        const cards = modulesRef.current.querySelectorAll('.module-card');
        if (cards.length > 0) {
          gsap.from(cards, {
            opacity: 0, x: -30, duration: 0.5, stagger: 0.08, delay: 0.3, ease: "power2.out", clearProps: "all"
          });
        }
      }
    });
    return () => ctx.revert();
  }, [questDetails.id]);

  const getStepStatus = (stepNumber: number): 'completed' | 'current' | 'locked' | 'available' => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStepNumber) return 'current';
    if (stepNumber > currentStepNumber) return 'locked';
    return 'available';
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-8 pb-20 shadow-[0_32px_110px_rgba(18,5,10,0.7)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: 'url(/images/asfalt-dark.png)',
          backgroundSize: '350px 350px',
          backgroundRepeat: 'repeat'
        }}
      />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.25),_transparent_70%)]" />

      <div className="relative z-10 flex flex-col gap-10">
        <section ref={headerRef}>
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="space-y-4">
              <Link
                href={`/quests/${learningPathId}/${chapterId}`}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/60 transition-colors hover:text-[#f5c16c]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to {chapterName || 'Chapter'}
              </Link>
              <div className="text-xs uppercase tracking-[0.35em] text-white/60">
                {learningPathName || 'Learning Path'} <span className="text-white/40">/</span> {chapterName || 'Chapter'} <span className="text-white/40">/</span> Quest
              </div>
              <h1 className="text-4xl font-semibold text-white md:text-5xl">{questDetails.title}</h1>
              <p className="text-sm text-white/70 max-w-3xl">{questDetails.description}</p>
            </div>
          </div>

          {/* Quest Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/60 mb-2">
              <span>Quest Progress</span>
              <span className="font-semibold text-white">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#f5c16c] [&>div]:to-[#d4a855]"
            />
            <div className="mt-2 text-xs text-white/60">
              {completedWeeks} of {totalWeeks} weeks completed
            </div>
          </div>
        </section>

        {/* Main Content: Sidebar + Weekly Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Week Selector */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <WeekStepSelector
                steps={steps}
                currentStepNumber={selectedStepNumber}
                onStepSelect={setSelectedStepNumber}
                completedSteps={completedSteps}
              />
            </div>
          </div>

          {/* Main Content: Weekly Modules List */}
          <div className="lg:col-span-3">
            <div ref={modulesRef} className="space-y-4">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-[#f5c16c]" /> Weekly Learning Modules
              </h2>

              {steps.length === 0 ? (
                <Card className="rounded-[28px] border border-[#f5c16c]/20 bg-black/40">
                  <CardContent className="p-8 text-center">
                    <Loader2 className="h-8 w-8 text-[#f5c16c] animate-spin mx-auto mb-4" />
                    <p className="text-sm text-white/70">Generating weekly modules...</p>
                    <p className="text-xs text-white/50 mt-2">This may take a moment.</p>
                  </CardContent>
                </Card>
              ) : (
                steps.map((step) => {
                  const status = getStepStatus(step.stepNumber);
                  const isLocked = status === 'locked';
                  const isCompleted = status === 'completed';
                  const isCurrent = status === 'current';
                  const activityCount = step.content?.activities?.length || 0;

                  return (
                    <Card
                      key={step.id}
                      className={`module-card relative overflow-hidden rounded-[28px] border transition-all duration-300 ${isCompleted
                        ? 'border-emerald-400/40 bg-emerald-500/10 hover:border-emerald-400/60'
                        : isCurrent
                          ? 'border-[#f5c16c]/60 bg-[#f5c16c]/10 hover:border-[#f5c16c]/80 shadow-[0_18px_45px_rgba(245,193,108,0.25)]'
                          : isLocked
                            ? 'border-white/10 bg-black/20 opacity-60'
                            : 'border-[#f5c16c]/20 bg-black/40 hover:border-[#f5c16c]/40 hover:shadow-[0_18px_45px_rgba(245,193,108,0.25)]'
                        }`}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                        style={{
                          backgroundImage: 'url(/images/asfalt-dark.png)',
                          backgroundSize: '350px 350px',
                          backgroundRepeat: 'repeat'
                        }}
                      />

                      <CardContent className="relative z-10 p-6">
                        <div className="flex items-center justify-between gap-4">
                          {/* Week Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f5c16c]">
                                Week {step.stepNumber}
                              </span>
                              {isCompleted && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded">
                                  Completed
                                </span>
                              )}
                              {isCurrent && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-[#f5c16c]/20 text-[#f5c16c] rounded">
                                  Current
                                </span>
                              )}
                              {isLocked && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-white/10 text-white/50 rounded flex items-center gap-1">
                                  <Lock className="h-3 w-3" /> Locked
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg font-semibold text-white">
                              {step.title}
                            </h3>

                            <p className="text-sm text-white/60 line-clamp-2">
                              {step.description}
                            </p>

                            {/* Activity Count & XP */}
                            <div className="flex items-center gap-4 text-xs text-white/60 pt-2">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5" />
                                {activityCount} activities
                              </span>
                              <span className="text-[#f5c16c] font-semibold">
                                {step.experiencePoints} XP
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          {isLocked ? (
                            <Button
                              disabled
                              className="rounded-full px-5 w-40 bg-white/10 text-white/40 cursor-not-allowed"
                            >
                              <Lock className="mr-2 h-4 w-4" /> Locked
                            </Button>
                          ) : (
                            <Button
                              asChild
                              className="rounded-full px-5 w-40 bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                            >
                              <Link href={`/quests/${learningPathId}/${chapterId}/${questDetails.id}/week/${step.stepNumber}`}>
                                {isCompleted ? (
                                  <><CheckCircle className="mr-2 h-4 w-4" /> Review Week</>
                                ) : isCurrent ? (
                                  <><Play className="mr-2 h-4 w-4" /> Continue</>
                                ) : (
                                  <><Play className="mr-2 h-4 w-4" /> Start Week</>
                                )}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
