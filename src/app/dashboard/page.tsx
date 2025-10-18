import { UserHeader } from "@/components/dashboard/UserHeader";
import { CharacterStats } from "@/components/dashboard/CharacterStats";
import { ActiveQuest } from "@/components/dashboard/ActiveQuest";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// The homepage is the main dashboard, now wrapped in the reusable DashboardLayout.
// It is now an async Server Component to fetch user-specific data.
export default async function DashboardPage() {
  const supabase = await createClient();

  // Get the session to access the JWT token
  const { data: { session } } = await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();

  // Log JWT token for debugging
  if (session?.access_token) {
    console.log('🔐 JWT Token (Dashboard Access):', session.access_token);
    console.log('🔐 Token Type:', session.token_type);
    console.log('🔐 Expires At:', session.expires_at);
    console.log('🔐 User ID:', user?.id);
  } else {
    console.log('❌ No JWT token found in session');
  }

  if (!user) {
    // This should theoretically not be hit due to DashboardLayout's check,
    // but it's good practice for security.
    redirect('/login');
  }

  // Fetch the user's profile from the public.user_profiles table.
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  // Fetch the user's active quest.
  // NOTE: This is a placeholder for a real query once the quests service is built.
  // For now, we'll simulate fetching a quest that might belong to the user.
  const { data: activeQuest } = await supabase
    .from('quests') // Placeholder table
    .select('*')
    .eq('user_id', user.id) // Placeholder condition
    .eq('status', 'Active')
    .limit(1)
    .single();

  // A simple mock quest for demonstration until the backend is ready.
  const mockQuest = {
    id: "quest-123",
    title: "The Fundamentals of Alchemy",
    description: "Master the core principles of transformation and transmutation. Collect the five rare herbs of knowledge to proceed.",
    status: "Active",
    progress: {
      chaptersRead: 3,
      chaptersTotal: 5,
      timeSpentHours: 2.5,
      xp: 150,
      masteryPercent: 50
    },
  };

  const reliquary = [
    {
      label: "Soul Shards",
      value: "1,240",
      detail: "+12% this week",
      gradient: "from-[#d23187]/70 via-[#f061a6]/65 to-[#f5c16c]/60",
    },
    {
      label: "Dungeon Clears",
      value: "27",
      detail: "Streak: 6",
      gradient: "from-[#f5c16c]/60 via-[#d87553]/60 to-[#a84446]/55",
    },
    {
      label: "Guild Favor",
      value: "Legend",
      detail: "Rank 3/7",
      gradient: "from-[#f5c16c]/65 via-[#f2a163]/60 to-[#d67b54]/55",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10">
        <UserHeader userProfile={userProfile} />

        <section className="grid gap-4 md:grid-cols-3">
          {reliquary.map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-[22px] border border-[#f5c16c]/18 bg-[#1f0d09]/85 p-5 text-white shadow-[0_15px_45px_rgba(36,12,6,0.55)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(18,6,4,0.45),_transparent_70%)]" />
              <div className="relative z-10">
                <p className="text-[11px] uppercase tracking-[0.45em] text-[#2b130f]/75">{item.label}</p>
                <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.35em] text-[#2b130f]/70">{item.detail}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <CharacterStats userProfile={userProfile} />
              <ActiveQuest quest={activeQuest || mockQuest} />
            </div>

            <div className="rounded-[24px] border border-[#f5c16c]/18 bg-[#1a0b08]/80 p-6 text-sm uppercase tracking-[0.35em] text-[#f5c16c]/70">
              <p className="text-[#f5c16c]/60">Codex Update</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#f5c16c]/22 bg-[#d23187]/15 p-4 text-center text-white">
                  <p className="text-xs text-[#f9d9eb]/70">New Artifact</p>
                  <p className="mt-3 text-lg font-semibold">Forgotten Compiler</p>
                </div>
                <div className="rounded-2xl border border-[#f5c16c]/22 bg-[#1f0d09]/85 p-4 text-center text-white">
                  <p className="text-xs text-[#f5c16c]/70">Raid Window</p>
                  <p className="mt-3 text-lg font-semibold">Opens in 02:41:36</p>
                </div>
                <div className="rounded-2xl border border-[#f5c16c]/22 bg-[#d67b54]/25 p-4 text-center">
                  <p className="text-xs text-[#2b130f]/70">Guild Directive</p>
                  <p className="mt-3 text-lg font-semibold text-[#2b130f]">Clear 3 Elite Dungeons</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <UpcomingEvents />
            <div className="overflow-hidden rounded-[24px] border border-[#f5c16c]/20 bg-[#1c0c08]/85 p-6 text-xs uppercase tracking-[0.4em] text-[#f5c16c]/70">
              <p className="text-[#f5c16c]/60">Realm Weather</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-[#f5c16c]/22 bg-[#d23187]/15 px-4 py-3 text-white">
                  <span>Nebula Storms</span>
                  <span className="text-[#f5c16c]">+15% XP</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[#f5c16c]/22 bg-[#1f0d09]/85 px-4 py-3 text-white">
                  <span>Arcane Winds</span>
                  <span className="text-[#f5c16c]">Fewer traps</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[#f5c16c]/22 bg-[#d67b54]/20 px-4 py-3 text-[#2b130f]">
                  <span>Shadow Veil</span>
                  <span className="text-[#7a2d25]">Stealth bonus</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
