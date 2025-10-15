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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
      {/* Left Column - Header and Quest Info */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div ref={headerRef} className="flex flex-col gap-4">
          <Link href="/quests" className="flex items-center gap-2 text-sm text-foreground/60 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quests</span>
          </Link>

          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <span>RogueLearn</span>
            <span>{'>'}</span>
            <Link href="/quests" className="hover:text-accent transition-colors">Quests</Link>
            <span>{'>'}</span>
            <span className="text-foreground">Questline</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold font-heading mb-1">{quest.title}</h1>
            <p className="text-sm text-foreground/60">{quest.subtitle}</p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">{quest.progress.chaptersCompleted}/{quest.progress.chaptersTotal} chapters</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">{quest.progress.timeSpentHours}h / {quest.estimatedHours}h</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{quest.progress.currentXP} / {quest.xpReward} XP</span>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Overall Progress</span>
              <span className="font-semibold">{quest.progress.masteryPercent}%</span>
            </div>
            <Progress value={quest.progress.masteryPercent} className="h-2" />
          </div>

          {/* Current Chapter Info */}
          {currentChapter && (
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-foreground/60 mb-2">CURRENT CHAPTER</p>
              <p className="font-semibold">{currentChapter.title}</p>
              <p className="text-sm text-foreground/60 mt-1">{currentChapter.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Center Column - Quest Progression */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Quest Chapter Title */}
        <div className="text-center py-4 mb-4">
          <h2 className="text-2xl font-bold font-heading">{quest.subtitle}</h2>
          <p className="text-sm text-foreground/60 mt-1">{quest.description}</p>
        </div>

        {/* Skill Tree - Sine Wave Pattern */}
        <div className="relative w-full max-w-4xl mx-auto py-12 px-8" style={{ minHeight: `${quest.chapters.length * 120 + 150}px` }}>
          {/* Progress Percentage on Left */}
          <div className="absolute left-0 top-20 text-yellow-500 font-bold text-xl z-20">
            {Math.round((quest.progress.chaptersCompleted / quest.progress.chaptersTotal) * 100)}%
          </div>

          {/* Smooth Sine Wave Path Line */}
          <svg className="absolute left-0 top-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Smooth interpolated path */}
            <path
              d={(() => {
                const centerX = 250;
                const amplitude = 80;
                const frequency = 1.2;
                const verticalSpacing = 120;
                const steps = 100;
                
                let pathData = '';
                
                for (let step = 0; step <= steps; step++) {
                  const t = (step / steps) * (quest.chapters.length - 1);
                  const y = 80 + t * verticalSpacing;
                  const x = centerX + Math.sin(t * frequency) * amplitude;
                  
                  pathData += step === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
                }
                
                return pathData;
              })()}
              stroke="url(#waveGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            
          </svg>

          {/* Quest Nodes Container - positioned at exact sine wave points */}
          <div ref={questNodesRef} className="relative w-full h-full">
          {quest.chapters.map((chapter, index) => {
            const isCompleted = chapter.status === 'completed';
            const isCurrent = chapter.status === 'current';
            const isLocked = chapter.status === 'locked';
            
            // Shared wave parameters - MUST match SVG exactly
            const centerX = 250;
            const amplitude = 80;
            const frequency = 1.2;
            const verticalSpacing = 120;
            
            // Calculate exact position on sine wave using same formula as SVG
            const t = index; // Use index as the parameter value
            const waveY = 80 + t * verticalSpacing;
            const waveX = centerX + Math.sin(t * frequency) * amplitude;

            return (
              <div
                key={chapter.id}
                className="absolute"
                style={{
                  left: `${waveX}px`,
                  top: `${waveY}px`,
                  zIndex: 10,
                  width: '64px',
                  height: '64px',
                  marginLeft: '-64px', // Move left (was -32px)
                  marginTop: '-80px'   // Move up (was -32px)
                }}
              >
                <Link
                  href={!isLocked ? `/quests/${quest.id}/${chapter.id}` : '#'}
                  className={`quest-node ${isCurrent ? 'quest-node-current' : ''} block w-full h-full ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="relative group">
                  {/* Outer Glow Ring for Current */}
                  {isCurrent && (
                    <div className="absolute -inset-3 rounded-full border-[3px] border-green-500/40 animate-ping" 
                         style={{ animationDuration: '2.5s' }} 
                    />
                  )}
                  
                  {/* Progress Ring for Current (Static) */}
                  {isCurrent && (
                    <div 
                      className="absolute -inset-2 rounded-full"
                      style={{
                        background: `conic-gradient(#22c55e 0% 30%, transparent 30% 100%)`,
                        padding: '3px'
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-background"></div>
                    </div>
                  )}
                  
                  {/* Quest Node Circle */}
                  <div
                    className={`
                      relative w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg
                      transition-all duration-300 group-hover:scale-125
                      border-[3px]
                      ${isCompleted 
                        ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/40' 
                        : isCurrent 
                        ? 'bg-yellow-500 border-yellow-300 text-background shadow-lg shadow-yellow-500/50' 
                        : isLocked
                        ? 'bg-muted/40 border-border text-muted-foreground'
                        : 'bg-background border-accent/60 text-foreground shadow-md'
                      }
                    `}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      chapter.chapterNumber
                    )}
                  </div>

                  {/* Hover Tooltip - Position based on side */}
                  <div className={`absolute ${index % 2 === 0 ? 'left-20' : 'right-20'} top-0 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50`}>
                    <Card className="w-64 border-2 border-accent/40 bg-card/95 backdrop-blur-sm shadow-2xl">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold font-heading text-sm">{chapter.title}</h3>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground/60 mb-2">{chapter.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-foreground/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {chapter.estimatedHours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {chapter.xpReward} XP
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </Link>
              </div>
            );
          })}
          </div>
        </div>

        {/* Legend */}
        <Card className="bg-card/50 border-2 border-dashed border-accent/30 mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Legend:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Completed Quest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Loader className="w-3 h-3" />
                </div>
                <span className="text-sm">Current Quest</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Locked Quest</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Available Quest er 2 (Semester 2)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Link href="/quests">
              <ArrowLeft className="w-5 h-5" />
              Back to Quest Log
            </Link>
          </Button>
          {currentChapter && (
            <Button
              asChild
              size="lg"
              className="flex items-center gap-2 bg-gradient-to-r from-accent to-accent/80"
            >
              <Link href={`/quests/${quest.id}/${currentChapter.id}`}>
                <Sparkles className="w-5 h-5" />
                Continue Chapter
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}