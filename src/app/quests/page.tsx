import { DashboardLayout } from '@/components/layout/DashboardLayout';
import QuestListView from '@/components/quests/QuestListView';
import { mockQuests } from '@/lib/mockData';

export default function QuestsPage() {
  // Calculate user stats from all quests
  const userStats = {
    streak: 7, // This would come from user profile in real app
    totalQuests: mockQuests.active.length + mockQuests.completed.length,
    totalXP: mockQuests.active.reduce((sum, q) => sum + q.progress.currentXP, 0) +
             mockQuests.completed.reduce((sum, q) => sum + q.xpReward, 0)
  };

  return (
    <DashboardLayout>
      <QuestListView 
        activeQuests={mockQuests.active}
        completedQuests={mockQuests.completed}
        availableQuests={mockQuests.available}
        userStats={userStats}
      />
    </DashboardLayout>
  );
}