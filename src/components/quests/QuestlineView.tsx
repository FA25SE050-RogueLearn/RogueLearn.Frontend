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

interface QuestlineViewProps {
  learningPath: LearningPath;
}

export default function QuestlineView({ learningPath }: QuestlineViewProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);

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

  // This logic correctly identifies your current chapter by finding the first
  // chapter that is not 'Completed'. This works for both new and advanced users.
  const currentChapter = 
      learningPath.chapters.find(ch => ch.status === 'InProgress') ||
      learningPath.chapters.find(ch => ch.status === 'NotStarted') ||
      learningPath.chapters[learningPath.chapters.length - 1];

  return (
    <div className="flex flex-col gap-10">
      <header ref={headerRef} className="space-y-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-foreground/60 transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>

          <div className="rounded-[30px] border border-white/12 bg-black/35 p-6 shadow-[0_20px_50px_rgba(12,3,9,0.6)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/55">Questline Dossier</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{learningPath.name}</h1>
            <p className="mt-2 text-sm text-foreground/70">{learningPath.description}</p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex items-center gap-2 text-foreground/60">
                  <Target className="h-4 w-4 text-amber-300" /> Chapters Cleared
                </span>
                <span className="font-semibold text-white">{completedChapters}/{learningPath.chapters.length}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-foreground/60">
                <span>Path Completion</span>
                <span className="text-white">{learningPath.completionPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={learningPath.completionPercentage} className="h-2 bg-white/10" />
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
            <Link
                key={chapter.id}
                href={!isLocked ? `/quests/${learningPath.id}/${chapter.id}` : '#'}
                className={`chapter-card group relative block transition ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
                <Card className={`relative overflow-hidden rounded-[24px] border transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_65px_rgba(210,49,135,0.35)] 
                    ${isCurrent ? 'border-accent shadow-[0_0_35px_rgba(210,49,135,0.45)]' : 
                    isCompleted ? 'border-emerald-400/30 bg-emerald-950/20' : 
                    'border-white/12 bg-black/40'}`}>
                    
                    {isCurrent && <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.42),_transparent_70%)]" />}

                    <CardContent className="relative z-10 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1">
                                <h3 className="text-xl font-semibold text-white">{chapter.title}</h3>
                                <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                                    {questsInChapter.length} Quests
                                </p>
                            </div>
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-white/5 text-lg shadow-inner shadow-black/50
                                ${isCurrent ? 'border-accent/40 bg-accent/15 text-accent' :
                                isCompleted ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' :
                                'border-white/20 text-foreground/70'}`}>
                                {isCompleted ? <CheckCircle className="h-7 w-7" />
                                : isLocked ? <Lock className="h-7 w-7" />
                                : <Sparkles className="h-7 w-7 animate-pulse" />}
                            </div>
                        </div>
                        <div className="mt-4">
                            <Progress value={chapterProgress} className="h-2 bg-white/10" />
                        </div>
                    </CardContent>
                </Card>
            </Link>
            );
        })}
      </section>
    </div>
  );
}