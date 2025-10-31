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
  Clock,
  Target,
  Sparkles,
  ArrowLeft,
  Trophy
} from 'lucide-react';
import { LearningPath, QuestChapter } from '@/types/quest'; // Use live data types

interface QuestlineViewProps {
  learningPath: LearningPath;
}

export default function QuestlineView({ learningPath }: QuestlineViewProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const currentQuestRef = useRef<HTMLDivElement>(null);
  const questNodesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          opacity: 0, y: -20, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "all"
        });
      }
      if (currentQuestRef.current) {
        gsap.from(currentQuestRef.current, {
          opacity: 0, scale: 0.95, duration: 0.5, delay: 0.2, ease: "power2.out", clearProps: "all"
        });
      }
      if (questNodesRef.current) {
        const nodeWrappers = questNodesRef.current.querySelectorAll('.quest-node-wrapper');
        if (Card.length > 0) {
          gsap.from(nodeWrappers, {
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.2,
            ease: "power2.out",
            clearProps: "opacity"
          });
        }
      }
    });
    return () => ctx.revert();
  }, [learningPath.id]);

  const currentChapter = learningPath.chapters.find((ch: QuestChapter) => ch.status === 'InProgress') || learningPath.chapters[0];
  const completedChapters = learningPath.chapters.filter((chapter) => chapter.status === 'Completed').length;

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-gradient-to-br from-[#1a0712]/94 via-[#0d0410]/95 to-[#040207]/98 p-8 pb-20 shadow-[0_32px_110px_rgba(15,4,10,0.7)]">
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.42),_transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(240,177,90,0.22),_transparent_72%)]" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside ref={headerRef} className="space-y-8">
          <Link
            href="/quests"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-foreground/60 transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Quest Log
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
        </aside>

        <section className="space-y-10">
          <div
            className="relative overflow-hidden rounded-[36px] border border-white/12 bg-gradient-to-br from-[#1f0914]/90 via-[#12050f]/94 to-[#070308]/98 px-6 py-16 shadow-[0_28px_80px_rgba(12,3,9,0.65)]"
            style={{ minHeight: `${learningPath.chapters.length * 120 + 200}px` }}
          >
            <div className="absolute left-10 top-10 z-20 flex flex-col items-center rounded-full border border-amber-300/40 bg-black/40 px-4 py-3 text-center text-xs uppercase tracking-[0.35em] text-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.25)]">
              <span>Progress</span>
              <span className="text-white">{learningPath.completionPercentage.toFixed(0)}%</span>
            </div>

            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="quest-wave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a263" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#c37a57" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a75a44" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path
                d={(() => {
                  const centerX = 260, amplitude = 90, frequency = 1.15, verticalSpacing = 130, steps = 120;
                  let pathData = '';
                  for (let step = 0; step <= steps; step++) {
                    const t = (step / steps) * (learningPath.chapters.length - 1);
                    const y = 120 + t * verticalSpacing;
                    const x = centerX + Math.sin(t * frequency) * amplitude;
                    pathData += step === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
                  }
                  return pathData;
                })()}
                stroke="url(#quest-wave)" strokeWidth="4" strokeLinecap="round" fill="none"
              />
            </svg>

            <div ref={questNodesRef} className="relative h-full w-full">
              {learningPath.chapters.map((chapter, index) => {
                const isCompleted = chapter.status === 'Completed';
                const isCurrent = chapter.status === 'InProgress';
                const isLocked = chapter.status === 'NotStarted' && !isCurrent && (completedChapters < index);

                const centerX = 260, amplitude = 90, frequency = 1.15, verticalSpacing = 130;
                const t = index;
                const waveY = 120 + t * verticalSpacing;
                const waveX = centerX + Math.sin(t * frequency) * amplitude;

                return (
                  <div key={chapter.id} className="absolute" style={{ left: `${waveX}px`, top: `${waveY}px`, width: '74px', height: '74px', marginLeft: '-52px', marginTop: '-52px', zIndex: isCurrent ? 30 : isCompleted ? 20 : 15 }}>
                    <Link
                      href={!isLocked ? `/quests/${learningPath.id}/${chapter.id}` : '#'}
                      className={`${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} group block h-full w-full`}
                    >
                      <div className="relative flex h-full w-full items-center justify-center">
                        {isCurrent && <span className="absolute -inset-4 rounded-full border border-emerald-300/40 opacity-80 blur-[2px]" />}
                        <div className={`relative flex h-full w-full items-center justify-center rounded-full text-lg font-semibold transition-transform duration-300 hover:scale-110 ${isCompleted ? 'bg-emerald-500 text-white shadow-[0_0_35px_rgba(16,185,129,0.6)]'
                            : isCurrent ? 'bg-amber-400 text-[#2c1309] shadow-[0_0_35px_rgba(251,191,36,0.55)]'
                              : isLocked ? 'bg-[#2d1a16]/90 text-amber-200/80 shadow-[0_0_25px_rgba(124,83,45,0.35)]'
                                : 'bg-black/60 text-white shadow-[0_0_25px_rgba(210,49,135,0.35)]'
                          }`}>
                          {isLocked ? <Lock className="h-5 w-5" /> : chapter.sequence}
                          {isCurrent && <span className="pointer-events-none absolute inset-1 rounded-full border border-[#facc15]/30" />}
                          {isCompleted && <span className="pointer-events-none absolute inset-0 rounded-full border border-emerald-300/60" />}
                        </div>
                        <div className={`pointer-events-none absolute top-1/2 flex w-56 -translate-y-1/2 flex-col gap-2 rounded-2xl border border-white/12 bg-black/70 p-4 text-left text-xs text-foreground/70 opacity-0 shadow-[0_12px_30px_rgba(10,3,6,0.45)] backdrop-blur transition-all duration-200 ${index % 2 === 0 ? 'left-20 group-hover:translate-x-2' : 'right-20 group-hover:-translate-x-2'
                          } group-hover:opacity-100`}>
                          <p className="text-sm font-semibold text-white">{chapter.title}</p>
                          <p>Quests: {chapter.quests.length}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
