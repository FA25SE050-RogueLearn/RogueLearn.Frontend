// roguelearn-web/src/app/dashboard/page.tsx
import ProfileModalLauncher from "@/components/dashboard/ProfileModalLauncher";
import { ActiveQuest } from "@/components/dashboard/ActiveQuest";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createServerApiClients, checkApiHealth } from "@/lib/api-server";
import { mockQuests } from "@/lib/mockData";

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

  // Quick health check before making API calls
  const apiHealthy = await checkApiHealth(process.env['NEXT_PUBLIC_API_URL']);

  if (!apiHealthy) {
    console.warn('API health check failed - skipping data fetching');
  } else {
    try {
      // 1. Fetch user profile from the consolidated core service API.
      console.log(`Fetching profile for user: ${user.id}`);
      const profileResponse = await coreApiClient.get(`/api/profiles/${user.id}`);
      userProfile = profileResponse.data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // If this fails, userProfile will remain null and components will show a loading/error state.
    }
  }

  if (apiHealthy) {
    try {
      // 2. Fetch the user's active learning path from the consolidated core service API.
      console.log(`Fetching learning path for user: ${user.id}`);
      const learningPathResponse = await coreApiClient.get<LearningPath>('/api/learning-paths/me');
      const learningPath = learningPathResponse.data;

      // 3. From the learning path, find the user's current quest.
      // MODIFICATION START: Added a null check to prevent crashing when a new user
      // with no learning path visits the dashboard. If learningPath or its quests
      // array is null/undefined, currentQuestSummary will safely be null.
      const currentQuestSummary =
        (learningPath && learningPath.quests)
          ? learningPath.quests.find(q => q.status === 'InProgress') ||
            learningPath.quests.find(q => q.status === 'NotStarted')
          : null;
      // MODIFICATION END

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

  const xpPercentage = userProfile ? (userProfile.experience_points / (userProfile.xpMax || 1000)) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,6fr)_minmax(0,3fr)]">
        <div className="relative overflow-hidden rounded-[30px] border border-[#f5c16c]/20 bg-linear-to-br from-[#2a140f]/92 via-[#160b08]/94 to-[#0a0503]/96 p-6 shadow-[0_22px_70px_rgba(38,12,6,0.55)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.25),transparent_70%)]" />
          <div className="relative z-10 flex h-full flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full border border-[#f5c16c]/50 bg-[url('https://images.unsplash.com/photo-1582719471209-8a1c875b9fff?auto=format&fit=crop&w=400&q=80')] bg-cover bg-center shadow-[0_10px_30px_rgba(210,49,135,0.35)]" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-xl font-semibold text-white">{userProfile?.username || "Scholar"}</p>
                  <span className="rounded-full border border-[#f5c16c]/40 bg-[#f5c16c]/15 px-3 py-1 text-[11px] uppercase tracking-[0.45em] text-[#2b130f]">Lv.{userProfile?.level || 1}</span>
                </div>
                <div className="mt-3 w-full max-w-[380px]">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#f5c16c]/70">
                    <span className="text-white/70">Experience</span>
                    <span className="text-[#f5c16c]">{userProfile?.experience_points || 0} / {userProfile?.xpMax || 1000} XP</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-[#2d140f]/70">
                    <div className="h-full rounded-full bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] shadow-[0_0_16px_rgba(245,193,108,0.55)]" style={{ width: `${Math.min(100, xpPercentage)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 text-sm uppercase tracking-[0.3em] text-[#f5c16c]/60">
              <div className="flex items-center justify-between">
                <span>Class</span>
                <span className="text-white">{userProfile?.stats?.class || "Novice Delver"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Curriculum</span>
                <span className="text-white">{userProfile?.stats?.curriculum || "Uncharted Path"}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-2xl border border-[#f5c16c]/30 bg-[#f5c16c]/10 p-4 text-[#2b130f]">
                  <p className="text-[11px] tracking-[0.45em] text-[#2b130f]/80">Intellect</p>
                  <p className="mt-3 text-3xl font-semibold">{userProfile?.stats?.intellect ?? 10}</p>
                  <p className="text-[10px] uppercase tracking-[0.45em] text-[#2b130f]/70">Rune mastery</p>
                </div>
                <div className="rounded-2xl border border-[#d23187]/40 bg-[#d23187]/15 p-4 text-white">
                  <p className="text-[11px] tracking-[0.45em] text-[#f9d9eb]">Wisdom</p>
                  <p className="mt-3 text-3xl font-semibold">{userProfile?.stats?.wisdom ?? 10}</p>
                  <p className="text-[10px] uppercase tracking-[0.45em] text-[#f9d9eb]/80">Lore recall</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <section className="grid grid-cols-3 gap-4">
            {reliquary.map((item) => (
              <div key={item.label} className="relative overflow-hidden rounded-[22px] border border-[#f5c16c]/18 bg-[#1f0d09]/85 p-5 text-white shadow-[0_15px_45px_rgba(36,12,6,0.55)] h-28">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(18,6,4,0.45),_transparent_70%)]" />
                <div className="relative z-10">
                  <p className="text-[11px] uppercase tracking-[0.45em] text-[#2b130f]/75">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-[#2b130f]/70">{item.detail}</p>
                </div>
              </div>
            ))}
          </section>

          <ActiveQuest quest={adaptedQuestForComponent} />

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

        <aside className="flex flex-col gap-6">
          <div className="rounded-[24px] border border-[#f5c16c]/20 bg-[#1a0b08]/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#f5c16c]/70">Lecturer Access</p>
              <ProfileModalLauncher label="Verify" defaultTab="verification" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-[#f5c16c]/22 bg-[#28130d]/88 p-6 text-[#f5c16c] shadow-[0_20px_60px_rgba(38,12,6,0.6)]">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-[#f5c16c]/25" />
            <div className="relative z-10 space-y-6">
              <p className="text-lg uppercase tracking-[0.35em] text-[#f5c16c]">Forthcoming Omens</p>
              <div className="space-y-6">
                {mockQuests.upcomingEvents.map((event) => (
                  <div key={event.id} className="relative pl-10">
                    <span className="absolute left-5 top-2 h-2 w-2 rounded-full bg-[#f5c16c] shadow-[0_0_10px_rgba(245,193,108,0.7)]" />
                    <div className="rounded-2xl border border-[#f5c16c]/30 bg-[#d23187]/12 p-4 text-white">
                      <p className="text-[11px] uppercase tracking-[0.4em] text-[#f5c16c]/80">{event.type}</p>
                      <h4 className="mt-2 text-base font-semibold text-white">{event.title}</h4>
                      <p className="mt-1 text-sm text-[#f5c16c]/75">{event.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#f5c16c]/20 bg-[#1c0c08]/85 p-6 text-xs uppercase tracking-[0.4em] text-[#f5c16c]/70">
            <p className="text-[#f5c16c]/60">Current Buff</p>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#f5c16c]/22 bg-[#d23187]/15 px-4 py-3 text-white">
              <span>Arcane Focus</span>
              <span className="text-[#f5c16c]">+10% XP</span>
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
