// roguelearn-web/src/components/quests/QuestlineView.tsx
"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  CheckCircle,
  Lock,
  Target,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { LearningPath, QuestChapter } from '@/types/quest';
// MODIFICATION: Import the usePageTransition hook to control navigation animations.
import { usePageTransition } from '@/components/layout/PageTransition';

interface QuestlineViewProps {
  learningPath: LearningPath;
}

export default function QuestlineView({ learningPath }: QuestlineViewProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  // MODIFICATION: Get the navigateTo function from our custom hook.
  const { navigateTo } = usePageTransition();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0, y: -20, duration: 0.5, ease: "power2.out"
        });
      }
      if (chaptersRef.current) {
        const cards = chaptersRef.current.querySelectorAll('.chapter-card');
        if (cards.length > 0) {
          gsap.from(cards, {
            opacity: 0,
            y: 30,
            duration: 0.5,
            stagger: 0.08,
            delay: 0.2,
            ease: "power2.out",
          });
        }
      }
    });
    return () => ctx.revert();
  }, [learningPath.id]);

  const completedChapters = learningPath.chapters.filter((chapter) => chapter.status === 'Completed').length;

  const currentChapter =
    learningPath.chapters.find(ch => ch.status === 'InProgress') ||
    learningPath.chapters.find(ch => ch.status === 'NotStarted') ||
    learningPath.chapters[learningPath.chapters.length - 1];

  // MODIFICATION: Use the completionPercentage from the learningPath prop.
  const progressPercentage = learningPath.completionPercentage || 0;

  return (
    <div className="flex flex-col gap-10">
      <header ref={headerRef} className="space-y-8">
        {/* MODIFICATION: The back link now uses navigateTo to trigger the transition. */}
        <button
          onClick={() => navigateTo("/dashboard")}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/60 transition-colors hover:text-[#f5c16c]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>

        <div className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-6 shadow-[0_20px_50px_rgba(12,3,9,0.6)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: 'url(/images/asfalt-dark.png)',
              backgroundSize: '350px 350px',
              backgroundRepeat: 'repeat'
            }}
          />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.25),_transparent_70%)]" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Questline Dossier</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{learningPath.name}</h1>
            <p className="mt-2 text-sm text-white/70">{learningPath.description}</p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-[#f5c16c]/20 bg-black/40 px-4 py-3">
                <span className="flex items-center gap-2 text-white/60">
                  <Target className="h-4 w-4 text-[#f5c16c]" /> Chapters Cleared
                </span>
                <span className="font-semibold text-white">{completedChapters}/{learningPath.chapters.length}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/60">
                <span>Path Completion</span>
                {/* MODIFICATION: Display the correctly formatted percentage. */}
                <span className="text-white">{progressPercentage.toFixed(0)}%</span>
              </div>
              {/* MODIFICATION: Bind the progress bar value to the state. */}
              <Progress value={progressPercentage} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#f5c16c] [&>div]:to-[#d4a855]" />
            </div>
          </div>
        </div>
      </header>

      <section ref={chaptersRef} className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">Chapters</h2>
        {learningPath.chapters.map((chapter) => {
          const isCompleted = chapter.status === 'Completed';
          const isCurrent = chapter.id === currentChapter?.id;
          const isLocked = chapter.status === 'NotStarted' && !isCurrent && (completedChapters < chapter.sequence);

          const questsInChapter = chapter.quests || [];
          const completedQuestsInChapter = questsInChapter.filter(q => q.status === 'Completed').length;
          const chapterProgress = questsInChapter.length > 0 ? (completedQuestsInChapter / questsInChapter.length) * 100 : 0;

          return (
            // MODIFICATION: The Link is replaced with a button that calls navigateTo.
            <button
              key={chapter.id}
              onClick={(e) => {
                if (isLocked) return;
                e.preventDefault();
                navigateTo(`/quests/${learningPath.id}/${chapter.id}`);
              }}
              className={`chapter-card group relative block w-full text-left transition ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <Card className={`relative overflow-hidden rounded-[28px] border transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_65px_rgba(245,193,108,0.25)] 
                    ${isCurrent ? 'border-[#f5c16c]/50 shadow-[0_0_35px_rgba(245,193,108,0.35)]' :
                  isCompleted ? 'border-emerald-400/30 bg-emerald-950/20' :
                    'border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506]'}`}>

                <div
                  className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                  style={{
                    backgroundImage: 'url(/images/asfalt-dark.png)',
                    backgroundSize: '350px 350px',
                    backgroundRepeat: 'repeat'
                  }}
                />
                {isCurrent && <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.3),_transparent_70%)]" />}

                <CardContent className="relative z-10 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <h3 className="text-xl font-semibold text-white">{chapter.title}</h3>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                        {questsInChapter.length} Quests
                      </p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_8px_20px_rgba(245,193,108,0.25)]
                                ${isCurrent ? 'border-[#f5c16c]/40 bg-[#f5c16c]/15 text-[#f5c16c]' :
                        isCompleted ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' :
                          'border-[#f5c16c]/20 bg-[#f5c16c]/5 text-white/70'}`}>
                      {isCompleted ? <CheckCircle className="h-7 w-7" />
                        : isLocked ? <Lock className="h-7 w-7" />
                          : <Sparkles className="h-7 w-7 animate-pulse" />}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={chapterProgress} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#f5c16c] [&>div]:to-[#d4a855]" />
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </section>
    </div>
  );
}