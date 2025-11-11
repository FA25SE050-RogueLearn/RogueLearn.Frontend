// roguelearn-web/src/components/quests/QuestListView.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BookOpen,
  CheckCircle,
  Lock,
  Sparkles,
  Flame,
  Target,
  Loader2
} from 'lucide-react';
import { QuestSummary } from '@/types/quest';
import questApi from '@/api/questApi';

interface QuestListViewProps {
  activeQuests: QuestSummary[];
  completedQuests: QuestSummary[];
  notStartedQuests: QuestSummary[];
  userStats: {
    streak: number;
    totalQuests: number;
    totalXP: number;
  };
}

export default function QuestListView({
  activeQuests,
  completedQuests,
  notStartedQuests,
  userStats
}: QuestListViewProps) {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const activeQuestsRef = useRef<HTMLDivElement>(null);
  const completedQuestsRef = useRef<HTMLDivElement>(null);
  const availableQuestsRef = useRef<HTMLDivElement>(null);
  const lockedQuestsRef = useRef<HTMLDivElement>(null);
  const [generatingQuestId, setGeneratingQuestId] = useState<string | null>(null);

  const [learningMode, setLearningMode] = useState<'structured' | 'free'>('structured');

  const { availableQuests, lockedQuests } = useMemo(() => {
    if (learningMode === 'free') {
      return {
        availableQuests: notStartedQuests,
        lockedQuests: [],
      };
    }

    const available: QuestSummary[] = [];
    const locked: QuestSummary[] = [];
    const completedIds = new Set(completedQuests.map(q => q.id));
    const allSortedQuests = [...completedQuests, ...notStartedQuests].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    notStartedQuests.forEach(quest => {
      const questIndex = allSortedQuests.findIndex(q => q.id === quest.id);
      if (questIndex === 0) {
        available.push(quest);
        return;
      }
      const previousQuest = allSortedQuests[questIndex - 1];
      if (previousQuest && completedIds.has(previousQuest.id)) {
        available.push(quest);
      } else {
        locked.push(quest);
      }
    });

    return { availableQuests: available, lockedQuests: locked };
  }, [learningMode, notStartedQuests, completedQuests]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          opacity: 0, y: -20, duration: 0.5, stagger: 0.08, ease: "power2.out", clearProps: "all"
        });
      }
      const animateCards = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
          const cards = ref.current.querySelectorAll('.quest-card');
          if (cards.length > 0) {
            gsap.from(cards, {
              opacity: 0, y: 20, duration: 0.4, stagger: 0.08, ease: "power2.out", clearProps: "all"
            });
          }
        }
      };
      animateCards(activeQuestsRef);
      animateCards(completedQuestsRef);
      animateCards(availableQuestsRef);
      animateCards(lockedQuestsRef);
    });
    return () => ctx.revert();
  }, [availableQuests, lockedQuests]);

  const handleStartQuest = async (event: React.MouseEvent, quest: QuestSummary) => {
    event.preventDefault();
    event.stopPropagation();
    setGeneratingQuestId(quest.id);

    try {
      // First, try to get quest details to check if steps already exist.
      const detailsResponse = await questApi.getQuestDetails(quest.id);

      // If steps exist (Scenario A), navigate directly.
      if (detailsResponse.isSuccess && detailsResponse.data?.steps && detailsResponse.data.steps.length > 0) {
        console.log(`Quest steps for ${quest.title} already exist. Navigating directly.`);
        router.push(`/quests/${quest.learningPathId}/${quest.chapterId}/${quest.id}`);
      } else {
        // If steps do NOT exist (Scenario B), generate them now.
        console.log(`Quest steps for ${quest.title} not found. Generating now...`);
        const generateResponse = await questApi.generateQuestSteps(quest.id);

        if (generateResponse.isSuccess && generateResponse.data && generateResponse.data.length > 0) {
          // Generation was successful, now navigate.
          router.push(`/quests/${quest.learningPathId}/${quest.chapterId}/${quest.id}`);
        } else {
          // Generation failed.
          alert('Failed to generate new quest steps. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error starting quest:', error);
      alert('An error occurred while starting the quest. It might be locked by a prerequisite in the backend.');
    } finally {
      // This ensures the loading state is turned off regardless of success or failure.
      setGeneratingQuestId(null);
    }
  };

  const QuestCard = ({ quest, isLocked = false }: { quest: QuestSummary; isLocked?: boolean }) => (
    <Link
      href={isLocked ? '#' : `/quests/${quest.learningPathId}/${quest.chapterId}/${quest.id}`}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }
        // For available quests, we handle the logic in handleStartQuest instead of direct navigation
        handleStartQuest(e, quest);
      }}
      className={`quest-card group relative block transition ${
        isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <Card
        className={`relative overflow-hidden rounded-[24px] border border-white/12 bg-gradient-to-br from-[#170b1d]/92 via-[#0f0815]/96 to-[#06030a]/98 shadow-[0_20px_50px_rgba(4,0,14,0.65)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_65px_rgba(210,49,135,0.35)] ${
          quest.status === 'InProgress'
            ? 'border-accent/50'
            : quest.status === 'Completed'
            ? 'border-emerald-400/50'
            : 'border-white/12'
        }`}
      >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.25),_transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <CardContent className="relative z-10 space-y-4 p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-1 gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-lg shadow-[0_8px_20px_rgba(210,49,135,0.35)] ${
                quest.status === 'Completed' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                  : quest.status === 'InProgress' ? 'border-accent/40 bg-accent/15 text-accent'
                    : 'text-foreground/70'
              }`}>
                {quest.status === 'Completed' ? <CheckCircle className="h-7 w-7" />
                  : isLocked ? <Lock className="h-7 w-7" />
                    : <BookOpen className="h-7 w-7" />}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-semibold text-white">{quest.title}</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                  Status: {quest.status}
                </p>
              </div>
            </div>
          </div>

          {(quest.status === 'InProgress' || quest.status === 'NotStarted') && !isLocked && (
            <Button
              // The button itself no longer needs an onClick, as the parent Link handles it.
              disabled={generatingQuestId === quest.id}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 pointer-events-none" // pointer-events-none makes it not interfere with the Link's click
            >
              {generatingQuestId === quest.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {generatingQuestId === quest.id ? 'Forging Quest...' : (quest.status === 'InProgress' ? 'Continue Quest' : 'Start Quest')}
            </Button>
          )}

          {isLocked && (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs uppercase tracking-[0.35em] text-foreground/50">
              <Lock className="mr-2 inline h-3 w-3" /> Complete previous quests to unlock
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="flex flex-col gap-10 pb-24">
      <div
        ref={headerRef}
        className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-[#2b1030]/80 via-[#170a1c]/90 to-[#090614]/95 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)]"
      >
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.45),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_35%)]" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-foreground/60">
            <span>RogueLearn</span>
            <span className="text-foreground/40">/</span>
            <span className="text-foreground">Quest Chronicle</span>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-white">Guild Quest Chronicle</h1>
              <p className="text-sm uppercase tracking-[0.3em] text-foreground/60">
                Records of every delve into the arcane labyrinth
              </p>
            </div>
            <div className="flex items-center space-x-3 rounded-full border border-white/10 bg-black/30 p-2">
                <Label htmlFor="learning-mode" className="pl-2 text-xs font-semibold text-white/70">
                    Structured Path
                </Label>
                <Switch
                    id="learning-mode"
                    checked={learningMode === 'free'}
                    onCheckedChange={(checked) => setLearningMode(checked ? 'free' : 'structured')}
                />
                <Label htmlFor="learning-mode" className="pr-2 text-xs font-semibold text-white/70">
                    Free Path
                </Label>
            </div>
          </div>
          <div className="grid gap-4 text-xs uppercase tracking-[0.3em] text-foreground/60 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,184,108,0.35),_transparent_70%)]" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <Flame className="h-4 w-4" /> <span>Streak</span>
                </div>
                <p className="text-2xl font-semibold text-white">{userStats.streak} days</p>
                <p className="text-[11px] text-foreground/50">Daily runs maintained</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,173,255,0.3),_transparent_70%)]" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-blue-300">
                  <BookOpen className="h-4 w-4" /> <span>Quests Logged</span>
                </div>
                <p className="text-2xl font-semibold text-white">{userStats.totalQuests}</p>
                <p className="text-[11px] text-foreground/50">Entries in the codex</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.4),_transparent_70%)]" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4" /> <span>Total Essence</span>
                </div>
                <p className="text-2xl font-semibold text-white">{userStats.totalXP} XP</p>
                <p className="text-[11px] text-foreground/50">Harvested from victories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeQuests.length > 0 && (
        <div ref={activeQuestsRef}>
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/12 bg-gradient-to-r from-white/10 via-transparent to-transparent px-6 py-4">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent shadow-[0_0_20px_rgba(210,49,135,0.45)]">
                <Target className="h-5 w-5" />
              </div>
              Active Quests
            </h2>
            <span className="text-xs uppercase tracking-[0.35em] text-foreground/60">
              {activeQuests.length} in progress
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeQuests.map((quest) => <QuestCard key={quest.id} quest={quest} />)}
          </div>
        </div>
      )}

      {completedQuests.length > 0 && (
        <div ref={completedQuestsRef}>
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/12 bg-gradient-to-r from-green-400/15 via-transparent to-transparent px-6 py-4">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-300 shadow-[0_0_20px_rgba(134,239,172,0.45)]">
                <CheckCircle className="h-5 w-5" />
              </div>
              Completed Quests
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedQuests.map((quest) => <QuestCard key={quest.id} quest={quest} />)}
          </div>
        </div>
      )}

      {availableQuests.length > 0 && (
        <div ref={availableQuestsRef}>
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/12 bg-gradient-to-r from-blue-400/15 via-transparent to-transparent px-6 py-4">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200 shadow-[0_0_20px_rgba(96,165,250,0.45)]">
                <Sparkles className="h-5 w-5" />
              </div>
              Available Quests
            </h2>
            <span className="text-xs uppercase tracking-[0.35em] text-foreground/60">
              {availableQuests.length} ready to start
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableQuests.map((quest) => <QuestCard key={quest.id} quest={quest} isLocked={false} />)}
          </div>
        </div>
      )}

      {lockedQuests.length > 0 && (
        <div ref={lockedQuestsRef}>
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/12 bg-gradient-to-r from-gray-400/15 via-transparent to-transparent px-6 py-4">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-500/20 text-gray-300 shadow-[0_0_20px_rgba(156,163,175,0.45)]">
                <Lock className="h-5 w-5" />
              </div>
              Locked Quests
            </h2>
            <span className="text-xs uppercase tracking-[0.35em] text-foreground/60">
              {lockedQuests.length} awaiting unlock
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lockedQuests.map((quest) => <QuestCard key={quest.id} quest={quest} isLocked={true} />)}
          </div>
        </div>
      )}
    </div>
  );
}