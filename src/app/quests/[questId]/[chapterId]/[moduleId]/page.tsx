import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ModuleLearningView } from "@/components/quests/ModuleLearningView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { QuestDetails, LearningPath } from "@/types/quest";

interface PageProps {
  params: Promise<{ questId: string; chapterId: string; moduleId: string }>;
}

export default async function ModuleLearningPage({ params }: PageProps) {
  const { questId: learningPathId, chapterId, moduleId: questId } = await params;
  const { coreApiClient } = await createServerApiClients();

  let questDetails: QuestDetails | null = null;
  let learningPath: LearningPath | null = null;

  try {
    const [questDetailsResponse, learningPathResponse] = await Promise.all([
      coreApiClient.get<QuestDetails>(`/api/quests/${questId}`),
      coreApiClient.get<LearningPath>('/api/learning-paths/me')
    ]);
    questDetails = questDetailsResponse.data;
    learningPath = learningPathResponse.data;
  } catch (error) {
    console.error(`Failed to fetch data for quest ${questId}:`, error);
  }

  const chapter = learningPath?.chapters.find(ch => ch.id === chapterId);

  if (!questDetails || !learningPath || !chapter) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Trophy className="w-16 h-16 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Quest content not found.</p>
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

  return (
    <DashboardLayout>
      <ModuleLearningView
        learningPath={learningPath}
        chapter={chapter}
        questDetails={questDetails}
      />
    </DashboardLayout>
  );
}
