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
  Trophy,
  Sparkles,
  Flame,
  Target,
  ArrowRight
} from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: string;
  difficulty: string;
  estimatedHours: number;
  xpReward: number;
  completedAt?: string;
  prerequisites?: string[];
  progress: {
    chaptersCompleted: number;
    chaptersTotal: number;
    timeSpentHours: number;
    currentXP: number;
    totalXP: number;
    masteryPercent: number;
  };
}

interface QuestListViewProps {
  activeQuests: Quest[];
  completedQuests: Quest[];
  availableQuests: Quest[];
  userStats: {
    streak: number;
    totalQuests: number;
    totalXP: number;
  };
}

export default function QuestListView({ 
  activeQuests, 
  completedQuests, 
  availableQuests,
  userStats 
}: QuestListViewProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const activeQuestsRef = useRef<HTMLDivElement>(null);
  const completedQuestsRef = useRef<HTMLDivElement>(null);
  const availableQuestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all"
        });
      }

      // Animate quest cards with stagger
      const animateCards = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
          const cards = ref.current.querySelectorAll('.quest-card');
          if (cards.length > 0) {
            gsap.from(cards, {
              opacity: 0,
              y: 20,
              duration: 0.4,
              stagger: 0.08,
              ease: "power2.out",
              clearProps: "all"
            });
          }
        }
      };

      animateCards(activeQuestsRef);
      animateCards(completedQuestsRef);
      animateCards(availableQuestsRef);
    });

    return () => ctx.revert();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-red-500';
      default: return 'text-foreground';
    }
  };

  const QuestCard = ({ quest, isLocked = false }: { quest: Quest; isLocked?: boolean }) => (
    <Link 
      href={isLocked ? '#' : `/quests/${quest.id}`}
      className={`quest-card block ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <Card className={`bg-gradient-to-br from-card/80 to-card/40 border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        quest.status === 'Active' ? 'border-accent/40 hover:border-accent' : 
        quest.status === 'Completed' ? 'border-green-500/40 hover:border-green-500' :
        'border-border/40 hover:border-border'
      }`}>
        <CardContent className="p-6">
          {/* Header with Icon and Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                quest.status === 'Completed' ? 'bg-green-500/20' :
                quest.status === 'Active' ? 'bg-accent/20' :
                'bg-muted/20'
              }`}>
                {quest.status === 'Completed' ? (
                  <CheckCircle className="w-7 h-7 text-green-500" />
                ) : isLocked ? (
                  <Lock className="w-7 h-7 text-muted-foreground" />
                ) : (
                  <BookOpen className="w-7 h-7 text-accent" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold font-heading">{quest.title}</h3>
                  <span className={`text-xs font-semibold ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                </div>
                <p className="text-sm text-foreground/60">{quest.subtitle}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-foreground/40" />
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/70 mb-4">{quest.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-foreground/70">
                {quest.progress.timeSpentHours > 0 
                  ? `${quest.progress.timeSpentHours}h / ${quest.estimatedHours}h` 
                  : `${quest.estimatedHours}h total`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-foreground/70">{quest.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-2 text-sm col-span-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-foreground/70">
                {quest.progress.chaptersCompleted} / {quest.progress.chaptersTotal} chapters
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {quest.progress.masteryPercent > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/60">Progress</span>
                <span className="font-semibold">{quest.progress.masteryPercent}%</span>
              </div>
              <Progress value={quest.progress.masteryPercent} className="h-2" />
            </div>
          )}

          {/* Prerequisites */}
          {isLocked && quest.prerequisites && quest.prerequisites.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-foreground/60">
                <Lock className="w-3 h-3 inline mr-1" />
                Complete previous quests to unlock
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header with Stats */}
      <div ref={headerRef} className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <span>RogueLearn</span>
          <span>{'>'}</span>
          <span className="text-foreground">Quests</span>
        </div>

        <h1 className="text-4xl font-bold font-heading">Your Quest Log</h1>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-semibold">{userStats.streak}-day streak</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">{userStats.totalQuests} quests</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{userStats.totalXP} XP</span>
          </div>
        </div>
      </div>

      {/* Active Quests Section */}
      {activeQuests.length > 0 && (
        <div ref={activeQuestsRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
              <Target className="w-6 h-6 text-accent" />
              Active Quests
            </h2>
            <span className="text-sm text-foreground/60">{activeQuests.length} in progress</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Quests Section */}
      {completedQuests.length > 0 && (
        <div ref={completedQuestsRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Completed Quests
            </h2>
            <span className="text-sm text-foreground/60">{completedQuests.length} completed</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}

      {/* Available Quests Section */}
      {availableQuests.length > 0 && (
        <div ref={availableQuestsRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-500" />
              Available Quests
            </h2>
            <span className="text-sm text-foreground/60">{availableQuests.length} available</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableQuests.map((quest) => (
              <QuestCard 
                key={quest.id} 
                quest={quest} 
                isLocked={quest.prerequisites && quest.prerequisites.length > 0} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
