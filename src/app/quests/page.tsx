// roguelearn-web/src/app/quests/page.tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import QuestlineView from '@/components/quests/QuestlineView';
import { createServerApiClients } from '@/lib/api-server';
import { LearningPath } from '@/types/quest';
import { redirect } from 'next/navigation';
import { Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function QuestsPage() {
  const { coreApiClient } = await createServerApiClients();
  let learningPath: LearningPath | null = null;

  try {
    const response = await coreApiClient.get<LearningPath>('/api/learning-paths/me');
    learningPath = response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      redirect('/onboarding/connect-fap');
    }
    console.error("Failed to fetch learning path:", error);
  }

  if (!learningPath) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="p-4 rounded-full bg-[#f5c16c]/10">
            <Trophy className="w-12 h-12 text-[#f5c16c]" />
          </div>
          <h2 className="text-2xl font-bold text-white">No Questline Found</h2>
          <p className="text-white/60 max-w-md text-center">
            Your learning path hasn&apos;t been forged yet. Please complete the onboarding process.
          </p>
          <Button asChild variant="outline" className="mt-4 border-[#f5c16c]/50 text-[#f5c16c] hover:bg-[#f5c16c]/10">
            <Link href="/onboarding/connect-fap">
              Begin Onboarding
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* 
        We pass the full LearningPath object to QuestlineView.
        This view now handles the hierarchical display of Chapters and Quests,
        as well as the "Free Path" logic and Quest Generation.
      */}
      <QuestlineView learningPath={learningPath} />
    </DashboardLayout>
  );
}