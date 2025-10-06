import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// The components for the dashboard are imported.
import { UserHeader } from "@/components/dashboard/UserHeader";
import { CharacterStats } from "@/components/dashboard/CharacterStats";
import { ActiveQuest } from "@/components/dashboard/ActiveQuest";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RecentAchievements } from "@/components/dashboard/RecentAchievements";

// This is the main dashboard for authenticated users, matching the wireframe layout.
export default async function CharacterDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch the user's profile from the public.user_profiles table.
    const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
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
            {/* The main content area now uses a single-column layout to match the wireframe. */}
            <main className="col-span-12 lg:col-span-10 flex flex-col gap-8">
                <div className="text-sm text-foreground/60 mb-2 font-body">
                    RogueLearn &gt; Character
                </div>

                {/* The main character components are grouped together. */}
                <UserHeader userProfile={userProfile} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CharacterStats userProfile={userProfile} />
                    <ActiveQuest quest={mockQuest} />
                </div>

                <QuickAccess />

                {/* Upcoming Events and Recent Achievements are now at the bottom, side-by-side. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <UpcomingEvents />
                    <RecentAchievements />
                </div>
            </main>
        </DashboardLayout>
    );
}
