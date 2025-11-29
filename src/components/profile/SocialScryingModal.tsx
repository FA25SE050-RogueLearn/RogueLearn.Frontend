"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Eye, ArrowLeft, MoreHorizontal, Filter, UserPlus, Mail, Users as UsersIcon, Flag, Shield, Code, Swords } from "lucide-react";
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
  const [page, setPage] = useState(1);
  const pageSize = 7;

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

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    const filtered = allUsers.filter(u =>
      (u.username?.toLowerCase().includes(q) ?? false) ||
      (u.email?.toLowerCase().includes(q) ?? false)
    );
    setResults(filtered);
  }, [query, allUsers]);

  const allPageCount = useMemo(() => Math.max(1, Math.ceil((allUsers.length || 0) / pageSize)), [allUsers.length]);
  const allPaged = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return allUsers.slice(start, end);
  }, [allUsers, page]);

  const resultsPageCount = useMemo(() => Math.max(1, Math.ceil((results.length || 0) / pageSize)), [results.length]);
  const resultsPaged = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return results.slice(start, end);
  }, [results, page]);

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
          <motion.div key="search" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="flex h-full min-h-[60vh] flex-col gap-6 p-6 bg-black/40 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-[#f5c16c]">Scout Players</div>
            </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f5c16c]/60" size={22} />
                  <Input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search by Username or Email" className="h-14 bg-[#0b0a13]/80 pl-10 pr-12 border-0 ring-1 ring-white/10 focus:ring-[#f5c16c] text-white rounded-xl" />
                  <Button variant="ghost" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/70" size="icon"><Filter className="h-5 w-5" /></Button>
                </div>
                
                {(!query || results.length === 0) && (
                  <div className="flex flex-1 min-h-0 flex-col gap-6">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#f5c16c]/80">Suggested Allies (Same Class)</div>
                      <div className="max-h-64 overflow-y-auto pr-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(sameClassUsers.length ? sameClassUsers : []).map(u => (
                          <Card key={u.authUserId} className="group border border-[#2D2842] bg-black/40 backdrop-blur-md p-3 transition-all hover:border-[#f5c16c]/40 hover:-translate-y-1">
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
                                  <div className="text-xs text-[#00ffff]/80">{u.email ?? "Player"}</div>
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
                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#f5c16c]/80">All Players</div>
                      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                        {loading ? (
                          <div className="grid grid-cols-1 gap-3">
                            {Array.from({ length: pageSize }).map((_, i) => (
                              <Card key={i} className="border border-[#2D2842] bg-black/40 backdrop-blur-md p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                      <Skeleton className="h-4 w-40" />
                                      <Skeleton className="h-3 w-24" />
                                    </div>
                                  </div>
                                  <Skeleton className="h-8 w-28" />
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {allPaged.map(u => (
                              <Card key={u.authUserId} className="border border-[#2D2842] bg-black/40 backdrop-blur-md p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <Avatar className="h-10 w-10 border-2 border-[#2D2842]">
                                        <AvatarImage src={u.profileImageUrl ?? undefined} />
                                        <AvatarFallback className="bg-[#1E1B2E] text-[#f5c16c]">{u.username?.charAt(0) ?? "?"}</AvatarFallback>
                                      </Avatar>
                                    </div>
                                    <div>
                                      <div className="text-white font-semibold">{u.username}</div>
                                      <div className="text-xs text-white/50">{u.email ?? ""}</div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" className="border-[#2D2842] text-[#f5c16c]" size="sm" onClick={() => viewProfile(u)}><Eye className="h-4 w-4 mr-2" />View Profile</Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-white/70">
                            {allUsers.length === 0 ? (
                              <span>No results</span>
                            ) : (
                              <span>Showing {(page - 1) * pageSize + 1}–{Math.min(allUsers.length, page * pageSize)} of {allUsers.length}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`border-[#2D2842] ${page===1?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Prev</Button>
                            <span className="text-xs text-white/70">Page {page} of {allPageCount}</span>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(allPageCount, p + 1))} disabled={page === allPageCount} className={`border-[#2D2842] ${page===allPageCount?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Next</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {query && results.length > 0 && (
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {resultsPaged.map(u => (
                      <Card key={u.authUserId} className="group border border-[#2D2842] bg-black/40 backdrop-blur-md p-3 transition-all hover:border-[#f5c16c]/40 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border-2 border-[#2D2842]">
                                <AvatarImage src={u.profileImageUrl ?? undefined} />
                                <AvatarFallback className="bg-[#1E1B2E] text-[#f5c16c]">{u.username?.charAt(0) ?? "?"}</AvatarFallback>
                              </Avatar>
                              
                            </div>
                            <div>
                              <div className="text-white font-semibold">{u.username}</div>
                              <div className="text-xs text-white/50">{u.email ?? ""}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="border-[#2D2842] text-[#f5c16c]" size="sm" onClick={() => viewProfile(u)}><Eye className="h-4 w-4 mr-2" />View</Button>
                          </div>
                        </div>
                      </Card>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-white/70">
                        {results.length === 0 ? (
                          <span>No results</span>
                        ) : (
                          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(results.length, page * pageSize)} of {results.length}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`border-[#2D2842] ${page===1?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Prev</Button>
                        <span className="text-xs text-white/70">Page {page} of {resultsPageCount}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(resultsPageCount, p + 1))} disabled={page === resultsPageCount} className={`border-[#2D2842] ${page===resultsPageCount?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Next</Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
        {selected && (
          <motion.div key="dossier" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }} transition={{ duration: 0.3 }} className="p-6 bg-black/40 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" className="border-[#2D2842] text-[#f5c16c]" onClick={backToSearch}><ArrowLeft className="mr-2 h-4 w-4" />Back to Search</Button>
                  <Button variant="outline" className="border-[#2D2842] text-white/70"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
                    <div className="relative rounded-lg overflow-hidden border border-[#2D2842] bg-transparent">
                      <div className="h-24 w-full" style={{ backgroundImage: `linear-gradient(90deg, #f5c16c33, transparent)` }} />
                      <div className="-mt-10 flex flex-col items-center p-4">
                        <div className="relative">
                          <Avatar className="h-24 w-24 border-4 border-[#2D2842]">
                            <AvatarImage src={social?.profile.profileImageUrl ?? undefined} />
                            <AvatarFallback className="bg-[#1E1B2E] text-[#f5c16c]">{(social?.profile.username?.charAt(0) ?? "?")}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-[#f5c16c]">{(social?.profile.firstName || "") + (social?.profile.lastName ? ` ${social?.profile.lastName}` : "") || social?.profile.username}</div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-[#00ffff]/80"><Code className="h-4 w-4" />{social?.profile.className ?? "Player"}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-[#f5c16c]"><Shield className="h-3 w-3" />{(social?.relations.guildMembers?.[0]?.guildName) ?? "No Guild"}</div>
                      </div>
                    </div>
                
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-black/30 backdrop-blur-md p-3 border border-[#2D2842]">
                    <div className="text-xs text-white/50">Achievements</div>
                    <div className="text-white font-semibold">{social?.counts.achievements ?? 0}</div>
                  </div>
                  <div className="rounded-lg bg-black/30 backdrop-blur-md p-3 border border-[#2D2842]">
                    <div className="text-xs text-white/50">Quests</div>
                    <div className="text-white font-semibold">{social?.counts.questsCompleted ?? 0}</div>
                  </div>
                  <div className="rounded-lg bg-black/30 backdrop-blur-md p-3 border border-[#2D2842]">
                    <div className="text-xs text-white/50">Joined</div>
                    <div className="text-white font-semibold">{social?.profile.createdAt ? new Date(social.profile.createdAt).toLocaleDateString() : "N/A"}</div>
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
                            {(social?.relations.userAchievements ?? []).slice(0, 6).map(a => (
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
                          {(social?.relations.questAttempts ?? []).slice(0, 5).map(q => (
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
      <DialogContent className="max-w-4xl max-h-[85vh] border-[#f5c16c]/30 bg-[#0b0a13]/95 p-0">
        <DialogTitle className="sr-only">Social Scrying</DialogTitle>
        <SocialScryingContent />
      </DialogContent>
    </Dialog>
  );
}