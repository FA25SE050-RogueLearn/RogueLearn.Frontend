// roguelearn-web/src/app/quests/page.tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import QuestListView from '@/components/quests/QuestListView';
import { createServerApiClients } from '@/lib/api-server';
import { LearningPath, QuestSummary } from '@/types/quest';
import { redirect } from 'next/navigation';

export default async function QuestsPage() {
  const { coreApiClient } = await createServerApiClients();
  let learningPath: LearningPath | null = null;
  let userStats = {
    streak: 0,
    totalQuests: 0,
    totalXP: 0
  };

  try {
    const response = await coreApiClient.get<LearningPath>('/api/learning-paths/me');
    learningPath = response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      redirect('/onboarding/connect-fap');
    }
    console.error("Failed to fetch learning path:", error);
  }

  // Flatten all quests with their parent context
  const allQuests: QuestSummary[] = learningPath?.chapters.flatMap(chapter =>
    chapter.quests.map(quest => ({
      ...quest,
      learningPathId: learningPath.id,
      chapterId: chapter.id
    }))
  ) ?? [];

  // Categorize quests on the server
  const activeQuests = allQuests.filter(q => q.status === 'InProgress');
  const completedQuests = allQuests.filter(q => q.status === 'Completed');
  // Pass ALL NotStarted quests to the client. The client will handle the logic for available vs. locked.
  const notStartedQuests = allQuests.filter(q => q.status === 'NotStarted');

  // Calculate user stats
  userStats = {
    streak: 7,
    totalQuests: allQuests.length,
    totalXP: completedQuests.length * 100
  };

  return (
    <DashboardLayout>
      <QuestListView
        activeQuests={activeQuests}
        completedQuests={completedQuests}
        notStartedQuests={notStartedQuests} // Pass the combined list
        userStats={userStats}
      />
    </DashboardLayout>
  );
}