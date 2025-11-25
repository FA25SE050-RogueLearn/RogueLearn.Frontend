// roguelearn-web/src/app/quests/[learningPathId]/[chapterId]/[questId]/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerApiClients } from "@/lib/api-server";
import { QuestDetails, LearningPath } from "@/types/quest";
import QuestDetailView from "@/components/quests/QuestDetailView";
import { revalidatePath } from "next/cache";
import { checkApiHealth } from "@/lib/api-server";
import { createClient } from "@/utils/supabase/server";

interface PageProps {
  params: Promise<{ learningPathId: string; chapterId: string; questId: string }>;
}

// ⭐ Define the quest progress type with proper enums
interface QuestProgress {
  questId: string;
  questStatus: 'NotStarted' | 'InProgress' | 'Completed';
  stepStatuses: Record<string, 'NotStarted' | 'InProgress' | 'Completed'>;
}

export default async function QuestOverviewPage({ params }: PageProps) {
  const { learningPathId, chapterId, questId } = await params;
  const { coreApiClient } = await createServerApiClients();
  const apiHealthy = await checkApiHealth(process.env.NEXT_PUBLIC_API_URL);
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const hasSessionToken = !!session?.access_token;

  let questDetails: QuestDetails | null = null;
  let learningPath: LearningPath | null = null;
  let questProgress: QuestProgress | null = null;

  try {
    // ⭐ Fetch THREE endpoints: quest details, learning path, AND progress
    const [questResponse, pathResponse, progressResponse] = await Promise.all([
      coreApiClient.get<QuestDetails>(`/api/quests/${questId}`),
      coreApiClient.get<LearningPath>('/api/learning-paths/me'),
      coreApiClient.get<QuestProgress>(
        `/api/user-progress/quests/${questId}`
      )
    ]);

    questDetails = questResponse.data;
    learningPath = pathResponse.data;

    // ⭐ Type cast the progress response to ensure proper typing
    if (progressResponse.data) {
      questProgress = {
        questId: progressResponse.data.questId,
        questStatus: progressResponse.data.questStatus as 'NotStarted' | 'InProgress' | 'Completed',
        stepStatuses: progressResponse.data.stepStatuses as Record<string, 'NotStarted' | 'InProgress' | 'Completed'>
      };
    }

    console.log('✅ Fetched quest details, learning path, and progress');
    console.log('questDetails', questDetails);
    console.log('learningPath', learningPath);
    console.log('questProgress', questProgress);
  } catch (error) {
    console.error(`Failed to fetch quest ${questId}:`, error);
  }

  const chapter = learningPath?.chapters.find(ch => ch.id === chapterId);
  const debugInfo = {
    params: { learningPathId, chapterId, questId },
    apiHealthy,
    envApiUrl,
    hasSessionToken,
    questDetails: questDetails ? { id: questDetails.id, title: questDetails.title, stepsCount: questDetails.steps?.length } : null,
    learningPath: learningPath ? { id: learningPath.id, name: learningPath.name, chaptersCount: learningPath.chapters?.length, chapterIds: learningPath.chapters?.map(ch => ch.id) } : null,
    chapterMatched: !!chapter,
  };

  // Error handling
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
          <form
            action={async () => {
              'use server';
              revalidatePath(`/quests/${learningPathId}/${chapterId}/${questId}`);
            }}
          >
            <button
              type="submit"
              className="mt-2 rounded-md border border-[#f5c16c]/30 px-3 py-1 text-sm text-[#f5c16c] hover:bg-[#f5c16c]/10"
            >
              Refresh Server Data
            </button>
          </form>
          <div className="mt-4 w-full max-w-3xl rounded-md border border-[#f5c16c]/20 bg-black/30 p-3 text-xs text-white/80">
            <div className="mb-2 font-semibold text-[#f5c16c]">Debug</div>
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If progress not available, use default
  if (!questProgress) {
    questProgress = {
      questId: questId,
      questStatus: 'NotStarted',
      stepStatuses: {}
    };
  }

  return (
    <DashboardLayout>
      <form
        action={async () => {
          'use server';
          revalidatePath(`/quests/${learningPathId}/${chapterId}/${questId}`);
        }}
      >
        <button
          type="submit"
          className="mb-4 rounded-md border border-[#f5c16c]/30 px-3 py-1 text-sm text-[#f5c16c] hover:bg-[#f5c16c]/10"
        >
          Refresh Server Data
        </button>
      </form>
      <div className="mb-4 w-full max-w-3xl rounded-md border border-[#f5c16c]/20 bg-black/30 p-3 text-xs text-white/80">
        <div className="mb-2 font-semibold text-[#f5c16c]">Debug</div>
        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
      <QuestDetailView
        questDetails={questDetails}
        questProgress={questProgress}
        learningPathId={learningPathId}
        learningPathName={learningPath.name}
        chapterId={chapterId}
        chapterName={chapter.title}
      />
    </DashboardLayout>
  );
}
