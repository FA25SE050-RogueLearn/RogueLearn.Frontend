// roguelearn-web/src/app/quests/[learningPathId]/[chapterId]/[questId]/week/[weekNumber]/page.tsx
'use server';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ModuleLearningView } from "@/components/quests/ModuleLearningView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { QuestDetails, LearningPath } from "@/types/quest";
import WeekStepAutoRefresh from "@/components/quests/WeekStepAutoRefresh";

interface PageProps {
    params: Promise<{
        learningPathId: string;
        chapterId: string;
        questId: string;
        weekNumber: string;
    }>;
}

export default async function WeekLearningPage({ params }: PageProps) {
    const { learningPathId, chapterId, questId, weekNumber } = await params;
    const { coreApiClient } = await createServerApiClients();
    const weekNum = parseInt(weekNumber);

    let questDetails: QuestDetails | null = null;
    let learningPath: LearningPath | null = null;
    let isWeekUnlocked = false;
    let errorMessage: string | null = null;

    try {
        // Fetch all required data in parallel
        const [questResponse, pathResponse] = await Promise.all([
            coreApiClient.get<QuestDetails>(`/api/quests/${questId}`),
            coreApiClient.get<LearningPath>('/api/learning-paths/me')
        ]);

        questDetails = questResponse.data;
        learningPath = pathResponse.data;

        console.log('Quest Details:', questDetails);
        console.log('Week Number:', weekNum);

        // ⭐ FIXED: Week unlock logic based on quest steps, NOT progress API
        // We check if the current week exists in the quest
        // Week 1 is always unlocked if it exists
        // Other weeks are unlocked if the previous week exists (we don't need progress check yet)
        if (questDetails?.steps) {
            const stepForThisWeek = questDetails.steps.find(s => s.stepNumber === weekNum);

            if (stepForThisWeek) {
                // If we're here, the week exists in the quest structure
                // Week 1 is always accessible
                // For other weeks, just let them access (the actual unlock logic 
                // based on completion should be in the quest overview page)
                isWeekUnlocked = true;

                console.log(`Week ${weekNum} exists in quest, marking as unlocked`);
            } else {
                console.log(`Week ${weekNum} not found in quest steps`);
            }
        }

    } catch (error) {
        console.error(`Failed to fetch data:`, error);
        errorMessage = 'Failed to load quest data. Please try again.';
    }

    // Find the weekly step
    const weeklyStep = questDetails?.steps?.find(step => step.stepNumber === weekNum);
    const chapter = learningPath?.chapters.find(ch => ch.id === chapterId);

    // ERROR STATES

    if (!questDetails) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Trophy className="w-16 h-16 text-muted-foreground" />
                    <p className="text-xl text-muted-foreground">
                        Quest not found.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {errorMessage}
                    </p>
                    <Button asChild variant="outline">
                        <Link href={`/quests/${learningPathId}/${chapterId}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Quest
                        </Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    if (!weeklyStep) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Trophy className="w-16 h-16 text-muted-foreground" />
                    <p className="text-xl text-muted-foreground">Week {weekNum} not found.</p>
                    <WeekStepAutoRefresh questId={questId} stepNumber={weekNum} />
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/quests/${learningPathId}/${chapterId}/${questId}`}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Quest
                            </Link>
                        </Button>
                        <Button asChild variant="ghost">
                            <Link href={`/quests/${learningPathId}/${chapterId}`}>
                                Back to Chapter
                            </Link>
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!learningPath || !chapter) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Trophy className="w-16 h-16 text-muted-foreground" />
                    <p className="text-xl text-muted-foreground">
                        Learning path or chapter not found.
                    </p>
                    <Button asChild variant="outline">
                        <Link href={`/quests/${learningPathId}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Learning Path
                        </Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    // SUCCESS: Week found, render learning view
    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/quests/${learningPathId}/${chapterId}/${questId}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Quest
                        </Link>
                    </Button>
                    <Button asChild variant="ghost">
                        <Link href={`/quests/${learningPathId}/${chapterId}`}>
                            Back to Chapter
                        </Link>
                    </Button>
                </div>
            </div>
            <ModuleLearningView
                weeklyStep={weeklyStep}
                questId={questId}
                questName={questDetails.title}
                learningPathId={learningPathId}
                learningPathName={learningPath.name}
                chapterId={chapterId}
                chapterName={chapter.title}
                totalWeeks={questDetails.steps.length}
            />
        </DashboardLayout>
    );
}
