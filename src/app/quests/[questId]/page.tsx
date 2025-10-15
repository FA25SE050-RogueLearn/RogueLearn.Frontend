import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockQuests } from "@/lib/mockData";
import QuestlineView from "@/components/quests/QuestlineView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ questId: string }>;
}

// Renders the questline (chapter list) for a specific quest
export default async function QuestlinePage({ params }: PageProps) {
  const { questId } = await params;
  
  // Find quest in all categories
  const quest = 
    mockQuests.active.find(q => q.id === questId) ||
    mockQuests.completed.find(q => q.id === questId) ||
    mockQuests.available.find(q => q.id === questId);

  if (!quest) {
    return (
      <DashboardLayout>
        <main className="col-span-12 lg:col-span-10">
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
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <QuestlineView quest={quest} />
    </DashboardLayout>
  );
}