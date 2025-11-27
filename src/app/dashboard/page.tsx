// roguelearn-web/src/app/dashboard/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createServerApiClients, checkApiHealth, getCachedUserFullInfo } from "@/lib/api-server";
import type { FullUserInfoResponse, QuestAttemptItem } from "@/types/user-profile";
import Link from "next/link";
import { BookOpen, Trophy, Sword, Calendar, Lightbulb, GraduationCap, ScrollText, Users, Shield } from "lucide-react";
import QuestProgressClient from "@/components/dashboard/QuestProgressClient";
import { FeaturedEventsSection } from "@/components/dashboard/FeaturedEventsSection";
import { RightColumn } from "@/components/dashboard/RightColumn";

export default async function DashboardPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: { session } } = await supabase.auth.getSession();

  // JWT token logging only in development for debugging
  if (process.env.NODE_ENV === 'development' && session?.access_token) {
    console.log('JWT Token (Dashboard Access):', session.access_token);
  }

  const { coreApiClient } = await createServerApiClients();

  let fullInfo: FullUserInfoResponse | null = null;
  let achievements: any[] = [];

  const apiHealthy = await checkApiHealth(process.env['NEXT_PUBLIC_API_URL']);

  if (!apiHealthy) {
    console.warn('API health check failed - skipping data fetching');
  } else {
    try {
      // Use cached user info to avoid duplicate API calls with DashboardLayout
      const [userInfoResult, achievementsRes] = await Promise.allSettled([
        getCachedUserFullInfo(),
        coreApiClient.get('/api/users/achievements/me')
      ]);

      if (userInfoResult.status === 'fulfilled') {
        fullInfo = userInfoResult.value;
      }

      if (achievementsRes.status === 'fulfilled') {
        achievements = achievementsRes.value.data?.achievements || [];
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }

  const activeAttempt: QuestAttemptItem | undefined = fullInfo?.relations.questAttempts.find(a => {
    const s = a.status.toLowerCase();
    return s === 'in_progress' || s === 'inprogress';
  }) || fullInfo?.relations.questAttempts.find(a => {
    const s = a.status.toLowerCase();
    return s === 'not_started' || s === 'notstarted';
  });

  const subjects = fullInfo?.relations.studentTermSubjects ?? [];
  const pendingSubject = subjects.find(ss => {
    const st = (ss.status || '').toLowerCase();
    return st.includes('studying') || st.includes('not');
  });
  const noQuestTip = pendingSubject
    ? `Tip: Your '${pendingSubject.subjectName}' is ${((pendingSubject.status||'').toLowerCase().includes('studying')) ? 'in progress' : 'not started'}. Check the guild hall for updates.`
    : 'Tip: Start a new quest to gain XP today.';

  return (
    <DashboardLayout>
      <div className="flex min-h-screen">
        {/* Main Content (center) - flex-1 */}
        <main className="flex-1 space-y-6 xl:mr-80">
          {/* Profile Header Card */}
          <section className="relative overflow-hidden rounded-[24px] border border-[#f5c16c]/20 bg-gradient-to-r from-[#2a140f]/95 via-[#1a0b08]/95 to-[#2a140f]/95 p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(210,49,135,0.15),transparent_50%)]" />
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* Left - Avatar & Name */}
              <div className="flex items-center gap-4">
                <div 
                  className="h-16 w-16 rounded-full border-2 border-[#f5c16c]/50 bg-cover bg-center shadow-[0_0_20px_rgba(210,49,135,0.3)]" 
                  style={{ backgroundImage: `url('${fullInfo?.profile.profileImageUrl || 'https://images.unsplash.com/photo-1582719471209-8a1c875b9fff?auto=format&fit=crop&w=400&q=80'}')` }} 
                />
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {fullInfo?.profile.firstName && fullInfo?.profile.lastName 
                      ? `${fullInfo.profile.firstName} ${fullInfo.profile.lastName}` 
                      : (fullInfo?.profile.username || "Scholar")}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-2.5 py-0.5 text-xs text-white">
                      <GraduationCap className="h-3 w-3 text-[#f5c16c]" />
                      {fullInfo?.profile.className || 'Unassigned'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d23187]/30 bg-[#d23187]/10 px-2.5 py-0.5 text-xs text-white">
                      <ScrollText className="h-3 w-3 text-[#d23187]" />
                      {fullInfo?.profile.curriculumName || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center - Quest Stats */}
              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-white">{fullInfo?.counts.questsInProgress ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#f5c16c]/80">In Progress</p>
                </div>
                <div className="rounded-xl border border-[#d23187]/30 bg-[#d23187]/10 px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-white">{fullInfo?.counts.questsCompleted ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#d23187]/80">Completed</p>
                </div>
              </div>

              {/* Right - Guild & Party */}
              <div className="flex items-center gap-3">
                <Link 
                  href="/community/guilds" 
                  className="flex items-center gap-2 rounded-xl border border-[#f5c16c]/20 bg-[#1a0b08]/60 px-3 py-2 transition-colors hover:border-[#f5c16c]/40"
                >
                  <Shield className="h-4 w-4 text-[#f5c16c]" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-[#f5c16c]/60">Guild</p>
                    <p className="text-xs font-medium text-white">
                      {fullInfo?.relations.guildMembers?.[0]?.guildName || 'None'}
                    </p>
                  </div>
                </Link>
                <Link 
                  href="/parties" 
                  className="flex items-center gap-2 rounded-xl border border-[#d23187]/20 bg-[#1a0b08]/60 px-3 py-2 transition-colors hover:border-[#d23187]/40"
                >
                  <Users className="h-4 w-4 text-[#d23187]" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-[#d23187]/60">Party</p>
                    <p className="text-xs font-medium text-white">
                      {fullInfo?.relations.partyMembers?.[0]?.partyName || 'None'}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Notes', value: fullInfo?.counts.notes ?? 0, icon: BookOpen },
              { label: 'Quests Done', value: fullInfo?.counts.questsCompleted ?? 0, icon: Trophy },
              { label: 'Active', value: fullInfo?.counts.questsInProgress ?? 0, icon: Sword },
              { label: 'Meetings', value: fullInfo?.counts.meetings ?? 0, icon: Calendar },
            ].map((item) => (
              <div key={item.label} className="relative overflow-hidden rounded-[22px] border border-[#f5c16c]/25 bg-[#1f0d09]/90 p-4 text-white h-24">
                <div className="relative z-10 flex items-center gap-3">
                  {item.icon && <item.icon className="h-5 w-5 text-[#f5c16c]" />}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.45em] text-[#f5c16c]/80">{item.label}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <div className="p-px rounded-[24px] bg-linear-to-r from-[#d23187]/30 via-[#f061a6]/30 to-[#f5c16c]/30">
            <div className="relative overflow-hidden rounded-[24px] border border-[#f5c16c]/22 bg-[#23110d]/88 p-6 text-white">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_20%,rgba(245,193,108,0.06),transparent_60%)]" />
            {activeAttempt ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">{activeAttempt.questTitle}</h2>
                  <span className="rounded-full border border-[#f5c16c]/45 bg-[#f5c16c]/15 px-3 py-1 text-xs tracking-[0.35em] text-[#2b130f]">{Math.round(activeAttempt.completionPercentage)}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#2d140f]/70">
                  <div className="h-full rounded-full bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c]" style={{ width: `${Math.min(100, Math.round(activeAttempt.completionPercentage))}%` }} />
                </div>
                <div className="text-sm text-white/80">Step {activeAttempt.stepsCompleted} of {activeAttempt.stepsTotal}</div>
                <div className="flex gap-3">
                  <Link href="/quests" className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] px-4 py-2 text-sm font-semibold tracking-[0.35em] text-[#2b130f]">Resume Step {activeAttempt.currentStepId ?? ''}</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-lg uppercase tracking-[0.35em] text-[#f5c16c]/70">No Active Quest</p>
                <Link href="/quests" className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] px-5 py-3 text-sm font-semibold tracking-[0.35em] text-[#2b130f]">Find a Quest</Link>
                <div className="mx-auto mt-2 flex items-center justify-center gap-2 text-xs text-white/70">
                  <Lightbulb className="h-4 w-4 text-[#f5c16c]" />
                  <span>{noQuestTip}</span>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Featured Events Section */}
          <FeaturedEventsSection />

          {/* Subject Progress */}
          <QuestProgressClient subjects={subjects} />
        </main>

        {/* Right Column - Achievements + Skills */}
        <RightColumn
          achievements={achievements}
          userSkills={fullInfo?.relations.userSkills || []}
        />
      </div>
    </DashboardLayout>
  );
}
