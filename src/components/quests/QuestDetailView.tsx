// roguelearn-web/src/components/quests/QuestDetailView.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, Play, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LearningPath, QuestChapter } from "@/types/quest";
import academicApi from "@/api/academicApi";

interface QuestDetailViewProps {
  learningPath: LearningPath;
  chapter: QuestChapter;
}

export function QuestDetailView({ learningPath, chapter }: QuestDetailViewProps) {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const [generatingQuestId, setGeneratingQuestId] = useState<string | null>(null);

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

  // MODIFICATION: Renamed for clarity. Its purpose is to enter the quest view.
  const handleEnterQuest = async (event: React.MouseEvent, questId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setGeneratingQuestId(questId);
    try {
      // This call is idempotent. If steps exist, it returns them. If not, it generates them.
      const response = await academicApi.generateQuestSteps(questId);
      if (response.isSuccess && response.data && response.data.length > 0) {
        // Navigate to the quest's learning view (which shows the steps).
        router.push(`/quests/${learningPath.id}/${chapter.id}/${questId}`);
      } else {
        // This handles cases where steps fail to generate.
        alert('Failed to generate or retrieve quest steps. The ancient syllabus might be missing or corrupted. Please try again.');
      }
    } catch (error) {
      console.error('Error entering quest:', error);
      alert('A mystical interference occurred while entering the quest. Please try again.');
    } finally {
      setGeneratingQuestId(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-gradient-to-br from-[#241012]/92 via-[#13080e]/95 to-[#060307]/98 p-8 pb-20 shadow-[0_32px_110px_rgba(18,5,10,0.7)]">
      <div className="relative z-10 flex flex-col gap-10">
        <section ref={headerRef}>
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="space-y-4">
              <Link href={`/quests/${learningPath.id}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-foreground/60 transition-colors hover:text-accent">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Questline
              </Link>
              <div className="text-xs uppercase tracking-[0.35em] text-foreground/60">
                {learningPath.name} <span className="text-foreground/40">/</span> Chapter {chapter.sequence}
              </div>
              <h1 className="text-4xl font-semibold text-white md:text-5xl">{chapter.title}</h1>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-foreground/60 mb-2">
                <span>Chapter Progress</span>
                <span className="font-semibold text-white">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-white/10" />
          </div>
        </section>

        <div ref={modulesRef} className="space-y-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-accent" /> Quests in this Chapter
            </h2>
            {quests.length === 0 ? (
              <p className="text-center text-sm text-foreground/70 py-8">No quests have been forged for this chapter yet.</p>
            ) : (
              quests.map((quest) => (
                <Card key={quest.id} className={`module-card overflow-hidden rounded-[20px] border transition-all duration-300 hover:border-accent/40 hover:shadow-[0_18px_45px_rgba(210,49,135,0.35)] ${quest.status === 'Completed' ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/12 bg-black/45'
                  }`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-1 items-start gap-4">
                        <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
                      </div>
                      {/* --- MODIFICATION START --- */}
                      <Button
                        onClick={(e) => handleEnterQuest(e, quest.id)}
                        // MODIFIED: Logic removed. A quest is only disabled while its steps are being generated.
                        disabled={generatingQuestId === quest.id}
                        className="rounded-full px-5 w-40" // Set a fixed width for consistency
                      >
                        {generatingQuestId === quest.id ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Forging...</>
                        ) : quest.status === 'Completed' ? (
                            <><CheckCircle className="mr-2 h-4 w-4" /> Review Quest</>
                        ) : quest.status === 'InProgress' ? (
                            <><Play className="mr-2 h-4 w-4" /> Continue</>
                        ) : (
                            <><Play className="mr-2 h-4 w-4" /> Start Quest</>
                        )}
                      </Button>
                      {/* --- MODIFICATION END --- */}
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