// roguelearn-web/src/components/quests/QuestlineView.tsx
"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Lock,
  Map,
  ArrowLeft
} from 'lucide-react';
import { LearningPath, QuestChapter, QuestSummary } from '@/types/quest';
import { usePageTransition } from '@/components/layout/PageTransition';
import QuestCard from '@/components/quests/QuestCard';

interface QuestlineViewProps {
  learningPath: LearningPath;
}

export default function QuestlineView({ learningPath }: QuestlineViewProps) {
  const { navigateTo } = usePageTransition();

  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0, y: -20, duration: 0.6, ease: "power2.out"
        });
      }

      if (timelineRef.current) {
        const chapters = timelineRef.current.querySelectorAll('.chapter-section');
        if (chapters.length > 0) { // FIX: Check `chapters` instead of `cards`
          gsap.from(chapters, {
            opacity: 0,
            x: -20,
            duration: 0.6,
            stagger: 0.2,
            delay: 0.2,
            ease: "power2.out",
            clearProps: "all"
          });
        }
      }
    });

    if (timelineRef.current) {
      setTimeout(() => {
        const activeChapter = timelineRef.current?.querySelector('[data-active="true"]');
        if (activeChapter) {
          activeChapter.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 800);
    }

    return () => ctx.revert();
  }, [learningPath.id]);

  const totalQuests = learningPath.chapters.reduce((acc, ch) => acc + ch.quests.length, 0);
  const completedQuestsCount = learningPath.chapters.reduce(
    (acc, ch) => acc + ch.quests.filter(q => q.status === 'Completed').length,
    0
  );
  const overallProgress = totalQuests > 0 ? (completedQuestsCount / totalQuests) * 100 : 0;

  const activeChapterIndex = learningPath.chapters.findIndex(ch =>
    ch.status === 'InProgress' || ch.status === 'NotStarted'
  );
  const targetChapterIndex = activeChapterIndex === -1 ? learningPath.chapters.length - 1 : activeChapterIndex;

  return (
    <div className="flex flex-col gap-10 pb-24">
      {/* Header */}
      <header ref={headerRef} className="space-y-8">
        <button
          onClick={() => navigateTo("/dashboard")}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/60 transition-colors hover:text-[#f5c16c]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Sanctum
        </button>

        <div className="relative overflow-hidden rounded-[32px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-8 shadow-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
            style={{ backgroundImage: 'url(/images/asfalt-dark.png)', backgroundSize: '350px' }}
          />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_rgba(245,193,108,0.2),_transparent_60%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#f5c16c]">
                <Map className="h-3 w-3" /> Learning Path
              </div>
              <h1 className="text-4xl font-bold text-white md:text-5xl leading-tight">
                {learningPath.name}
              </h1>
              <p className="text-white/60 text-sm">
                {learningPath.description}
              </p>
            </div>

            <div className="w-full lg:w-80 rounded-2xl bg-black/40 border border-[#f5c16c]/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Overall Mastery</span>
                <span className="text-lg font-bold text-[#f5c16c]">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#f5c16c] [&>div]:to-[#d4a855]" />
              <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                <span>{completedQuestsCount} Quests Complete</span>
                <span>{totalQuests} Total</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Timeline Layout */}
      <div ref={timelineRef} className="relative pl-4 md:pl-8">
        <div className="absolute top-4 bottom-0 left-4 md:left-8 w-0.5 bg-gradient-to-b from-[#f5c16c]/50 via-[#f5c16c]/20 to-transparent" />

        <div className="space-y-16">
          {learningPath.chapters.map((chapter, index) => {
            const isLockedChapter = false;
            const isActiveChapter = index === targetChapterIndex;
            const chapterProgress = chapter.quests.length > 0
              ? (chapter.quests.filter(q => q.status === 'Completed').length / chapter.quests.length) * 100
              : 0;

            return (
              <div
                key={`semester-${chapter.sequence}`}
                className={`chapter-section relative pl-12 md:pl-16 transition-opacity duration-500 ${isLockedChapter ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`}
                data-active={isActiveChapter}
              >

                {/* Timeline Node */}
                <div className={`absolute left-0 top-0 flex h-8 w-8 md:h-10 md:w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 bg-[#1a0a08] shadow-[0_0_20px_rgba(0,0,0,0.8)] z-10 transition-all duration-500
                  ${isLockedChapter ? 'border-white/10 text-white/30' :
                    chapter.status === 'Completed' ? 'border-emerald-500 text-emerald-500' :
                      isActiveChapter ? 'border-[#f5c16c] text-[#f5c16c] scale-110 shadow-[0_0_25px_rgba(245,193,108,0.6)]' :
                        'border-[#f5c16c]/50 text-[#f5c16c]/50'}`}
                >
                  {isLockedChapter ? <Lock className="h-3 w-3 md:h-4 md:w-4" /> :
                    chapter.status === 'Completed' ? <CheckCircle className="h-3 w-3 md:h-4 md:w-4" /> :
                      <span className="text-xs font-bold">{chapter.sequence}</span>}
                </div>

                {/* Chapter Header */}
                <div className="mb-6 flex flex-wrap items-baseline gap-4">
                  <h2 className={`text-2xl font-semibold ${isActiveChapter ? 'text-[#f5c16c]' : 'text-white'}`}>
                    {chapter.title}
                  </h2>
                  <span className={`text-xs uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${isLockedChapter ? 'border-white/10 text-white/30' :
                    chapter.status === 'Completed' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                      'border-[#f5c16c]/30 text-[#f5c16c] bg-[#f5c16c]/10'
                    }`}>
                    {isLockedChapter ? 'Locked' : chapter.status === 'NotStarted' ? 'Available' : chapter.status}
                  </span>
                  {!isLockedChapter && (
                    <span className="text-xs text-white/40 ml-auto">
                      {Math.round(chapterProgress)}% Complete
                    </span>
                  )}
                </div>

                {/* Quests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {chapter.quests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      chapterSequence={chapter.sequence}
                      isLocked={false}
                      isGenerating={false}
                      onStartQuest={() => navigateTo(`/quests/${quest.id}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}