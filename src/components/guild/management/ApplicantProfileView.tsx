"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Code, MoreHorizontal, Shield, Swords } from "lucide-react";
import Image from "next/image";
import profileApi from "@/api/profileApi";
import { FullUserInfoSocialResponse } from "@/types/user-profile";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicantProfileViewProps {
  authUserId?: string;
  initialData?: FullUserInfoSocialResponse | null;
  className?: string;
}

export function ApplicantProfileView({ authUserId, initialData, className }: ApplicantProfileViewProps) {
  const [social, setSocial] = useState<FullUserInfoSocialResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData && !!authUserId);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (initialData) {
      setSocial(initialData);
      setLoading(false);
      return;
    }
    if (!authUserId) return;

    let mounted = true;
    setLoading(true);
    setError(null);
    profileApi.getSocialByAuthId(authUserId, { size: 20, number: 1 })
      .then((res) => {
        if (mounted) {
            if (res.isSuccess && res.data) {
                setSocial(res.data);
            } else {
                setError("Failed to load profile.");
            }
        }
      })
      .catch((err) => {
        if (mounted) {
            console.error(err);
            setError("Failed to load profile.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [authUserId, initialData]);

  if (loading) {
    return (
      <div className={`p-6 ${className ?? ''}`}>
         <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-9 w-9" />
         </div>
         <div className="flex flex-col items-center">
             <Skeleton className="h-24 w-24 rounded-full" />
             <Skeleton className="mt-3 h-8 w-48" />
             <Skeleton className="mt-1 h-4 w-32" />
         </div>
      </div>
    );
  }

  if (error || !social) {
      return (
          <div className={`p-6 text-center text-rose-400 ${className ?? ''}`}>
              {error || "User not found."}
          </div>
      );
  }

  return (
    <div className={`p-6 bg-black/40 backdrop-blur-md ${className ?? ''}`}>
      <div className="flex items-center justify-end mb-4">
        <Button variant="outline" className="border-[#2D2842] text-white/70"><MoreHorizontal className="h-4 w-4" /></Button>
      </div>
      
      <div className="relative rounded-lg overflow-hidden border border-[#2D2842] bg-transparent">
        <div className="h-24 w-full" style={{ backgroundImage: `linear-gradient(90deg, #f5c16c33, transparent)` }} />
        <div className="-mt-10 flex flex-col items-center p-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-[#2D2842]">
              <AvatarImage src={social.profile.profileImageUrl ?? undefined} />
              <AvatarFallback className="bg-[#1E1B2E] text-[#f5c16c]">{(social.profile.username?.charAt(0) ?? "?")}</AvatarFallback>
            </Avatar>
          </div>
          <div className="mt-3 text-2xl font-bold text-[#f5c16c]">{(social.profile.firstName || "") + (social.profile.lastName ? ` ${social.profile.lastName}` : "") || social.profile.username}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-[#00ffff]/80"><Code className="h-4 w-4" />{social.profile.className ?? "Player"}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#f5c16c]"><Shield className="h-3 w-3" />{(social.relations.guildMembers?.[0]?.guildName) ?? "No Guild"}</div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-black/30 backdrop-blur-md p-3 border border-[#2D2842]">
          <div className="text-xs text-white/50">Achievements</div>
          <div className="text-white font-semibold">{social.counts.achievements ?? 0}</div>
        </div>
        <div className="rounded-lg bg-black/30 backdrop-blur-md p-3 border border-[#2D2842]">
          <div className="text-xs text-white/50">Quests</div>
          <div className="text-white font-semibold">{social.counts.questsCompleted ?? 0}</div>
        </div>
        <div className="rounded-lg bg-black/30 backdrop-blur-md p-3 border border-[#2D2842]">
          <div className="text-xs text-white/50">Joined</div>
          <div className="text-white font-semibold">{social.profile.createdAt ? new Date(social.profile.createdAt).toLocaleDateString() : "N/A"}</div>
        </div>
      </div>
      
      <Separator className="my-4 bg-[#2D2842]" />
      
      <Tabs value={tab} onValueChange={setTab} className="mt-2">
        <TabsList className="bg-[#1E1B2E] border border-[#2D2842] text-gray-300">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="rounded-lg border border-[#2D2842] bg-black/40 backdrop-blur-md p-4">
              <div className="text-sm font-semibold text-white">Achievements</div>
              <TooltipProvider>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {(social.relations.userAchievements ?? []).slice(0, 6).map(a => (
                    <Tooltip key={a.achievementId}>
                      <TooltipTrigger asChild>
                        <div className="h-16 w-16 rounded-full border border-[#f5c16c]/40 bg-[#13111C] flex items-center justify-center overflow-hidden">
                          {a.achievementIconUrl ? (
                            <Image src={a.achievementIconUrl} alt={a.achievementName ?? "Achievement"} width={48} height={48} className="object-contain" />
                          ) : (
                            <div className="text-xs text-[#f5c16c]/70">Badge</div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">{a.achievementName ?? "Achievement"}</div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>
            <div className="rounded-lg border border-[#2D2842] bg-black/40 backdrop-blur-md p-4">
              <div className="text-sm font-semibold text-white">Recent Activity</div>
              <div className="mt-2 space-y-4">
                {(social.relations.questAttempts ?? []).slice(0, 5).map(q => (
                  <div key={q.attemptId} className="flex items-start gap-3">
                    <Swords className="h-4 w-4 text-[#f5c16c] mt-0.5" />
                    <div>
                      <div className="text-sm text-white">{q.status === "Completed" ? "Completed" : "Attempted"} {q.questTitle}</div>
                      <div className="text-xs text-white/50">{q.completedAt ? new Date(q.completedAt).toLocaleString() : new Date(q.startedAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="stats">
          <div className="mt-4 rounded-lg border border-[#2D2842] bg-black/40 backdrop-blur-md p-4">
            <div className="text-sm font-semibold text-white">Skill Profile</div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {(social.relations.userSkills ?? []).slice(0, 6).map(s => (
                <div key={s.id} className="rounded bg-[#13111C] p-2 border border-[#2D2842]">
                  <div className="text-xs text-[#f5c16c]/80">{s.skillName}</div>
                  <div className="text-white font-semibold">Lv {s.level}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
