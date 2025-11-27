// roguelearn-web/src/components/quests/QuestlineView.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BookOpen,
  CheckCircle,
  Lock,
  Play,
  Sparkles,
  Map,
  ChevronRight,
  Trophy,
  ArrowLeft
} from 'lucide-react';
import { LearningPath, QuestSummary } from '@/types/quest';
import { usePageTransition } from '@/components/layout/PageTransition';
import { useQuestGeneration } from '@/hooks/useQuestGeneration';
import QuestGenerationModal from '@/components/quests/QuestGenerationModal';
import questApi from '@/api/questApi';

interface QuestlineViewProps {
  learningPath: LearningPath;
}

const LEARNING_MODE_STORAGE_KEY = 'roguelearn_learning_mode';

export default function QuestlineView({ learningPath }: QuestlineViewProps) {
  const { navigateTo } = usePageTransition();
  const { startGeneration } = useQuestGeneration();

  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Generation Modal State
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null);
  const [generatingQuestTitle, setGeneratingQuestTitle] = useState('');
  const [targetQuestUrl, setTargetQuestUrl] = useState<string>('');
  const [generatingQuestId, setGeneratingQuestId] = useState<string | null>(null);

  // Learning Mode State (Structured vs Free)
  const [learningMode, setLearningMode] = useState<'structured' | 'free'>('structured');

  // Load saved preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedMode = localStorage.getItem(LEARNING_MODE_STORAGE_KEY) as 'structured' | 'free' | null;
      if (savedMode && (savedMode === 'structured' || savedMode === 'free')) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLearningMode(savedMode);
      }
    } catch (error) {
      console.error('Failed to load learning mode:', error);
    }
  }, []);

  const handleLearningModeChange = (checked: boolean) => {
    const newMode = checked ? 'free' : 'structured';
    setLearningMode(newMode);
    try {
      localStorage.setItem(LEARNING_MODE_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Failed to save learning mode:', error);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0, y: -20, duration: 0.6, ease: "power2.out"
        });
      }

      if (timelineRef.current) {
        const chapters = timelineRef.current.querySelectorAll('.chapter-section');
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
    });

    // Auto-scroll to active chapter on mount
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

  const handleStartQuest = async (quest: QuestSummary, chapterId: string) => {
    const questUrl = `/quests/${learningPath.id}/${chapterId}/${quest.id}`;
    setGeneratingQuestId(quest.id);
    setGeneratingQuestTitle(quest.title);
    setTargetQuestUrl(questUrl);

    try {
      // 1. Check if steps exist
      const detailsResponse = await questApi.getQuestDetails(quest.id);

      if (detailsResponse.isSuccess && detailsResponse.data?.steps && detailsResponse.data.steps.length > 0) {
        navigateTo(questUrl);
        setGeneratingQuestId(null);
        return;
      }

      // 2. Start generation if needed
      const jobId = await startGeneration(quest.id);
      if (!jobId) {
        alert('Failed to start quest generation.');
        setGeneratingQuestId(null);
        return;
      }

      setGeneratingJobId(jobId);
      setShowGenerationModal(true);
    } catch (error) {
      console.error('Error starting quest:', error);
      setGeneratingQuestId(null);
    }
  };

  // Determine global progress
  const totalQuests = learningPath.chapters.reduce((acc, ch) => acc + ch.quests.length, 0);
  const completedQuestsCount = learningPath.chapters.reduce(
    (acc, ch) => acc + ch.quests.filter(q => q.status === 'Completed').length,
    0
  );
  const overallProgress = totalQuests > 0 ? (completedQuestsCount / totalQuests) * 100 : 0;

  // Helper to determine if a chapter is locked
  const isChapterLocked = (chapterIndex: number) => {
    if (learningMode === 'free') return false; // Free mode unlocks all
    if (chapterIndex === 0) return false;
    const prevChapter = learningPath.chapters[chapterIndex - 1];
    return prevChapter.status !== 'Completed';
  };

  // Helper to determine active chapter index for scrolling
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
              <div className="flex items-center space-x-3 rounded-full border border-[#f5c16c]/20 bg-black/40 p-2 w-fit">
                <Label htmlFor="learning-mode" className={`pl-2 text-xs font-semibold ${learningMode === 'structured' ? 'text-[#f5c16c]' : 'text-white/50'}`}>
                  Structured Path
                </Label>
                <Switch
                  id="learning-mode"
                  checked={learningMode === 'free'}
                  onCheckedChange={handleLearningModeChange}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#f5c16c] data-[state=checked]:to-[#d4a855]"
                />
                <Label htmlFor="learning-mode" className={`pr-2 text-xs font-semibold ${learningMode === 'free' ? 'text-[#f5c16c]' : 'text-white/50'}`}>
                  Free Path
                </Label>
              </div>
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
        {/* Vertical Line */}
        <div className="absolute top-4 bottom-0 left-4 md:left-8 w-0.5 bg-gradient-to-b from-[#f5c16c]/50 via-[#f5c16c]/20 to-transparent" />

        <div className="space-y-16">
          {learningPath.chapters.map((chapter, index) => {
            const isLockedChapter = isChapterLocked(index);
            const isActiveChapter = index === targetChapterIndex;
            const chapterProgress = chapter.quests.length > 0
              ? (chapter.quests.filter(q => q.status === 'Completed').length / chapter.quests.length) * 100
              : 0;

            return (
              <div
                key={chapter.id}
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
                  {chapter.quests.map((quest, qIndex) => {
                    // Logic to determine if a specific quest is locked
                    // In free mode: nothing is locked.
                    // In structured mode: locked if chapter is locked OR previous quest in chapter not done.
                    let isQuestLocked = false;

                    if (learningMode === 'structured') {
                      if (isLockedChapter) {
                        isQuestLocked = true;
                      } else if (qIndex > 0 && chapter.quests[qIndex - 1].status !== 'Completed' && quest.status === 'NotStarted') {
                        isQuestLocked = true;
                      }
                    }

                    const isQuestActive = quest.status === 'InProgress';

                    return (
                      <Card
                        key={quest.id}
                        className={`group relative overflow-hidden rounded-[24px] border transition-all duration-300
                          ${isQuestLocked
                            ? 'border-white/5 bg-white/5'
                            : quest.status === 'Completed'
                              ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-black hover:border-emerald-500/50'
                              : isQuestActive
                                ? 'border-[#f5c16c]/60 bg-gradient-to-br from-[#2d1810] to-black shadow-[0_0_30px_rgba(245,193,108,0.15)]'
                                : 'border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/80 to-black hover:border-[#f5c16c]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,193,108,0.15)]'
                          }`}
                      >
                        {/* Texture */}
                        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url(/images/asfalt-dark.png)' }} />

                        <CardContent className="p-5 flex flex-col h-full gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border 
                              ${isQuestLocked ? 'border-white/10 bg-white/5 text-white/20' :
                                quest.status === 'Completed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                                  'border-[#f5c16c]/30 bg-[#f5c16c]/10 text-[#f5c16c]'}`}
                            >
                              {quest.status === 'Completed' ? <Trophy className="h-5 w-5" /> :
                                isQuestLocked ? <Lock className="h-5 w-5" /> :
                                  <BookOpen className="h-5 w-5" />}
                            </div>
                            {quest.isRecommended && !isQuestLocked && quest.status !== 'Completed' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30 animate-pulse">
                                <Sparkles className="h-3 w-3" /> Recommended
                              </span>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg leading-tight mb-1 ${isQuestLocked ? 'text-white/40' : 'text-white'}`}>
                              {quest.title}
                            </h3>
                            <p className="text-xs text-white/40 uppercase tracking-wider">
                              Quest {chapter.sequence}.{quest.sequenceOrder}
                            </p>
                          </div>

                          <div className="mt-auto pt-2">
                            {isQuestLocked ? (
                              <Button disabled variant="ghost" className="w-full justify-start pl-0 text-white/30 hover:bg-transparent cursor-not-allowed">
                                <Lock className="mr-2 h-4 w-4" /> Locked
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleStartQuest(quest, chapter.id)}
                                disabled={generatingQuestId === quest.id}
                                className={`w-full justify-between group-hover:pl-6 transition-all duration-300
                                  ${quest.status === 'Completed'
                                    ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                    : 'bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:shadow-lg'}`}
                              >
                                {generatingQuestId === quest.id ? 'Forging...' :
                                  quest.status === 'Completed' ? 'Review Quest' :
                                    quest.status === 'InProgress' ? 'Continue' : 'Start Quest'}
                                <ChevronRight className="h-4 w-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
