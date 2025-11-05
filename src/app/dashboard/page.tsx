import { UserHeader } from "@/components/dashboard/UserHeader";
import { CharacterStats } from "@/components/dashboard/CharacterStats";
import { ActiveQuest } from "@/components/dashboard/ActiveQuest";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createServerApiClients } from "@/lib/api-server";

// Define interfaces for the data we expect from our backend APIs.
// This provides type safety and clarity for our frontend code.
interface UserProfile {
  username: string;
  level: number;
  title: string;
  experience_points: number;
  // This is an assumption based on mock data; the backend may need to provide this.
  xpMax?: number;
  stats?: {
    class?: string;
    curriculum?: string;
    intellect?: number;
    wisdom?: number;
  }
}

interface QuestSummary {
  id: string;
  title: string;
  status: string;
  sequenceOrder: number;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  quests: QuestSummary[];
  completionPercentage: number;
}

interface QuestDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  experiencePointsReward: number;
  objectives: unknown[]; // Objectives structure not needed for this component yet
}

// The homepage is the main dashboard, now fetching all data from the backend.
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This check ensures only authenticated users can access the dashboard.
    // It's placed at the top to prevent any further execution for unauthenticated users.
    redirect('/login');
  }

  // Get the session to access the JWT token for logging and API calls.
  const { data: { session } } = await supabase.auth.getSession();

  // RE-ADDED: JWT token logging for debugging as requested.
  if (session?.access_token) {
    console.log('🔐 JWT Token (Dashboard Access):', session.access_token);
    console.log('🔐 Token Type:', session.token_type);
    console.log('🔐 Expires At:', session.expires_at);
    console.log('🔐 User ID:', user.id);
  } else {
    console.log('❌ No JWT token found in session');
  }

  // Create authenticated API clients for server-side requests.
  // We now use a single `coreApiClient` for both user and quest data.
  const { coreApiClient } = await createServerApiClients();

  let userProfile: UserProfile | null = null;
  let activeQuest: QuestDetails | null = null;

  try {
    // 1. Fetch user profile from the consolidated core service API.
    console.log(`Fetching profile for user: ${user.id}`);
    const profileResponse = await coreApiClient.get(`/api/profiles/${user.id}`);
    userProfile = profileResponse.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    // If this fails, userProfile will remain null and components will show a loading/error state.
  }

  try {
    // 2. Fetch the user's active learning path from the consolidated core service API.
    console.log(`Fetching learning path for user: ${user.id}`);
    const learningPathResponse = await coreApiClient.get<LearningPath>('/api/learning-paths/me');
    const learningPath = learningPathResponse.data;

    // 3. From the learning path, find the user's current quest.
    // The logic is to find the first quest that is 'InProgress' or, if none are, the first 'NotStarted'.
    const currentQuestSummary =
      learningPath.quests.find(q => q.status === 'InProgress') ||
      learningPath.quests.find(q => q.status === 'NotStarted');

    if (currentQuestSummary) {
      // 4. If a current quest is identified, fetch its full details from the consolidated core service API.
      console.log(`Fetching details for quest: ${currentQuestSummary.id}`);
      const questDetailsResponse = await coreApiClient.get<QuestDetails>(`/api/quests/${currentQuestSummary.id}`);
      activeQuest = questDetailsResponse.data;
    }
  } catch (error) {
    console.error("Failed to fetch quest data:", error);
    // It's acceptable for this to fail if the user has no active quests.
    // The ActiveQuest component is designed to handle a null value.
  }

  // NOTE ON DATA ADAPTATION:
  // The <ActiveQuest /> component was originally designed for mock data that had a nested `progress` object.
  // The actual QuestDto from your backend API does not have this nested structure.
  // To make the integration work without immediately refactoring the UI component, this `adaptedQuestForComponent`
  // variable is created. It maps the live data from the `activeQuest` object into the structure
  // that the component expects, using placeholder values for the progress details.
  // LONG-TERM FIX: Align the backend DTO and the frontend component props.
  const adaptedQuestForComponent = activeQuest ? {
    id: activeQuest.id,
    title: activeQuest.title,
    description: activeQuest.description,
    status: activeQuest.status,
    progress: { // Placeholder progress data to satisfy the component's props
      chaptersRead: 3,
      chaptersTotal: 5,
      timeSpentHours: 2.5,
      masteryPercent: 50
    },
  } : null;

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
      <div className="flex flex-col gap-8">
        {/* Enhanced User Header with better visual hierarchy */}
        <UserHeader userProfile={userProfile} />

        {/* Reliquary Stats - Refined with better gradients and shadows */}
        <section className="grid gap-6 md:grid-cols-3">
          {reliquary.map((item) => (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-3xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#08040a]/95 p-6 text-white shadow-2xl shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(245,193,108,0.15)]"
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-75`} />

              {/* Radial overlay for depth */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,193,108,0.08),_transparent_60%)]" />

              {/* Subtle texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-embroidery.png')`,
                }}
              />

              {/* Glow effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#f5c16c]/0 via-[#f5c16c]/0 to-[#f5c16c]/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20" />

              <div className="relative z-10 space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">{item.label}</p>
                <p className="text-4xl font-bold tracking-tight text-white">{item.value}</p>
                <p className="text-sm font-medium tracking-wide text-white/50">{item.detail}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            {/* Character Stats & Active Quest */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CharacterStats userProfile={userProfile} />
              <ActiveQuest quest={adaptedQuestForComponent} />
            </div>

            {/* Codex Update - Enhanced design */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#1a0b08]/95 to-[#08040a]/90 p-8 shadow-2xl shadow-black/40">
              {/* Subtle texture */}
              <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-embroidery.png')`,
                }}
              />

              {/* Decorative glow */}
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#d23187]/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[#d23187] to-[#f5c16c]" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#f5c16c]/80">Codex Update</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="relative overflow-hidden rounded-2xl border border-[#d23187]/30 bg-gradient-to-br from-[#d23187]/20 to-[#d23187]/5 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#d23187]/50 hover:shadow-lg hover:shadow-[#d23187]/20">
                    <p className="text-xs font-medium uppercase tracking-wider text-white/60">New Artifact</p>
                    <p className="mt-3 text-lg font-bold text-white">Forgotten Compiler</p>
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-[#d23187]/20 blur-2xl" />
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/30 bg-gradient-to-br from-[#f5c16c]/15 to-[#f5c16c]/5 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#f5c16c]/50 hover:shadow-lg hover:shadow-[#f5c16c]/20">
                    <p className="text-xs font-medium uppercase tracking-wider text-white/60">Raid Window</p>
                    <p className="mt-3 text-lg font-bold text-white">Opens in 02:41:36</p>
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-[#f5c16c]/20 blur-2xl" />
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-[#d67b54]/30 bg-gradient-to-br from-[#d67b54]/20 to-[#d67b54]/5 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#d67b54]/50 hover:shadow-lg hover:shadow-[#d67b54]/20">
                    <p className="text-xs font-medium uppercase tracking-wider text-white/60">Guild Directive</p>
                    <p className="mt-3 text-lg font-bold text-white">Clear 3 Elite Dungeons</p>
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-[#d67b54]/20 blur-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Enhanced */}
          <aside className="space-y-6">
            <UpcomingEvents />

            {/* Realm Weather - Refined */}
            <div className="relative overflow-hidden rounded-3xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#1c0c08]/95 to-[#08040a]/90 p-6 shadow-2xl shadow-black/40">
              {/* Subtle texture */}
              <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-embroidery.png')`,
                }}
              />

              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-1 w-10 rounded-full bg-gradient-to-r from-[#f5c16c] to-[#d67b54]" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#f5c16c]/80">Realm Weather</h3>
                </div>

                <div className="space-y-3">
                  <div className="group/item flex items-center justify-between rounded-2xl border border-[#d23187]/30 bg-gradient-to-r from-[#d23187]/20 to-[#d23187]/5 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-[#d23187]/50 hover:shadow-lg hover:shadow-[#d23187]/20">
                    <span className="tracking-wide">Nebula Storms</span>
                    <span className="font-bold text-[#f5c16c]">+15% XP</span>
                  </div>

                  <div className="group/item flex items-center justify-between rounded-2xl border border-[#f5c16c]/30 bg-gradient-to-r from-[#f5c16c]/15 to-[#f5c16c]/5 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-[#f5c16c]/50 hover:shadow-lg hover:shadow-[#f5c16c]/20">
                    <span className="tracking-wide">Arcane Winds</span>
                    <span className="font-bold text-[#f5c16c]">Fewer traps</span>
                  </div>

                  <div className="group/item flex items-center justify-between rounded-2xl border border-[#d67b54]/30 bg-gradient-to-r from-[#d67b54]/20 to-[#d67b54]/5 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-[#d67b54]/50 hover:shadow-lg hover:shadow-[#d67b54]/20">
                    <span className="tracking-wide">Shadow Veil</span>
                    <span className="font-bold text-[#d67b54]">Stealth bonus</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}