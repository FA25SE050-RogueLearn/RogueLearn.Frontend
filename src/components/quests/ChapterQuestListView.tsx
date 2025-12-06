// roguelearn-web/src/components/quests/ChapterQuestListView.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, Play, BookOpen, ChevronRight, Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { LearningPath, QuestChapter, QuestSummary } from "@/types/quest";
import DifficultyBadge from "@/components/quests/DifficultyBadge";
import { useRouter } from "next/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { GraduationCap, TrendingUp, TrendingDown, Minus, Clock, Sparkles } from "lucide-react";

interface ChapterQuestListViewProps {
    learningPath: LearningPath;
    chapter: QuestChapter;
}

export function ChapterQuestListView({ learningPath, chapter }: ChapterQuestListViewProps) {
    const headerRef = useRef<HTMLDivElement>(null);
    const modulesRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

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
    }, [chapter.sequence]);

    const handleStartQuest = (quest: QuestSummary) => {
        router.push(`/quests/${quest.id}`);
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
                            <Link href="/quests" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/60 transition-colors hover:text-[#f5c16c]">
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Quests
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
                            <p className="text-center text-sm text-white/70">No quests available for this chapter yet.</p>
                        </div>
                    ) : (
                        quests.map((quest) => {
                            const subjectCode = quest.subjectCode || quest.title.match(/^([A-Z]{2,4}\d{2,3}[a-z]?)/i)?.[1]?.toUpperCase();
                            const subjectName = quest.title.includes(':') 
                                ? quest.title.substring(quest.title.indexOf(':') + 1).trim().split('_')[0].trim()
                                : quest.title;
                            
                            const getGradeColor = (grade: string | undefined | null) => {
                                if (!grade || grade === 'N/A') return { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-300', Icon: Minus };
                                const score = parseFloat(grade);
                                if (isNaN(score)) return { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-300', Icon: Minus };
                                if (score >= 8.5) return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-300', Icon: TrendingUp };
                                if (score >= 7.0) return { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-300', Icon: TrendingUp };
                                if (score >= 5.0) return { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-300', Icon: Minus };
                                return { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-300', Icon: TrendingDown };
                            };
                            
                            const getStatusInfo = (status: string | undefined) => {
                                switch (status) {
                                    case 'Passed': return { label: 'Passed', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', Icon: CheckCircle };
                                    case 'NotPassed': return { label: 'Failed', bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', Icon: TrendingDown };
                                    case 'Studying': return { label: 'Studying', bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-400', Icon: Clock };
                                    default: return { label: 'Not Started', bg: 'bg-slate-500/15', border: 'border-slate-500/30', text: 'text-slate-400', Icon: BookOpen };
                                }
                            };
                            
                            const gradeInfo = getGradeColor(quest.subjectGrade);
                            const statusInfo = getStatusInfo(quest.subjectStatus);
                            const GradeIcon = gradeInfo.Icon;
                            const StatusIcon = statusInfo.Icon;
                            
                            return (
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
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    {subjectCode && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/30 text-[#f5c16c] text-sm font-bold tracking-wide">
                                                            <GraduationCap className="h-3.5 w-3.5" />
                                                            {subjectCode}
                                                        </span>
                                                    )}
                                                    <h3 className="text-lg font-semibold text-white">{subjectName}</h3>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <TooltipProvider>
                                                        <Tooltip delayDuration={200}>
                                                            <TooltipTrigger asChild>
                                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${gradeInfo.bg} ${gradeInfo.border}`}>
                                                                    <GradeIcon className={`h-3.5 w-3.5 ${gradeInfo.text}`} />
                                                                    <span className={`text-sm font-bold ${gradeInfo.text}`}>
                                                                        {quest.subjectGrade || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-slate-900 border-slate-700">
                                                                <p className="text-sm">
                                                                    {quest.subjectGrade && quest.subjectGrade !== 'N/A'
                                                                        ? `Your grade: ${quest.subjectGrade}/10`
                                                                        : 'No grade recorded'}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    
                                                    <TooltipProvider>
                                                        <Tooltip delayDuration={200}>
                                                            <TooltipTrigger asChild>
                                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${statusInfo.bg} ${statusInfo.border}`}>
                                                                    <StatusIcon className={`h-3.5 w-3.5 ${statusInfo.text}`} />
                                                                    <span className={`text-xs font-medium ${statusInfo.text}`}>
                                                                        {statusInfo.label}
                                                                    </span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-slate-900 border-slate-700">
                                                                <p className="text-sm">{quest.difficultyReason || 'Academic status'}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    
                                                    <DifficultyBadge
                                                        difficulty={quest.expectedDifficulty}
                                                        reason={quest.difficultyReason}
                                                        subjectGrade={quest.subjectGrade}
                                                        subjectStatus={quest.subjectStatus}
                                                        size="sm"
                                                    />
                                                    
                                                    {quest.isRecommended && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30 animate-pulse">
                                                            <Sparkles className="h-3 w-3" /> Priority
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleStartQuest(quest)}
                                            className="rounded-full px-5 w-44 bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                                        >
                                            {quest.status === 'Completed' ? (
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
                        );})
                    )}

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
                                            Test your mastery with a boss fight! Face {totalQuests} challenging questions to prove you&apos;ve conquered this chapter.
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-fuchsia-300">
                                            <Swords className="h-4 w-4" />
                                            <span>Mock Exam Mode - {totalQuests} Questions</span>
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
            </div>
        </div>
    );
}
