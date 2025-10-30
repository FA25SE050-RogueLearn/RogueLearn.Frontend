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
      <div className="flex flex-col gap-10">
        {/* The components now receive live data fetched from the backend */}
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
              <ActiveQuest quest={adaptedQuestForComponent} />
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