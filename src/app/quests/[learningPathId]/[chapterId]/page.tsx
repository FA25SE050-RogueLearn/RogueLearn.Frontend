// roguelearn-web/src/app/quests/[learningPathId]/[chapterId]/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChapterQuestListView } from "@/components/quests/ChapterQuestListView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { LearningPath } from "@/types/quest";
import { revalidatePath } from "next/cache";

interface PageProps {
  params: Promise<{ learningPathId: string; chapterId: string }>;
}

export default async function ChapterDetailPage({ params }: PageProps) {
  const { learningPathId, chapterId } = await params;
  const { coreApiClient } = await createServerApiClients();
  let learningPath: LearningPath | null = null;

  try {
    const response = await coreApiClient.get<LearningPath>('/api/learning-paths/me');
    learningPath = response.data;
  } catch (error) {
    console.error(`Failed to fetch learning path:`, error);
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

  const generateFirstQuest = async () => {
    "use server";
    const { coreApiClient } = await createServerApiClients();
    try {
      await coreApiClient.post(`/api/chapters/${chapterId}/quests/generate`);
    } catch (error) {
      console.error('Failed to generate first quest for chapter:', error);
    }
    revalidatePath(`/quests/${learningPathId}/${chapterId}`);
  };

  return (
    <DashboardLayout>
      <ChapterQuestListView
        learningPath={learningPath}
        chapter={chapter}
        onGenerateFirstQuest={generateFirstQuest}
      />
    </DashboardLayout>
  );
}
