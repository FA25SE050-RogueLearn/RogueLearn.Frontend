import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createServerApiClients, checkApiHealth } from "@/lib/api-server";
import { AchievementsGrid } from "@/components/achievements/AchievementsGrid";

interface Achievement {
  achievementId: string;
  key: string;
  name: string;
  description: string;
  iconUrl: string | null;
  sourceService: string;
  earnedAt: string;
  context: string | null;
}

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { coreApiClient } = await createServerApiClients();
  let achievements: Achievement[] = [];

  const apiHealthy = await checkApiHealth(process.env['NEXT_PUBLIC_API_URL']);

  if (apiHealthy) {
    try {
      const res = await coreApiClient.get('/api/users/achievements/me');
      achievements = res.data?.achievements || [];
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="relative overflow-hidden rounded-[24px] border border-[#f5c16c]/20 bg-gradient-to-r from-[#2a140f]/95 via-[#1a0b08]/95 to-[#2a140f]/95 p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(210,49,135,0.15),transparent_50%)]" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#f5c16c]/5 to-transparent" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#f5c16c]/30 bg-gradient-to-br from-[#d23187]/20 to-[#f5c16c]/20">
                  <svg className="h-6 w-6 text-[#f5c16c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Achievements</h1>
                  <p className="text-sm text-[#f5c16c]/60">Your earned trophies and badges</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-4 py-2 text-center">
                <p className="text-2xl font-bold text-white">{achievements.length}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#f5c16c]/80">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <AchievementsGrid achievements={achievements} />
      </div>
    </DashboardLayout>
  );
}
