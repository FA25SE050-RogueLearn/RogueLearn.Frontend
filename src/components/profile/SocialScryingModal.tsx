"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Eye, ArrowLeft, MoreHorizontal } from "lucide-react";
import profileApi from "@/api/profileApi";
import { FullUserInfoSocialResponse, UserProfileSearchResult, UserProfileDto } from "@/types/user-profile";

export function SocialScryingContent() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UserProfileSearchResult[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfileSearchResult[]>([]);
  const [sameClassUsers, setSameClassUsers] = useState<UserProfileSearchResult[]>([]);
  const [selected, setSelected] = useState<UserProfileSearchResult | null>(null);
  const [social, setSocial] = useState<FullUserInfoSocialResponse | null>(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [meRes, listRes] = await Promise.all([profileApi.getMyProfile(), profileApi.getAllUserProfilesAuthorized()]);
        if (!mounted) return;
        const me = meRes.data ?? null;
        const base: UserProfileDto[] = listRes.data?.userProfiles ?? [];
        const mapToSearch = (u: UserProfileDto): UserProfileSearchResult => ({
          authUserId: u.authUserId,
          username: u.username,
          email: u.email,
          profileImageUrl: u.profileImageUrl ?? null,
          level: u.level,
          className: null,
          guildName: null,
        });
        const all = base.map(mapToSearch);
        setAllUsers(all);
        if (me?.classId) {
          const same = base.filter(u => u.classId === me.classId).map(mapToSearch);
          setSameClassUsers(same);
        } else {
          setSameClassUsers([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSearch = async () => {
    setLoading(true);
    try {
      const res = await profileApi.search(query);
      setResults(res.data?.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  const viewProfile = async (u: UserProfileSearchResult) => {
    setSelected(u);
    setSocial(null);
    setTab("overview");
    setLoading(true);
    try {
      const res = await profileApi.getSocialByAuthId(u.authUserId, { size: 20, number: 1 });
      setSocial(res.data ?? null);
    } finally {
      setLoading(false);
    }
  };

  const backToSearch = () => {
    setSelected(null);
    setSocial(null);
    setTab("overview");
  };

  

  return (
    <div className="relative">
      <AnimatePresence initial={false} mode="wait">
        {!selected && (
          <motion.div key="search" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="grid grid-cols-1 gap-6 p-6 bg-[#13111C]">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-[#f5c16c]">Scout Players</div>
            </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f5c16c]/60" size={20} />
                  <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by Hero Name, Guild Tag, or UID..." className="h-12 bg-[#1E1B2E] pl-10 border border-[#2D2842] focus:border-[#f5c16c] text-white" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={onSearch} disabled={loading} className="bg-[#f5c16c] text-black">Search</Button>
                </div>
                {(!query || results.length === 0) && (
                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#f5c16c]/80">Suggested Allies (Same Class)</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(sameClassUsers.length ? sameClassUsers : []).map(u => (
                          <Card key={u.authUserId} className="group border border-[#2D2842] bg-[#1E1B2E] p-3 transition-all hover:border-[#f5c16c]/40">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-10 w-10 border-2 border-[#f5c16c]/30">
                                    <AvatarImage src={u.profileImageUrl ?? undefined} />
                                    <AvatarFallback className="bg-[#1E1B2E] text-[#f5c16c]">{u.username?.charAt(0) ?? "?"}</AvatarFallback>
                                  </Avatar>
                                </div>
                                <div>
                                  <div className="text-white font-semibold">{u.username}</div>
                                  <div className="text-xs text-[#00ffff]/80">{u.className ?? "Player"}</div>
                                </div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="outline" className="border-[#2D2842] text-[#f5c16c]" size="sm" onClick={() => viewProfile(u)}><Eye className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#f5c16c]/80">All Players</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {allUsers.map(u => (
                          <Card key={u.authUserId} className="group border border-[#2D2842] bg-[#1E1B2E] p-3 transition-all hover:border-[#f5c16c]/40">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-10 w-10 border-2 border-[#f5c16c]/30">
                                    <AvatarImage src={u.profileImageUrl ?? undefined} />
                                    <AvatarFallback className="bg-[#1E1B2E] text-[#f5c16c]">{u.username?.charAt(0) ?? "?"}</AvatarFallback>
                                  </Avatar>
                                </div>
                                <div>
                                  <div className="text-white font-semibold">{u.username}</div>
                                  <div className="text-xs text-[#00ffff]/80">{u.className ?? "Player"}</div>
                                </div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="outline" className="border-[#2D2842] text-[#f5c16c]" size="sm" onClick={() => viewProfile(u)}><Eye className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {query && results.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {results.map(u => (
                      <Card key={u.authUserId} className="group border border-[#2D2842] bg-[#1E1B2E] p-3 transition-all hover:border-[#f5c16c]/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border-2 border-[#f5c16c]/30">
                                <AvatarImage src={u.profileImageUrl ?? undefined} />
                                <AvatarFallback className="bg-[#1E1B2E] text-[#f5c16c]">{u.username?.charAt(0) ?? "?"}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <div className="text-white font-semibold">{u.username}</div>
                              <div className="text-xs text-[#00ffff]/80">{u.className ?? "Player"}</div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" className="border-[#2D2842] text-[#f5c16c]" size="sm" onClick={() => viewProfile(u)}><Eye className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
        {selected && (
          <motion.div key="dossier" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} className="p-6 bg-[#13111C]">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" className="border-[#2D2842] text-[#f5c16c]" onClick={backToSearch}><ArrowLeft className="mr-2 h-4 w-4" />Back to Search</Button>
                  <Button variant="outline" className="border-[#2D2842] text-white/70"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
                    <div className="relative rounded-lg overflow-hidden border border-[#2D2842] bg-[#1E1B2E]">
                      <div className="h-24 w-full bg-[url('/images/cyber-grid.jpg')] bg-cover opacity-30" />
                      <div className="-mt-10 flex flex-col items-center p-4">
                        <div className="relative">
                          <Avatar className="h-20 w-20 border-4 border-[#f5c16c]/50">
                            <AvatarImage src={social?.profile.profileImageUrl ?? undefined} />
                            <AvatarFallback className="bg-[#1E1B2E] text-[#f5c16c]">{(social?.profile.username?.charAt(0) ?? "?")}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-[#f5c16c]">{(social?.profile.firstName || "") + (social?.profile.lastName ? ` ${social?.profile.lastName}` : "") || social?.profile.username}</div>
                        <div className="text-sm text-[#00ffff]/80">{social?.profile.className ?? "Player"}</div>
                        <div className="mt-1 px-2 py-0.5 text-xs rounded bg-[#f5c16c]/20 text-[#f5c16c]">{(social?.relations.guildMembers?.[0]?.guildName) ?? "Guildless"}</div>
                        
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
                  <div className="rounded-lg border border-[#2D2842] bg-[#1E1B2E] p-4">
                        <div className="text-sm font-semibold text-white">Achievements</div>
                        <TooltipProvider>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {(social?.relations.userAchievements ?? []).slice(0, 3).map(a => (
                              <Tooltip key={a.achievementId}>
                                <TooltipTrigger asChild>
                                  <div className="h-16 w-16 rounded border border-[#f5c16c]/40 bg-[#13111C] flex items-center justify-center overflow-hidden">
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
                      <div className="rounded-lg border border-[#2D2842] bg-[#1E1B2E] p-4">
                        <div className="text-sm font-semibold text-white">Recent Activity</div>
                        <div className="mt-2 space-y-2">
                          {(social?.relations.questAttempts ?? []).slice(0, 5).map(q => (
                            <div key={q.attemptId} className="text-sm text-gray-300">Completed {q.questTitle}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="stats">
                    <div className="mt-4 rounded-lg border border-[#2D2842] bg-[#1E1B2E] p-4">
                      <div className="text-sm font-semibold text-white">Skill Profile</div>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {(social?.relations.userSkills ?? []).slice(0, 6).map(s => (
                          <div key={s.id} className="rounded bg-[#13111C] p-2 border border-[#2D2842]">
                            <div className="text-xs text-[#f5c16c]/80">{s.skillName}</div>
                            <div className="text-white font-semibold">Lv {s.level}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
      </AnimatePresence>
    </div>
  );
}

interface SocialScryingModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function SocialScryingModal({ open, onOpenChange }: SocialScryingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-[#f5c16c]/30 bg-[#0b0a13]/95 p-0">
        <SocialScryingContent />
      </DialogContent>
    </Dialog>
  );
}