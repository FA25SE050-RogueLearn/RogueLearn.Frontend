// roguelearn-web/src/components/quests/ChapterQuestListView.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, Play, BookOpen, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { LearningPath, QuestChapter, QuestSummary } from "@/types/quest";
import { useQuestGeneration } from "@/hooks/useQuestGeneration";
import questApi from "@/api/questApi";
import QuestGenerationModal from "@/components/quests/QuestGenerationModal";
import { useRouter } from "next/navigation";

interface ChapterQuestListViewProps {
    learningPath: LearningPath;
    chapter: QuestChapter;
    onGenerateFirstQuest?: () => Promise<void>;
}

export function ChapterQuestListView({ learningPath, chapter, onGenerateFirstQuest }: ChapterQuestListViewProps) {
    const headerRef = useRef<HTMLDivElement>(null);
    const modulesRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { startGeneration } = useQuestGeneration();
    const [showGenerationModal, setShowGenerationModal] = useState(false);
    const [generatingJobId, setGeneratingJobId] = useState<string | null>(null);
    const [generatingQuestTitle, setGeneratingQuestTitle] = useState('');
    const [targetQuestUrl, setTargetQuestUrl] = useState<string>('');
    const [generatingQuestId, setGeneratingQuestId] = useState<string | null>(null);
    const [isGeneratingFirstQuest, setIsGeneratingFirstQuest] = useState(false);

    const quests = chapter.quests || [];
    const completedQuests = quests.filter(q => q.status === 'Completed').length;
    const totalQuests = quests.length;
    const progressPercentage = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (headerRef.current) {
                gsap.from(headerRef.current.children, {
                    opacity: 0, y: -30, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "all"
                });
            }
            if (modulesRef.current) {
                const cards = modulesRef.current.querySelectorAll('.module-card');
                if (cards.length > 0) {
                    gsap.from(cards, {
                        opacity: 0, x: -30, duration: 0.5, stagger: 0.08, delay: 0.3, ease: "power2.out", clearProps: "all"
                    });
                }
            }
        });
        return () => ctx.revert();
    }, [chapter.id]);

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
        router.push(targetQuestUrl);
    };

    const handleStartQuest = async (quest: QuestSummary) => {
        const questUrl = `/quests/${learningPath.id}/${chapter.id}/${quest.id}`;
        setGeneratingQuestId(quest.id);
        setGeneratingQuestTitle(quest.title);
        setTargetQuestUrl(questUrl);

        try {
            const detailsResponse = await questApi.getQuestDetails(quest.id);
            if (detailsResponse.isSuccess && detailsResponse.data?.steps && detailsResponse.data.steps.length > 0) {
                router.push(questUrl);
                setGeneratingQuestId(null);
                return;
            }

            const jobId = await startGeneration(quest.id);
            if (!jobId) {
                setGeneratingQuestId(null);
                return;
            }

            setGeneratingJobId(jobId);
            setShowGenerationModal(true);
        } catch (error) {
            setGeneratingQuestId(null);
        }
    };

    const handleGenerateFirstQuest = async () => {
        if (!onGenerateFirstQuest) return;
        try {
            setIsGeneratingFirstQuest(true);
            await onGenerateFirstQuest();
            router.refresh();
        } finally {
            setIsGeneratingFirstQuest(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-8 pb-20 shadow-[0_32px_110px_rgba(18,5,10,0.7)]">
            <div
                className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                style={{
                    backgroundImage: 'url(/images/asfalt-dark.png)',
                    backgroundSize: '350px 350px',
                    backgroundRepeat: 'repeat'
                }}
            />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.25),_transparent_70%)]" />

            <div className="relative z-10 flex flex-col gap-10">
                <section ref={headerRef}>
                    <div className="flex flex-wrap items-start justify-between gap-8">
                        <div className="space-y-4">
                            <Link href={`/quests/${learningPath.id}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/60 transition-colors hover:text-[#f5c16c]">
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Questline
                            </Link>
                            <div className="text-xs uppercase tracking-[0.35em] text-white/60">
                                {learningPath.name} <span className="text-white/40">/</span> Chapter {chapter.sequence}
                            </div>
                            <h1 className="text-4xl font-semibold text-white md:text-5xl">{chapter.title}</h1>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/60 mb-2">
                            <span>Chapter Progress</span>
                            <span className="font-semibold text-white">{progressPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#f5c16c] [&>div]:to-[#d4a855]" />
                    </div>
                </section>

                <div ref={modulesRef} className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-4">
                        <BookOpen className="h-6 w-6 text-[#f5c16c]" /> Quests in this Chapter
                    </h2>
                    {quests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-12">
                            <p className="text-center text-sm text-white/70">No quests have been forged for this chapter yet.</p>
                            <Button
                                onClick={handleGenerateFirstQuest}
                                disabled={isGeneratingFirstQuest}
                                className="rounded-full px-6 bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                            >
                                {isGeneratingFirstQuest ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Forging...</>
                                ) : (
                                    <><Sparkles className="mr-2 h-4 w-4" /> Forge First Quest</>
                                )}
                            </Button>
                        </div>
                    ) : (
                        quests.map((quest) => (
                            <Card key={quest.id} className={`module-card relative overflow-hidden rounded-[28px] border transition-all duration-300 hover:border-[#f5c16c]/40 hover:shadow-[0_18px_45px_rgba(245,193,108,0.25)] ${quest.status === 'Completed' ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-[#f5c16c]/20 bg-black/40'
                                }`}>
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                                    style={{
                                        backgroundImage: 'url(/images/asfalt-dark.png)',
                                        backgroundSize: '350px 350px',
                                        backgroundRepeat: 'repeat'
                                    }}
                                />
                                <CardContent className="relative z-10 p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-1 items-start gap-4">
                                            <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
                                        </div>
                                        <Button
                                            onClick={() => handleStartQuest(quest)}
                                            disabled={generatingQuestId === quest.id}
                                            className="rounded-full px-5 w-44 bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                                        >
                                            {generatingQuestId === quest.id ? (
                                                <>Forging...<ChevronRight className="ml-2 h-4 w-4 opacity-60" /></>
                                            ) : quest.status === 'Completed' ? (
                                                <><CheckCircle className="mr-2 h-4 w-4" /> Review Quest</>
                                            ) : quest.status === 'InProgress' ? (
                                                <><Play className="mr-2 h-4 w-4" /> Continue</>
                                            ) : (
                                                <><Play className="mr-2 h-4 w-4" /> Start Quest</>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}

                    {/* Boss Fight Option - Show when chapter is completed */}
                    {progressPercentage === 100 && (
                        <Card className="module-card relative overflow-hidden rounded-[28px] border-2 border-violet-500/60 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-violet-500/20 shadow-[0_0_40px_rgba(168,85,247,0.4)] animate-pulse-slow">
                            <div
                                className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"
                                style={{
                                    backgroundImage: 'url(/images/asfalt-dark.png)',
                                    backgroundSize: '350px 350px',
                                    backgroundRepeat: 'repeat'
                                }}
                            />
                            <CardContent className="relative z-10 p-8">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Trophy className="h-8 w-8 text-amber-400" />
                                            <h3 className="text-2xl font-bold text-white">Chapter Complete!</h3>
                                        </div>
                                        <p className="text-white/80 text-sm">
                                            Test your mastery with a boss fight! Face {totalQuests} challenging questions to prove you've conquered this chapter.
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-fuchsia-300">
                                            <Swords className="h-4 w-4" />
                                            <span>Mock Exam Mode • {totalQuests} Questions</span>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        className="rounded-full px-8 py-6 text-lg font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 text-white hover:from-violet-600 hover:via-fuchsia-600 hover:to-violet-600 shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all"
                                    >
                                        <Link href={`/boss-fight?chapterId=${chapter.id}`}>
                                            <Swords className="mr-2 h-5 w-5" />
                                            Fight Boss
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
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
        </div>
    );
}
