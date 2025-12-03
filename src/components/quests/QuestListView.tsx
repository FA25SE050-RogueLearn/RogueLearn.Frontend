// roguelearn-web/src/components/quests/QuestListView.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  CheckCircle,
  Lock,
  Sparkles,
  Flame,
  Target,
} from 'lucide-react';
import { QuestSummary } from '@/types/quest';
import questApi from '@/api/questApi';
import { usePageTransition } from '@/components/layout/PageTransition';
import { useQuestGeneration } from '@/hooks/useQuestGeneration';
import QuestGenerationModal from '@/components/quests/QuestGenerationModal';
import DifficultyBadge from '@/components/quests/DifficultyBadge';

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
  const { navigateTo } = usePageTransition();
  const { startGeneration } = useQuestGeneration();

  const headerRef = useRef<HTMLDivElement | null>(null);
  const activeQuestsRef = useRef<HTMLDivElement | null>(null);
  const completedQuestsRef = useRef<HTMLDivElement | null>(null);
  const availableQuestsRef = useRef<HTMLDivElement | null>(null);
  const [generatingQuestId, setGeneratingQuestId] = useState<string | null>(null);

  // Modal state
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null);
  const [generatingQuestTitle, setGeneratingQuestTitle] = useState('');
  const [targetQuestUrl, setTargetQuestUrl] = useState<string>('');

  // In free mode, all not started quests are available.
  const availableQuests = notStartedQuests;

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
    });
    return () => ctx.revert();
  }, [availableQuests]);

  // Handle quest completion from modal
  const waitForQuestSteps = async (questId: string) => {
    for (let i = 0; i < 20; i++) {
      const res = await questApi.getQuestDetails(questId);
      if (res.isSuccess && res.data?.steps && res.data.steps.length > 0) return true;
      await new Promise(r => setTimeout(r, 800));
    }
    return false;
  };

  const handleQuestComplete = async () => {
    const questId = generatingQuestId;
    setShowGenerationModal(false);
    setGeneratingJobId(null);
    setGeneratingQuestTitle('');
    setGeneratingQuestId(null);
    if (questId) {
      await waitForQuestSteps(questId);
    }
    navigateTo(targetQuestUrl);
  };

  const handleStartQuest = async (event: React.MouseEvent, quest: QuestSummary) => {
    event.preventDefault();
    event.stopPropagation();

    const questUrl = `/quests/${quest.learningPathId}/${quest.chapterId}/${quest.id}`;
    setGeneratingQuestId(quest.id);
    setGeneratingQuestTitle(quest.title);
    setTargetQuestUrl(questUrl);

    try {
      console.log(`🔍 Checking if quest steps already exist for: ${quest.title}`);

      // ========== STEP 1: CHECK IF STEPS ALREADY EXIST ==========
      const detailsResponse = await questApi.getQuestDetails(quest.id);

      if (detailsResponse.isSuccess && detailsResponse.data?.steps && detailsResponse.data.steps.length > 0) {
        console.log(`✅ Quest steps for ${quest.title} already exist. Navigating directly.`);
        navigateTo(questUrl);
        setGeneratingQuestId(null);
        return;
      }

      console.log(`🚀 Quest steps for ${quest.title} not found. Starting background generation...`);

      // ========== STEP 2: START BACKGROUND GENERATION ==========
      const jobId = await startGeneration(quest.id);

      if (!jobId) {
        console.error('❌ Failed to start generation');
        alert('Failed to start quest generation. Please try again.');
        setGeneratingQuestId(null);
        return;
      }

      console.log(`📡 Background job started with ID: ${jobId}`);

      // Show modal and let IT handle all polling
      setGeneratingJobId(jobId);
      setShowGenerationModal(true);

    } catch (error: any) {
      console.error('❌ Error starting quest:', error);
      alert('An error occurred while starting the quest. Please try again.');
      setGeneratingQuestId(null);
      setShowGenerationModal(false);
    }
  };

  const QuestCard = ({ quest, isLocked = false }: { quest: QuestSummary; isLocked?: boolean }) => (
    <button
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }
        handleStartQuest(e, quest);
      }}
      className={`quest-card group relative block w-full text-left transition ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        }`}
    >
      <Card
        className={`relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] shadow-[0_20px_50px_rgba(4,0,14,0.65)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_65px_rgba(245,193,108,0.25)] ${quest.status === 'InProgress'
          ? 'border-[#f5c16c]/50'
          : quest.status === 'Completed'
            ? 'border-emerald-400/50'
            : 'border-[#f5c16c]/20'
          }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/asfalt-dark.png)',
            backgroundSize: '350px 350px',
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.2),_transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5c16c]/40 to-transparent" />

        <CardContent className="relative z-10 space-y-4 p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-1 gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-[0_8px_20px_rgba(245,193,108,0.25)] ${quest.status === 'Completed' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                : quest.status === 'InProgress' ? 'border-[#f5c16c]/40 bg-[#f5c16c]/15 text-[#f5c16c]'
                  : 'border-[#f5c16c]/20 bg-[#f5c16c]/5 text-white/70'
                }`}>
                {quest.status === 'Completed' ? <CheckCircle className="h-7 w-7" />
                  : isLocked ? <Lock className="h-7 w-7" />
                    : <BookOpen className="h-7 w-7" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-semibold text-white">{quest.title}</h3>

                  {quest.isRecommended && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300 border border-amber-500/40 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      {quest.recommendationReason || 'Recommended'}
                    </span>
                  )}

                  <DifficultyBadge
                    difficulty={quest.expectedDifficulty}
                    reason={quest.difficultyReason}
                    subjectGrade={quest.subjectGrade}
                    subjectStatus={quest.subjectStatus}
                  />
                </div>

                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Status: {quest.status}
                </p>
              </div>
            </div>
          </div>

          {(quest.status === 'InProgress' || quest.status === 'NotStarted') && !isLocked && (
            <div
              className="w-full h-10 flex items-center justify-center bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold rounded-full hover:shadow-lg hover:shadow-[#f5c16c]/50 transition-all duration-300"
            >
              {generatingQuestId === quest.id ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Forging...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>{quest.status === 'InProgress' ? 'Continue Quest' : 'Start Quest'}</span>
                </>
              )}
            </div>
          )}

          {isLocked && (
            <div className="rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-4 text-xs uppercase tracking-[0.35em] text-white/50">
              <Lock className="mr-2 inline h-3 w-3" /> Complete previous quests to unlock
            </div>
          )}
        </CardContent>
      </Card>
    </button>
  );

  return (
    <div className="flex flex-col gap-10 pb-24">
      <div
        ref={headerRef}
        className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/asfalt-dark.png)',
            backgroundSize: '350px 350px',
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.25),_transparent_70%)]" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/50">
            <span className="text-[#f5c16c]">RogueLearn</span>
            <span className="text-white/30">/</span>
            <span className="text-white/70">Quest Chronicle</span>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-white">Guild Quest Chronicle</h1>
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                Records of every delve into the arcane labyrinth
              </p>
            </div>
          </div>
          <div className="grid gap-4 text-xs uppercase tracking-[0.3em] text-white/60 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-5">
              <div
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage: 'url(/images/asfalt-dark.png)',
                  backgroundSize: '350px 350px',
                  backgroundRepeat: 'repeat'
                }}
              />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.35),_transparent_70%)]" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-[#f5c16c]">
                  <Flame className="h-4 w-4" /> <span>Streak</span>
                </div>
                <p className="text-2xl font-semibold text-white">{userStats.streak} days</p>
                <p className="text-[11px] text-white/50">Daily runs maintained</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-5">
              <div
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage: 'url(/images/asfalt-dark.png)',
                  backgroundSize: '350px 350px',
                  backgroundRepeat: 'repeat'
                }}
              />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.25),_transparent_70%)]" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-[#f5c16c]">
                  <BookOpen className="h-4 w-4" /> <span>Quests Logged</span>
                </div>
                <p className="text-2xl font-semibold text-white">{userStats.totalQuests}</p>
                <p className="text-[11px] text-white/50">Entries in the codex</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-5">
              <div
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage: 'url(/images/asfalt-dark.png)',
                  backgroundSize: '350px 350px',
                  backgroundRepeat: 'repeat'
                }}
              />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.3),_transparent_70%)]" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-[#f5c16c]">
                  <Sparkles className="h-4 w-4" /> <span>Total Essence</span>
                </div>
                <p className="text-2xl font-semibold text-white">{userStats.totalXP} XP</p>
                <p className="text-[11px] text-white/50">Harvested from victories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeQuests.length > 0 && (
        <div ref={activeQuestsRef}>
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-r from-[#f5c16c]/10 via-transparent to-transparent px-6 py-4">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5c16c]/20 text-[#f5c16c] shadow-[0_0_20px_rgba(245,193,108,0.35)]">
                <Target className="h-5 w-5" />
              </div>
              Active Quests
            </h2>
            <span className="text-xs uppercase tracking-[0.35em] text-white/60">
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
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-400/10 via-transparent to-transparent px-6 py-4">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(134,239,172,0.35)]">
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
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-r from-[#f5c16c]/10 via-transparent to-transparent px-6 py-4">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5c16c]/20 text-[#f5c16c] shadow-[0_0_20px_rgba(245,193,108,0.35)]">
                <Sparkles className="h-5 w-5" />
              </div>
              Available Quests
            </h2>
            <span className="text-xs uppercase tracking-[0.35em] text-white/60">
              {availableQuests.length} ready to start
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableQuests.map((quest) => <QuestCard key={quest.id} quest={quest} isLocked={false} />)}
          </div>
        </div>
      )}

      <QuestGenerationModal
        isOpen={showGenerationModal}
        jobId={generatingJobId}
        questTitle={generatingQuestTitle}
        onClose={() => {
          setShowGenerationModal(false);
          setGeneratingJobId(null);
          setGeneratingQuestTitle('');
          setGeneratingQuestId(null);
        }}
        onComplete={handleQuestComplete}
      />
    </div>
  );
}