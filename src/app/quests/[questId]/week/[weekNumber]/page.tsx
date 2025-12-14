// roguelearn-web/src/app/quests/[questId]/week/[weekNumber]/page.tsx
'use server';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ModuleLearningView } from "@/components/quests/ModuleLearningView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { QuestDetails, LearningPath } from "@/types/quest";
import { normalizeQuestDetails } from "@/lib/normalizeActivities";

interface PageProps {
    params: Promise<{
        questId: string;
        weekNumber: string;
    }>;
}

// Helper to safely fetch with error handling (404/403 returns null)
async function safeFetch<T>(promise: Promise<{ data: T }>): Promise<T | null> {
    try {
        const response = await promise;
        return response.data;
    } catch (error) {
        return null;
    }
}

export default async function WeekLearningPage({ params }: PageProps) {
    const { questId, weekNumber } = await params;
    const { coreApiClient } = await createServerApiClients();
    const weekNum = parseInt(weekNumber);

    // Ensure quest is started before fetching data (idempotent - safe to call multiple times)
    await safeFetch(coreApiClient.post(`/api/quests/${questId}/start`));

    // Fetch data in parallel with safe error handling
    const [rawQuestDetails, learningPath] = await Promise.all([
        safeFetch(coreApiClient.get<QuestDetails>(`/api/quests/${questId}`)),
        safeFetch(coreApiClient.get<LearningPath>('/api/learning-paths/me'))
    ]);

    // Normalize quest details to handle both camelCase and PascalCase activity properties
    const questDetails = rawQuestDetails ? normalizeQuestDetails(rawQuestDetails) : null;

    // Find chapter name from learning path
    let chapterName = '';
    if (learningPath && questDetails) {
        for (const chapter of learningPath.chapters) {
            const quest = chapter.quests.find(q => q.id === questId);
            if (quest) {
                chapterName = chapter.title;
                break;
            }
        }
    }

    const weeklyStep = questDetails?.steps?.find((step: { stepNumber: number; }) => step.stepNumber === weekNum);

    if (!questDetails) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Trophy className="w-16 h-16 text-muted-foreground" />
                    <p className="text-xl text-muted-foreground">Quest not found.</p>
                    <Button asChild variant="outline">
                        <Link href="/quests">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Quests
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
                    <p className="text-sm text-muted-foreground">
                        This week&apos;s content may not be available yet.
                    </p>
                    <Button asChild variant="outline">
                        <Link href={`/quests/${questId}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Quest
                        </Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-4">
                <Button asChild variant="outline">
                    <Link href={`/quests/${questId}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Quest
                    </Link>
                </Button>
            </div>
            <ModuleLearningView
                weeklyStep={weeklyStep}
                questId={questId}
                questName={questDetails.title}
                learningPathName={learningPath?.name}
                chapterName={chapterName}
                totalWeeks={questDetails.steps.length}
            />
        </DashboardLayout>
    );
}
