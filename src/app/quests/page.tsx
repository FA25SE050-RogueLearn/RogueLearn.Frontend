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

  // --- MODIFICATION START ---
  // The original logic `learningPath?.chapters.flatMap(c => c.quests) ?? []`
  // lost the parent context. This new logic iterates through each chapter and
  // explicitly adds the `learningPathId` and `chapterId` to each quest object
  // as it flattens the array. This ensures the full context is preserved.
  const allQuests: QuestSummary[] = learningPath?.chapters.flatMap(chapter =>
    chapter.quests.map(quest => ({
      ...quest,
      learningPathId: learningPath.id, // Explicitly pass down the Learning Path ID
      chapterId: chapter.id             // Explicitly pass down the Chapter ID
    }))
  ) ?? [];
  // --- MODIFICATION END ---

  const activeQuests = allQuests.filter(q => q.status === 'InProgress');
  const completedQuests = allQuests.filter(q => q.status === 'Completed');
  const availableQuests = allQuests.filter(q => q.status === 'NotStarted');

  // These would also come from the backend in a real app, but we'll simulate for now.
  userStats = {
    streak: 7,
    totalQuests: allQuests.length,
    totalXP: completedQuests.length * 100 // simplified calculation
  };

  return (
    <DashboardLayout>
      <QuestListView
        activeQuests={activeQuests}
        completedQuests={completedQuests}
        availableQuests={availableQuests}
        userStats={userStats}
      />
    </DashboardLayout>
  );
}