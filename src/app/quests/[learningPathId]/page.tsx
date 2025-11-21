// roguelearn-web/src/app/quests/[learningPathId]/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import QuestlineView from "@/components/quests/QuestlineView";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { LearningPath } from "@/types/quest";

interface PageProps {
  params: Promise<{ learningPathId: string }>;
}

export default async function QuestlinePage({ params }: PageProps) {
  const { learningPathId } = await params;
  const { coreApiClient } = await createServerApiClients();
  let learningPath: LearningPath | null = null;

  try {
    // You could fetch by ID, but for now using /me is fine
    const response = await coreApiClient.get<LearningPath>('/api/learning-paths/me');
    learningPath = response.data;
  } catch (error) {
    console.error(`Failed to fetch learning path:`, error);
  }

  if (!learningPath) {
    return (
      <DashboardLayout>
        <main className="col-span-12 lg:col-span-10">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Trophy className="w-16 h-16 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">Learning Path not found.</p>
            <Button asChild variant="outline">
              <Link href="/quests">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quest Log
              </Link>
            </Button>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <QuestlineView learningPath={learningPath} />
    </DashboardLayout>
  );
}
