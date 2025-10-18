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
  Loader,
  Clock, 
  Target,
  Flame,
  Sparkles,
  ArrowLeft,
  Trophy
} from 'lucide-react';

interface Chapter {
  id: string;
  questId: string;
  chapterNumber: number;
  title: string;
  description: string;
  estimatedHours: number;
  xpReward: number;
  status: 'completed' | 'current' | 'locked';
  modules?: Array<{
    id: string;
    title: string;
    duration: string;
    completed: boolean;
  }>;
}

interface Quest {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: string;
  difficulty: string;
  estimatedHours: number;
  xpReward: number;
  progress: {
    chaptersCompleted: number;
    chaptersTotal: number;
    timeSpentHours: number;
    currentXP: number;
    totalXP: number;
    masteryPercent: number;
  };
  chapters: Chapter[];
}

interface QuestlineViewProps {
  quest: Quest;
}

export default function QuestlineView({ quest }: QuestlineViewProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const currentQuestRef = useRef<HTMLDivElement>(null);
  const questNodesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header elements
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "all"
        });
      }

      // Animate current quest card
      if (currentQuestRef.current) {
        gsap.from(currentQuestRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          delay: 0.2,
          ease: "power2.out",
          clearProps: "all"
        });
      }

      // Animate quest nodes along the sine wave path
      if (questNodesRef.current) {
        const nodeWrappers = questNodesRef.current.querySelectorAll('.quest-node-wrapper');
        
        // Simple fade in animation only - no scale or movement
        gsap.fromTo(nodeWrappers, 
          {
            opacity: 0
          },
          {
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.2,
            ease: "power2.out",
            clearProps: "opacity"
          }
        );
      }
    });

    return () => ctx.revert();
  }, [quest.id]); // Re-run animations when quest changes

  const currentChapter = quest.chapters.find((ch: Chapter) => ch.status === 'current') || quest.chapters[0];
  const completedChapters = quest.chapters.filter((chapter) => chapter.status === 'completed').length;
  const progressPercent = quest.chapters.length > 0 ? Math.round((completedChapters / quest.chapters.length) * 100) : 0;

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
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/55">Questline dossier</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{quest.title}</h1>
            <p className="mt-2 text-sm text-foreground/70">{quest.subtitle}</p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex items-center gap-2 text-foreground/60">
                  <Target className="h-4 w-4 text-amber-300" /> Chapters Cleared
                </span>
                <span className="font-semibold text-white">{quest.progress.chaptersCompleted}/{quest.progress.chaptersTotal}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex items-center gap-2 text-foreground/60">
                  <Clock className="h-4 w-4 text-amber-200" /> Time Logged
                </span>
                <span className="font-semibold text-white">{quest.progress.timeSpentHours}h / {quest.estimatedHours}h</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex items-center gap-2 text-foreground/60">
                  <Trophy className="h-4 w-4 text-accent" /> Essence Earned
                </span>
                <span className="font-semibold text-white">{quest.progress.currentXP} / {quest.xpReward} XP</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-foreground/60">
                <span>Codex Mastery</span>
                <span className="text-white">{quest.progress.masteryPercent}%</span>
              </div>
              <Progress value={quest.progress.masteryPercent} className="h-2 bg-white/10" />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-full bg-accent px-6 text-xs uppercase tracking-[0.4em] text-accent-foreground hover:bg-accent/90">
                <Link href={`/quests/${quest.id}`}>Quest Overview</Link>
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-full border-white/20 bg-transparent px-6 text-xs uppercase tracking-[0.4em] text-foreground/70 hover:border-accent/40 hover:text-accent"
              >
                Archive Logs
              </Button>
            </div>
          </div>

          {currentChapter && (
            <div
              ref={currentQuestRef}
              className="rounded-[30px] border border-accent/40 bg-accent/10 p-6 shadow-[0_18px_45px_rgba(210,49,135,0.4)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.45em] text-accent">Current Chapter</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{currentChapter.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{currentChapter.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-foreground/60">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-200" />
                  {currentChapter.estimatedHours}h runtime
                </span>
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-accent" />
                  {currentChapter.xpReward} XP bounty
                </span>
              </div>
            </div>
          )}
        </aside>

        <section className="space-y-10">
          <div className="rounded-[32px] border border-white/12 bg-black/35 p-8 shadow-[0_24px_60px_rgba(12,3,9,0.6)] backdrop-blur">
            <h2 className="text-3xl font-semibold text-white">{quest.subtitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/70">{quest.description}</p>
          </div>

          <div
            className="relative overflow-hidden rounded-[36px] border border-white/12 bg-gradient-to-br from-[#1f0914]/90 via-[#12050f]/94 to-[#070308]/98 px-6 py-16 shadow-[0_28px_80px_rgba(12,3,9,0.65)]"
            style={{ minHeight: `${quest.chapters.length * 120 + 200}px` }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(240,177,90,0.12),_transparent_75%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.15),_transparent_75%)]" />

            <div className="absolute left-10 top-10 z-20 flex flex-col items-center rounded-full border border-amber-300/40 bg-black/40 px-4 py-3 text-center text-xs uppercase tracking-[0.35em] text-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.25)]">
              <span>Progress</span>
              <span className="text-white">{progressPercent}%</span>
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
                  const centerX = 260;
                  const amplitude = 90;
                  const frequency = 1.15;
                  const verticalSpacing = 130;
                  const steps = 120;

                  let pathData = '';

                  for (let step = 0; step <= steps; step++) {
                    const t = (step / steps) * (quest.chapters.length - 1);
                    const y = 120 + t * verticalSpacing;
                    const x = centerX + Math.sin(t * frequency) * amplitude;
                    pathData += step === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
                  }

                  return pathData;
                })()}
                stroke="url(#quest-wave)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div ref={questNodesRef} className="relative h-full w-full">
              {quest.chapters.map((chapter, index) => {
                const isCompleted = chapter.status === 'completed';
                const isCurrent = chapter.status === 'current';
                const isLocked = chapter.status === 'locked';

                const centerX = 260;
                const amplitude = 90;
                const frequency = 1.15;
                const verticalSpacing = 130;

                const t = index;
                const waveY = 120 + t * verticalSpacing;
                const waveX = centerX + Math.sin(t * frequency) * amplitude;

                return (
                  <div
                    key={chapter.id}
                    className="absolute"
                    style={{
                      left: `${waveX}px`,
                      top: `${waveY}px`,
                      width: '74px',
                      height: '74px',
                      marginLeft: '-52px',
                      marginTop: '-52px',
                      zIndex: isCurrent ? 30 : isCompleted ? 20 : 15
                    }}
                  >
                    <Link
                      href={!isLocked ? `/quests/${quest.id}/${chapter.id}` : '#'}
                      className={`${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} group block h-full w-full`}
                    >
                      <div className="relative flex h-full w-full items-center justify-center">
                        {isCurrent && (
                          <span className="absolute -inset-4 rounded-full border border-emerald-300/40 opacity-80 blur-[2px]" />
                        )}
                        <div
                          className={`relative flex h-full w-full items-center justify-center rounded-full text-lg font-semibold transition-transform duration-300 hover:scale-110 ${
                            isCompleted
                              ? 'bg-emerald-500 text-white shadow-[0_0_35px_rgba(16,185,129,0.6)]'
                              : isCurrent
                              ? 'bg-amber-400 text-[#2c1309] shadow-[0_0_35px_rgba(251,191,36,0.55)]'
                              : isLocked
                              ? 'bg-[#2d1a16]/90 text-amber-200/80 shadow-[0_0_25px_rgba(124,83,45,0.35)]'
                              : 'bg-black/60 text-white shadow-[0_0_25px_rgba(210,49,135,0.35)]'
                          }`}
                        >
                          {isLocked ? <Lock className="h-5 w-5" /> : chapter.chapterNumber}
                          {isCurrent && (
                            <span className="pointer-events-none absolute inset-1 rounded-full border border-[#facc15]/30" />
                          )}
                          {isCompleted && (
                            <span className="pointer-events-none absolute inset-0 rounded-full border border-emerald-300/60" />
                          )}
                        </div>
                        <div
                          className={`pointer-events-none absolute top-1/2 flex w-56 -translate-y-1/2 flex-col gap-2 rounded-2xl border border-white/12 bg-black/70 p-4 text-left text-xs text-foreground/70 opacity-0 shadow-[0_12px_30px_rgba(10,3,6,0.45)] backdrop-blur transition-all duration-200 ${
                            index % 2 === 0 ? 'left-20 group-hover:translate-x-2' : 'right-20 group-hover:-translate-x-2'
                          } group-hover:opacity-100`}
                        >
                          <p className="text-sm font-semibold text-white">{chapter.title}</p>
                          <p>{chapter.description}</p>
                          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-foreground/50">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {chapter.estimatedHours}h
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" /> {chapter.xpReward} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-white/12 bg-black/35 p-6 shadow-[0_22px_60px_rgba(12,3,9,0.6)] backdrop-blur sm:grid-cols-2">
            <div className="flex items-center gap-3 text-sm text-foreground/70">
              <CheckCircle className="h-5 w-5 text-emerald-300" />
              Completed nodes glow emerald with reinforced borders.
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground/70">
              <Sparkles className="h-5 w-5 text-amber-200" />
              The luminous marker highlights your active chapter.
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground/70">
              <Lock className="h-5 w-5 text-amber-400/70" />
              Locked seals remain dormant until prerequisites are met.
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground/70">
              <Loader className="h-5 w-5 text-foreground/60" />
              Bronze sine-wave tracks the guild&apos;s chronicle path.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button asChild variant="outline" className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-xs uppercase tracking-[0.4em] text-foreground/70 hover:border-accent/50 hover:text-accent">
              <Link href="/quests">
                <ArrowLeft className="h-4 w-4" /> Return to Atlas
              </Link>
            </Button>
            {currentChapter && (
              <Button
                asChild
                className="h-12 rounded-full bg-accent px-6 text-xs uppercase tracking-[0.4em] text-accent-foreground shadow-[0_18px_45px_rgba(210,49,135,0.45)] hover:bg-accent/90"
              >
                <Link href={`/quests/${quest.id}/${currentChapter.id}`}>
                  <Sparkles className="h-4 w-4" /> Resume Chapter
                </Link>
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}