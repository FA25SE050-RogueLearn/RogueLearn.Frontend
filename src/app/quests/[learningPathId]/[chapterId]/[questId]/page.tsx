// roguelearn-web/src/app/quests/[learningPathId]/[chapterId]/[questId]/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QuestDetailView } from "@/components/quests/QuestDetailView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { QuestDetails, LearningPath } from "@/types/quest";

interface PageProps {
  params: Promise<{ learningPathId: string; chapterId: string; questId: string }>;
}

export default async function QuestOverviewPage({ params }: PageProps) {
  const { learningPathId, chapterId, questId } = await params;
  const { coreApiClient } = await createServerApiClients();

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
    console.error(`Failed to fetch quest ${questId}:`, error);
  }

  const chapter = learningPath?.chapters.find(ch => ch.id === chapterId);

  if (!questDetails || !learningPath || !chapter) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Trophy className="w-16 h-16 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Quest not found.</p>
          <Button asChild variant="outline">
            <Link href={`/quests/${learningPathId}/${chapterId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chapter
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // TODO: Fetch user's progress
  const completedSteps: number[] = [];
  const currentStepNumber = 1;

  return (
    <DashboardLayout>
      <QuestDetailView
        questDetails={questDetails}
        learningPathId={learningPathId}
        learningPathName={learningPath.name}
        chapterId={chapterId}
        chapterName={chapter.title}
        completedSteps={completedSteps}
        currentStepNumber={currentStepNumber}
      />
    </DashboardLayout>
  );
}
