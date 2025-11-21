// roguelearn-web/src/components/quests/ChapterQuestListView.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, Play, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { LearningPath, QuestChapter } from "@/types/quest";

interface ChapterQuestListViewProps {
    learningPath: LearningPath;
    chapter: QuestChapter;
}

export function ChapterQuestListView({ learningPath, chapter }: ChapterQuestListViewProps) {
    const headerRef = useRef<HTMLDivElement>(null);
    const modulesRef = useRef<HTMLDivElement>(null);

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
                        <p className="text-center text-sm text-white/70 py-8">No quests have been forged for this chapter yet.</p>
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
                                        <Button asChild className="rounded-full px-5 w-40 bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]">
                                            <Link href={`/quests/${learningPath.id}/${chapter.id}/${quest.id}`}>
                                                {quest.status === 'Completed' ? (
                                                    <><CheckCircle className="mr-2 h-4 w-4" /> Review Quest</>
                                                ) : quest.status === 'InProgress' ? (
                                                    <><Play className="mr-2 h-4 w-4" /> Continue</>
                                                ) : (
                                                    <><Play className="mr-2 h-4 w-4" /> Start Quest</>
                                                )}
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
