// roguelearn-web/src/app/quests/[questId]/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { QuestDetails, LearningPath } from "@/types/quest";
import QuestDetailView from "@/components/quests/QuestDetailView";
import { normalizeQuestDetails } from "@/lib/normalizeActivities";

interface PageProps {
  params: Promise<{ questId: string }>;
}

// What we pass to QuestDetailView
interface QuestProgress {
  questId: string;
  questStatus: 'NotStarted' | 'InProgress' | 'Completed';
  stepStatuses: Record<string, 'NotStarted' | 'InProgress' | 'Completed'>;
}

// What the API actually returns - an array of step progress objects
interface StepProgressItem {
  stepId: string;
  stepNumber: number;
  title: string;
  difficultyVariant: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  isLocked: boolean;
  completedActivitiesCount: number;
  totalActivitiesCount: number;
}

// Helper to safely fetch with error handling
async function safeFetch<T>(promise: Promise<{ data: T }>): Promise<T | null> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    return null;
  }
}

export default async function QuestOverviewPage({ params }: PageProps) {
  const { questId } = await params;
  const { coreApiClient } = await createServerApiClients();

  // Fetch all data in parallel, but handle errors individually
  const [rawQuestDetails, learningPath, progressData] = await Promise.all([
    safeFetch(coreApiClient.get<QuestDetails>(`/api/quests/${questId}`)),
    safeFetch(coreApiClient.get<LearningPath>('/api/learning-paths/me')),
    safeFetch(coreApiClient.get<StepProgressItem[]>(`/api/user-progress/quests/${questId}`))
  ]);

  // Normalize quest details to handle both camelCase and PascalCase activity properties
  const questDetails = rawQuestDetails ? normalizeQuestDetails(rawQuestDetails) : null;

  // Convert array of step progress to Record<stepId, status>
  const stepStatuses: Record<string, 'NotStarted' | 'InProgress' | 'Completed'> = {};
  if (progressData && Array.isArray(progressData)) {
    progressData.forEach(step => {
      stepStatuses[step.stepId] = step.status;
    });
  }

  // Determine overall quest status from step statuses
  let questStatus: 'NotStarted' | 'InProgress' | 'Completed' = 'NotStarted';
  if (progressData && progressData.length > 0) {
    const allCompleted = progressData.every(s => s.status === 'Completed');
    const anyStarted = progressData.some(s => s.status === 'InProgress' || s.status === 'Completed');
    if (allCompleted) {
      questStatus = 'Completed';
    } else if (anyStarted) {
      questStatus = 'InProgress';
    }
  }

  const questProgress: QuestProgress = {
    questId: questId,
    questStatus,
    stepStatuses
  };

  // Find chapter info from learning path for breadcrumb display
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

  // Show error if quest not found
  if (!questDetails) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Trophy className="w-16 h-16 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Quest not found.</p>
          <p className="text-sm text-muted-foreground">
            This quest may not have been created yet or you don&apos;t have access to it.
          </p>
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

  return (
    <DashboardLayout>
      <QuestDetailView
        questDetails={questDetails}
        questProgress={questProgress}
        questId={questId}
        learningPathName={learningPath?.name || 'Learning Path'}
        chapterName={chapterName}
      />
    </DashboardLayout>
  );
}
