// roguelearn-web/src/app/quests/[learningPathId]/[chapterId]/[questId]/week/[weekNumber]/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ModuleLearningView } from "@/components/quests/ModuleLearningView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { QuestDetails, LearningPath } from "@/types/quest";

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

    try {
        const [questResponse, pathResponse] = await Promise.all([
            coreApiClient.get<QuestDetails>(`/api/quests/${questId}`),
            coreApiClient.get<LearningPath>('/api/learning-paths/me')
        ]);
        questDetails = questResponse.data;
        learningPath = pathResponse.data;
    } catch (error) {
        console.error(`Failed to fetch data:`, error);
    }

    const weeklyStep = questDetails?.steps?.find(step => step.stepNumber === weekNum);
    const chapter = learningPath?.chapters.find(ch => ch.id === chapterId);

    if (!questDetails || !weeklyStep || !learningPath || !chapter) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Trophy className="w-16 h-16 text-muted-foreground" />
                    <p className="text-xl text-muted-foreground">
                        {!questDetails ? 'Quest not found.' : `Week ${weekNum} not found.`}
                    </p>
                    <Button asChild variant="outline">
                        <Link href={`/quests/${learningPathId}/${chapterId}/${questId}`}>
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
