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

  // Debug logging
  console.log('QuestDetailView render:', {
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    modulesCount: modules.length,
    modules: modules
  });

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
    <div className="flex flex-col gap-6 pb-20">
      {/* Back Button & Breadcrumb */}
      <div ref={headerRef} className="flex flex-col gap-4">
        <Button asChild variant="ghost" className="w-fit">
          <Link href="/quests" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Quest Log
          </Link>
        </Button>

        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <span>RogueLearn</span>
          <span>{'>'}</span>
          <Link href="/quests" className="hover:text-accent transition-colors">
            Quests
          </Link>
          <span>{'>'}</span>
          <Link href={`/quests/${quest.id}`} className="hover:text-accent transition-colors">
            {quest.title}
          </Link>
          <span>{'>'}</span>
          <span className="text-foreground">Chapter {chapter.chapterNumber}</span>
        </div>

        {/* Chapter Title */}
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">{chapter.title}</h1>
          <p className="text-foreground/70">{chapter.description}</p>
        </div>
      </div>

      {/* Progress Overview Card */}
      <Card 
        ref={progressRef}
        className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30"
      >
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
                <Target className="w-6 h-6 text-accent" />
                Chapter Progress
              </h2>
              <span className="text-3xl font-bold text-accent">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>

            <Progress value={progressPercentage} className="h-3" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-foreground/60">Modules Done</p>
                  <p className="font-bold">{completedModules}/{totalModules}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-foreground/60">XP Reward</p>
                  <p className="font-bold">{chapter.xpReward}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-foreground/60">Est. Time</p>
                  <p className="font-bold">{chapter.estimatedHours}h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xs text-foreground/60">Chapter</p>
                  <p className="font-bold">{chapter.chapterNumber}/10</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Modules */}
      <div>
        <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-accent" />
          Learning Modules
        </h2>

        {modules.length === 0 ? (
          <Card className="bg-card/50 border-2 border-dashed border-border/50">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Modules Available</h3>
              <p className="text-foreground/60">
                This chapter doesn&apos;t have any learning modules yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div ref={modulesRef} className="space-y-4">
            {modules.map((module) => (
              <Card 
                key={module.id}
                className={`
                  module-card overflow-hidden transition-all duration-300 hover:scale-[1.01]
                  ${module.completed 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-card/50 hover:border-accent/40'
                  }
                `}
              >
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6">
                  {/* Left side - Icon and Content */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Icon */}
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                      ${module.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground border-2 border-border'
                      }
                    `}>
                      {module.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </div>

                    {/* Module Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold font-heading">
                          {module.title}
                        </h3>
                        {module.completed && (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-semibold">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/70 font-body">
                        Duration: {module.duration}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Action Button */}
                  <div className="flex-shrink-0 ml-4">
                    <Button 
                      variant={module.completed ? "outline" : "default"}
                      className={`
                        ${!module.completed && 'bg-accent hover:bg-accent/90 text-primary'}
                      `}
                      asChild
                    >
                      <Link href={`/quests/${quest.id}/${chapter.id}/${module.id}`}>
                        {module.completed ? (
                          <>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Review
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </>
                        )}
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Progress bar for incomplete modules */}
                {!module.completed && (
                  <div className="px-6 pb-4">
                    <Progress value={0} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t">
        <Button variant="outline" size="lg" asChild>
          <Link href={`/quests/${quest.id}`}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Questline
          </Link>
        </Button>
        <Button 
          size="lg"
          className="bg-gradient-to-r from-accent to-accent/80 text-primary"
        >
          <Play className="w-5 h-5 mr-2" />
          Continue Learning
        </Button>
      </div>
    </div>
  );
}

