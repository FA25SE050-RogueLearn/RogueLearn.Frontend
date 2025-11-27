// roguelearn-web/src/app/dashboard/page.tsx
import ProfileModalLauncher from "@/components/dashboard/ProfileModalLauncher";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createServerApiClients, checkApiHealth } from "@/lib/api-server";
import type { FullUserInfoResponse, QuestAttemptItem } from "@/types/user-profile";
import Link from "next/link";
import { BookOpen, Trophy, Sword, Calendar, Users, Shield, AlertCircle, Cpu, Braces, Atom, Cog, GraduationCap, ScrollText, Lightbulb } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import QuestProgressClient from "@/components/dashboard/QuestProgressClient";

// Define interfaces for the data we expect from our backend APIs.
// This provides type safety and clarity for our frontend code.
// Refactored to use only FullUserInfoResponse data

// The homepage is the main dashboard, now fetching all data from the backend.
export default async function DashboardPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
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
    console.log('JWT Token (Dashboard Access):', session.access_token);
    console.log('Token Type:', session.token_type);
    console.log('Expires At:', session.expires_at);
    console.log('User ID:', user.id);
  } else {
    console.log('No JWT token found in session');
  }

  // Create authenticated API clients for server-side requests.
  // We now use a single `coreApiClient` for both user and quest data.
  const { coreApiClient } = await createServerApiClients();

  let fullInfo: FullUserInfoResponse | null = null;

  // Quick health check before making API calls
  const apiHealthy = await checkApiHealth(process.env['NEXT_PUBLIC_API_URL']);

  if (!apiHealthy) {
    console.warn('API health check failed - skipping data fetching');
  } else {
    try {
      const res = await coreApiClient.get<FullUserInfoResponse>(`/api/users/me/full`, {
        params: { 'page[size]': 20, 'page[number]': 1 }
      });
      fullInfo = res.data;
    } catch (error) {
      console.error("Failed to fetch full user info:", error);
    }
  }

  // Determine active quest purely from quest attempts
  const activeAttempt: QuestAttemptItem | undefined = fullInfo?.relations.questAttempts.find(a => {
    const s = a.status.toLowerCase();
    return s === 'in_progress' || s === 'inprogress';
  }) || fullInfo?.relations.questAttempts.find(a => {
    const s = a.status.toLowerCase();
    return s === 'not_started' || s === 'notstarted';
  });

  const xpChunk = fullInfo ? ((fullInfo.profile.experiencePoints ?? 0) % 1000) : 0;
  const xpPercentage = fullInfo ? (xpChunk / 1000) * 100 : 0;

  const subjects = fullInfo?.relations.studentTermSubjects ?? [];
  const pendingSubject = subjects.find(ss => {
    const st = (ss.status || '').toLowerCase();
    return st.includes('studying') || st.includes('not');
  });
  const noQuestTip = pendingSubject
    ? `Tip: Your '${pendingSubject.subjectName}' is ${((pendingSubject.status||'').toLowerCase().includes('studying')) ? 'in progress' : 'not started'}. Check the guild hall for updates.`
    : 'Tip: Start a new quest to gain XP today.';

  const achievementGroups = (() => {
    const list = (fullInfo?.relations.userAchievements ?? []).slice();
    const map: Record<string, { id?: string; name?: string | null; icon?: string | null; count: number; lastEarnedAt?: string }> = {};
    list.forEach((a) => {
      const key = (a.achievementId || a.achievementName || `${a.earnedAt}`);
      const prev = map[key] || { id: a.achievementId, name: a.achievementName, icon: a.achievementIconUrl, count: 0, lastEarnedAt: a.earnedAt };
      const newer = (!prev.lastEarnedAt || new Date(a.earnedAt).getTime() > new Date(prev.lastEarnedAt).getTime()) ? a.earnedAt : prev.lastEarnedAt;
      map[key] = { id: a.achievementId, name: a.achievementName, icon: a.achievementIconUrl, count: prev.count + 1, lastEarnedAt: newer };
    });
    return Object.values(map).sort((x,y) => new Date(y.lastEarnedAt || 0).getTime() - new Date(x.lastEarnedAt || 0).getTime());
  })();

  return (
    <DashboardLayout>
      <div className="grid gap-6 grid-cols-[27%_48%_25%] min-h-screen">
        <div className="relative overflow-hidden rounded-[30px] border border-[#f5c16c]/20 bg-linear-to-br from-[#2a140f]/92 via-[#160b08]/94 to-[#0a0503]/96 p-6 shadow-[0_22px_70px_rgba(38,12,6,0.55)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.25),transparent_70%)]" />
          <div className="relative z-10 flex h-full flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full border border-[#f5c16c]/50 bg-cover bg-center shadow-[0_10px_30px_rgba(210,49,135,0.35)]" style={{ backgroundImage: `url('${fullInfo?.profile.profileImageUrl || 'https://images.unsplash.com/photo-1582719471209-8a1c875b9fff?auto=format&fit=crop&w=400&q=80'}')` }} />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                  <p className="text-xl font-semibold text-white">{fullInfo?.profile.firstName && fullInfo?.profile.lastName ? `${fullInfo.profile.firstName} ${fullInfo.profile.lastName}` : (fullInfo?.profile.username || "Scholar")}</p>
                  </div>
            </div>
            </div>

            <div className="grid gap-5 text-sm uppercase tracking-[0.3em] text-[#f5c16c]/60">
              <div className="flex items-center justify-between">
                <span>Class</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-3 py-1 text-white">
                  <GraduationCap className="h-4 w-4 text-[#f5c16c]" />
                  <span className="normal-case tracking-normal text-sm">{fullInfo?.profile.className || 'Unassigned'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Curriculum</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-3 py-1 text-white">
                  <ScrollText className="h-4 w-4 text-[#f5c16c]" />
                  <span className="normal-case tracking-normal text-sm">{fullInfo?.profile.curriculumName || 'Unassigned'}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-2xl border border-[#f5c16c]/30 bg-[#f5c16c]/10 p-4 text-white">
                  <p className="text-[11px] tracking-[0.45em] text-[#f5c16c]/85">Quests In Progress</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{fullInfo?.counts.questsInProgress ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-[0.45em] text-white/75">Active expeditions</p>
                </div>
                <div className="rounded-2xl border border-[#d23187]/40 bg-[#d23187]/15 p-4 text-white">
                  <p className="text-[11px] tracking-[0.45em] text-[#f9d9eb]">Quests Completed</p>
                  <p className="mt-3 text-3xl font-semibold">{fullInfo?.counts.questsCompleted ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-[0.45em] text-[#f9d9eb]/80">Victories logged</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-[#f5c16c]/30 bg-[#d23187]/12 p-4 text-white">
                  <div className="flex items-center justify-between"><span>Guild</span><Link href="/community/guilds" className="text-[#f5c16c] text-xs">Visit</Link></div>
                  <div className="mt-2 text-sm">
                    {fullInfo?.relations.guildMembers?.[0] ? `${fullInfo.relations.guildMembers[0].guildName} • ${fullInfo.relations.guildMembers[0].role}` : 'None'}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#f5c16c]/30 bg-[#1f0d09]/85 p-4 text-white">
                  <div className="flex items-center justify-between"><span>Party</span><Link href="/parties" className="text-[#f5c16c] text-xs">Visit</Link></div>
                  <div className="mt-2 text-sm">
                    {fullInfo?.relations.partyMembers?.[0] ? `${fullInfo.relations.partyMembers[0].partyName} • ${fullInfo.relations.partyMembers[0].role}` : 'None'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <section className="grid grid-cols-4 gap-4">
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

          <QuestProgressClient subjects={subjects} />
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-[24px] border border-[#f5c16c]/20 bg-[#1a0b08]/80 p-4">
            {fullInfo?.relations.lecturerVerificationRequests?.length ? (
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#f5c16c]/70">Application Status</p>
                <span className="text-xs text-white/80">{fullInfo.relations.lecturerVerificationRequests[0].status}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#f5c16c]/70">Lecturer Access</p>
                <ProfileModalLauncher label="Become a Lecturer" defaultTab="verification" />
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-[#f5c16c]/22 bg-[#1f0d09]/85 p-6">
            <p className="text-[11px] uppercase tracking-[0.45em] text-[#f5c16c]/80">Skills</p>
            <div className="mt-3 space-y-3">
              {(fullInfo?.relations.userSkills ?? []).slice(0,8).map(s => {
                const n = s.skillName.toLowerCase();
                const IconComp = n.includes('cpu') || n.includes('memory') ? Cpu : n.includes('react') ? Atom : n.includes('js') || n.includes('javascript') ? Braces : Cog;
                const pct = Math.min(100, (Math.min(s.level,10)/10)*100);
                return (
                  <div key={s.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-white/90">
                        <div className="h-6 w-6 rounded-md border border-[#f5c16c]/30 bg-[#2d140f]/60 flex items-center justify-center">
                          <IconComp className="h-4 w-4 text-[#f5c16c]" />
                        </div>
                        <span>{s.skillName}</span>
                      </div>
                      <span className="text-xs text-white/70">Lv.{s.level}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#2d140f]/60">
                      <div className="h-full rounded-full bg-linear-to-r from-[#f061a6] to-[#f5c16c] shadow-[0_0_12px_rgba(245,193,108,0.35)]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#f5c16c]/20 bg-[#1c0c08]/85 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]/70">Achievements</p>
            <TooltipProvider>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {achievementGroups.length ? achievementGroups.map((a) => (
                  <Tooltip key={(a.id ?? a.name ?? '') + (a.lastEarnedAt ?? '')}>
                    <TooltipTrigger asChild>
                      <div className="relative h-20 w-20 rounded-full border-2 border-[#f5c16c]/40 bg-cover bg-center shadow-[0_10px_20px_rgba(245,193,108,0.2)]" style={{ backgroundImage: `url('${a.icon || 'https://images.unsplash.com/photo-1611162616305-c69b3fa82bb3?q=80&w=200&auto=format&fit=crop'}')` }}>
                        <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-[#1a0b08] px-2.5 py-0.5 text-[11px] font-bold text-white border border-[#f5c16c]/40">×{a.count}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="border-[#f5c16c]/30 bg-[#1a0b08] text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-full border border-[#f5c16c]/40 bg-cover bg-center" style={{ backgroundImage: `url('${a.icon || ''}')` }} />
                        <div>
                          <div className="text-sm font-semibold">{a.name ?? 'Achievement'}</div>
                          <div className="text-xs text-white/70">Unlocked {a.lastEarnedAt ? new Date(a.lastEarnedAt).toLocaleString() : ''}</div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )) : (
                  <div className="text-sm text-white/70">None</div>
                )}
              </div>
            </TooltipProvider>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
