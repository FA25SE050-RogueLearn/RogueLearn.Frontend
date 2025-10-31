import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QuestDetailView } from "@/components/quests/QuestDetailView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { LearningPath } from "@/types/quest";

interface PageProps {
  params: Promise<{ questId: string; chapterId: string }>;
}

export default async function ChapterDetailPage({ params }: PageProps) {
  const { questId: learningPathId, chapterId } = await params;
  const { coreApiClient } = await createServerApiClients();
  let learningPath: LearningPath | null = null;

  try {
    const response = await coreApiClient.get<LearningPath>('/api/learning-paths/me');
    learningPath = response.data;
  } catch (error) {
    console.error(`Failed to fetch learning path for Chapter Detail page:`, error);
  }

  const chapter = learningPath?.chapters.find(ch => ch.id === chapterId);

  if (!learningPath || !chapter) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Trophy className="w-16 h-16 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Chapter not found.</p>
          <Button asChild variant="outline">
            <Link href={`/quests/${learningPathId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questline
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <QuestDetailView learningPath={learningPath} chapter={chapter} />
    </DashboardLayout>
  );
}
