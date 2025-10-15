import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockQuests } from "@/lib/mockData";
import { QuestDetailView } from "@/components/quests/QuestDetailView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ questId: string; chapterId: string }>;
}

// Renders the details for a specific chapter within a quest
export default async function ChapterDetailPage({ params }: PageProps) {
  const { questId, chapterId } = await params;
  
  // Find quest in all categories
  const quest = 
    mockQuests.active.find(q => q.id === questId) ||
    mockQuests.completed.find(q => q.id === questId) ||
    mockQuests.available.find(q => q.id === questId);

  if (!quest) {
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

  // Find the specific chapter
  const chapter = quest.chapters.find(ch => ch.id === chapterId);

  // Debug logging
  console.log('ChapterDetailPage:', {
    questId,
    chapterId,
    questTitle: quest.title,
    chaptersCount: quest.chapters.length,
    chapterFound: !!chapter,
    chapterTitle: chapter?.title,
    modulesCount: chapter?.modules?.length || 0
  });

  if (!chapter) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Trophy className="w-16 h-16 text-muted-foreground" />
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

  return (
    <DashboardLayout>
      <QuestDetailView quest={quest} chapter={chapter} />
    </DashboardLayout>
  );
}
