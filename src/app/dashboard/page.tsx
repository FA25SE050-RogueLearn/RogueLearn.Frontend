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

  const { data: { user } } = await supabase.auth.getUser();

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

  return (
    <DashboardLayout>
      {/* The main content area now passes the fetched userProfile to its children */}
      <main className="col-span-12 lg:col-span-7 flex flex-col gap-8">
        <UserHeader userProfile={userProfile} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CharacterStats userProfile={userProfile} />
          {/* Use the real quest if found, otherwise fall back to the mock quest */}
          <ActiveQuest quest={activeQuest || mockQuest} />
        </div>
      </main>
      <aside className="col-span-12 lg:col-span-3">
        <UpcomingEvents />
      </aside>
    </DashboardLayout>
  );
}
