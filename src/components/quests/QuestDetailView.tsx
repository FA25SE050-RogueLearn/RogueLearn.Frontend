"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowLeft, Play, BookOpen, Trophy, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";

interface Module {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Chapter {
  id: string;
  questId: string;
  chapterNumber: number;
  title: string;
  description: string;
  estimatedHours: number;
  xpReward: number;
  status: 'completed' | 'current' | 'locked';
  modules?: Module[];
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

interface QuestDetailViewProps {
  quest: Quest;
  chapter: Chapter;
}

export function QuestDetailView({ quest, chapter }: QuestDetailViewProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);

  const modules = chapter.modules || [];
  const completedModules = modules.filter(m => m.completed).length;
  const totalModules = modules.length;
  const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          opacity: 0,
          y: -30,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "all"
        });
      }

      // Animate progress card
      if (progressRef.current) {
        gsap.from(progressRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          delay: 0.2,
          ease: "power2.out",
          clearProps: "all"
        });
      }

      // Animate module cards
      if (modulesRef.current) {
        const cards = modulesRef.current.querySelectorAll('.module-card');
        if (cards.length > 0) {
          gsap.from(cards, {
            opacity: 0,
            x: -30,
            duration: 0.5,
            stagger: 0.08,
            delay: 0.3,
            ease: "power2.out",
            clearProps: "all"
          });
        }
      }
    });

    return () => ctx.revert();
  }, [chapter.id]); // Re-run animations when chapter changes

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-gradient-to-br from-[#241012]/92 via-[#13080e]/95 to-[#060307]/98 p-8 pb-20 shadow-[0_32px_110px_rgba(18,5,10,0.7)]">
      <div className="pointer-events-none absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.38),_transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(240,177,90,0.22),_transparent_72%)]" />

      <div className="relative z-10 flex flex-col gap-10">
        <section
          ref={headerRef}
          className="rounded-[32px] border border-white/12 bg-black/35 p-8 shadow-[0_26px_70px_rgba(14,4,10,0.65)] backdrop-blur"
        >
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="space-y-4">
              <Link
                href="/quests"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-foreground/60 transition-colors hover:text-accent"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Atlas
              </Link>

              <div className="text-xs uppercase tracking-[0.35em] text-foreground/60">
                RogueLearn <span className="text-foreground/40">/</span> {quest.title}
                <span className="text-foreground/40"> / </span> Chapter {chapter.chapterNumber}
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold text-white md:text-5xl">{chapter.title}</h1>
                <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">{chapter.description}</p>
              </div>

              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.4em] text-foreground/60">
                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">Module Count {totalModules}</span>
                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">Difficulty {quest.difficulty}</span>
                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">XP {chapter.xpReward}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[{
                label: 'Modules Cleared',
                value: `${completedModules}/${totalModules}`,
                icon: CheckCircle,
                accent: 'text-emerald-300'
              }, {
                label: 'Time Invested',
                value: chapter.estimatedHours ? `${chapter.estimatedHours}h` : '—',
                icon: Clock,
                accent: 'text-amber-200'
              }].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[24px] border border-white/12 bg-white/5 p-5 shadow-[0_20px_45px_rgba(14,4,10,0.55)]"
                >
                  <div className={`flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-foreground/60 ${stat.accent}`}>
                    <stat.icon className="h-5 w-5" />
                    <span>{stat.label}</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)]">
          <Card
            ref={progressRef}
            className="overflow-hidden rounded-[32px] border border-accent/40 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent shadow-[0_26px_70px_rgba(210,49,135,0.35)]"
          >
            <CardContent className="p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <Target className="h-6 w-6 text-accent" /> Chapter Progress
                  </h2>
                  <span className="text-4xl font-semibold text-accent">
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>

                <Progress value={progressPercentage} className="h-3 bg-white/10" />

                <div className="grid gap-4 text-sm uppercase tracking-[0.3em] text-foreground/60 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3">
                    <p className="text-xs">Modules Completed</p>
                    <p className="mt-2 text-lg font-semibold text-white">{completedModules}/{totalModules}</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3">
                    <p className="text-xs">XP Reward</p>
                    <p className="mt-2 text-lg font-semibold text-white">{chapter.xpReward}</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3">
                    <p className="text-xs">Estimated Time</p>
                    <p className="mt-2 text-lg font-semibold text-white">{chapter.estimatedHours} hours</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3">
                    <p className="text-xs">Chapter Index</p>
                    <p className="mt-2 text-lg font-semibold text-white">{chapter.chapterNumber} / {quest.chapters.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-[32px] border border-white/12 bg-black/35 p-8 shadow-[0_24px_60px_rgba(14,4,10,0.6)] backdrop-blur">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" /> Learning Modules
            </h2>

            {modules.length === 0 ? (
              <div className="mt-8 text-center text-sm text-foreground/70">
                This chapter doesn&apos;t have any learning modules yet. Check back soon.
              </div>
            ) : (
              <div ref={modulesRef} className="mt-6 space-y-4">
                {modules.map((module) => (
                  <Card
                    key={module.id}
                    className={`module-card overflow-hidden rounded-[20px] border transition-all duration-300 hover:border-accent/40 hover:shadow-[0_18px_45px_rgba(210,49,135,0.35)] ${
                      module.completed ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/12 bg-black/45'
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-1 items-start gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                              module.completed
                                ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100'
                                : 'border-white/15 bg-white/10 text-foreground/60'
                            }`}
                          >
                            {module.completed ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                              {module.completed && (
                                <span className="rounded-full border border-emerald-300/50 bg-emerald-500/15 px-2 py-0.5 text-xs uppercase tracking-[0.4em] text-emerald-200">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground/70">{module.duration}</p>
                          </div>
                        </div>

                        <Button
                          variant={module.completed ? 'outline' : 'default'}
                          className={`${module.completed ? 'border-white/20 text-foreground/70 hover:border-accent/40 hover:text-accent' : 'bg-accent text-accent-foreground hover:bg-accent/90'} rounded-full px-5`}
                          asChild
                        >
                          <Link href={`/quests/${quest.id}/${chapter.id}/${module.id}`}>
                            {module.completed ? (
                              <>
                                <BookOpen className="mr-2 h-4 w-4" /> Review
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" /> Start
                              </>
                            )}
                          </Link>
                        </Button>
                      </div>

                      {!module.completed && (
                        <div className="mt-4">
                          <Progress value={0} className="h-1.5 bg-white/10" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <Button asChild variant="outline" className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-xs uppercase tracking-[0.4em] text-foreground/70 hover:border-accent/45 hover:text-accent">
            <Link href={`/quests/${quest.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Questline
            </Link>
          </Button>
          <Button className="h-12 rounded-full bg-accent px-6 text-xs uppercase tracking-[0.4em] text-accent-foreground shadow-[0_20px_45px_rgba(210,49,135,0.45)] hover:bg-accent/90">
            <Play className="mr-2 h-4 w-4" /> Continue Learning
          </Button>
        </div>
      </div>
    </div>
  );
}

