import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockQuests } from "@/lib/mockData";
import { ModuleLearningView } from "@/components/quests/ModuleLearningView";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ questId: string; chapterId: string; moduleId: string }>;
}

export default async function ModuleLearningPage({ params }: PageProps) {
  const { questId, chapterId, moduleId } = await params;
  
  // Find quest
  const quest = 
    mockQuests.active.find(q => q.id === questId) ||
    mockQuests.completed.find(q => q.id === questId) ||
    mockQuests.available.find(q => q.id === questId);

  if (!quest) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
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

  // Find chapter
  const chapter = quest.chapters.find(ch => ch.id === chapterId);

  if (!chapter) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-xl text-muted-foreground">Chapter not found.</p>
          <Button asChild variant="outline">
            <Link href={`/quests/${questId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questline
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Find module
  const currentModule = chapter.modules?.find(m => m.id === moduleId);

  if (!currentModule) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-xl text-muted-foreground">Module not found.</p>
          <Button asChild variant="outline">
            <Link href={`/quests/${questId}/${chapterId}`}>
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
        quest={quest}
        chapter={chapter}
        module={currentModule}
      />
    </DashboardLayout>
  );
}
