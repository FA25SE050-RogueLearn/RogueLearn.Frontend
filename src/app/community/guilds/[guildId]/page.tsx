"use client";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildDto, GuildMemberDto, GuildRole } from "@/types/guilds";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, Lock, Globe, Scroll, Swords, Crown, Settings, HelpCircle, Trophy } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const SECTION_CARD_CLASS = 'relative overflow-hidden rounded-3xl border border-[#f5c16c]/25 bg-[#120806]/80';
const HERO_CARD_CLASS = 'relative overflow-hidden rounded-[32px] border border-[#f5c16c]/30 bg-linear-to-br from-[#1c0906]/95 via-[#120605]/98 to-[#040101]';
const CARD_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};
const BACKDROP_GRADIENT: CSSProperties = {
  background: 'radial-gradient(circle at top, rgba(210,49,135,0.25), transparent 60%), linear-gradient(180deg, #100414 0%, #06020b 60%, #010103 100%)',
};
const BACKDROP_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
  opacity: 0.08,
  mixBlendMode: 'screen',
};

export default function GuildDetailPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [guild, setGuild] = useState<GuildDto | null>(null);
  
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<GuildMemberDto[]>([]);
  const [myRole, setMyRole] = useState<GuildRole | null>(null);
  const [isLecturerGuild, setIsLecturerGuild] = useState<boolean>(false);
  const [configOpen, setConfigOpen] = useState<boolean>(false);
  const [cfgName, setCfgName] = useState<string>("");
  const [cfgDescription, setCfgDescription] = useState<string>("");
  const [cfgPrivacy, setCfgPrivacy] = useState<'public' | 'private'>("public");
  const [cfgMaxMembers, setCfgMaxMembers] = useState<number>(50);
  const [cfgSubmitting, setCfgSubmitting] = useState<boolean>(false);
  const [cfgError, setCfgError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!guildId) return;
    setLoading(true);
    Promise.all([
      guildsApi.getById(guildId as string),
      guildsApi.getMembers(guildId as string),
      profileApi.getMyProfile(),
    ])
      .then(([gRes, membersRes, pRes]) => {
        if (cancelled) return;
        const g = gRes.data ?? null;
        setGuild(g);
        const authId = pRes.data?.authUserId ?? null;
        setMyAuthUserId(authId);
        setMembers(Array.isArray(membersRes.data) ? (membersRes.data as GuildMemberDto[]) : []);
        const directCount = Array.isArray(membersRes.data) ? membersRes.data.length : null;
        setMemberCount(directCount ?? gRes.data?.memberCount ?? null);
        setIsLecturerGuild(!!g?.isLecturerGuild);
        if (g) {
          setCfgName(g.name);
          setCfgDescription(g.description);
          setCfgPrivacy(g.isPublic ? 'public' : 'private');
          setCfgMaxMembers(g.maxMembers);
        }
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load guild", err);
        if (cancelled) return;
        setError("Failed to load guild. Please try again.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [guildId]);

  // Derive my role from members + my auth id
  useEffect(() => {
    const me = members.find((m) => m.authUserId === myAuthUserId) || null;
    setMyRole(me?.role ?? null);
  }, [members, myAuthUserId]);

  // Sync tabs with hash (#home, #posts, #rankings, #meetings, #manage)
  useEffect(() => {
    const applyHash = () => {
      const hash =
        typeof window !== "undefined"
          ? window.location.hash.replace(/^#/, "")
          : "";
      const isMemberNow = !!guild && !!members.find((m) => m.authUserId === myAuthUserId);
      const canSeeMeetingsNow = isMemberNow;
      if (hash === "home" || hash === "posts" || hash === "rankings") {
        setActiveTab(hash);
      } else if (hash === "meetings") {
        setActiveTab(canSeeMeetingsNow ? "meetings" : "home");
      } else if (hash === "manage") {
        setActiveTab(isMemberNow ? "manage" : "home");
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [myRole, guild, members, myAuthUserId]);

  const isMember = !!guild && !!members.find((m) => m.authUserId === myAuthUserId);
  const canSeeMeetings = isMember;
  const canManage = isMember && (myRole === "GuildMaster");

  const displayName = (m?: GuildMemberDto | null): string | undefined => {
    if (!m) return undefined;
    const username = (m.username ?? "").trim();
    if (username) return username;
    const full = `${(m.firstName ?? "").trim()} ${(m.lastName ?? "").trim()}`.trim();
    if (full) return full;
    const email = (m.email ?? "").trim();
    return email || undefined;
  };
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => (b.contributionPoints ?? 0) - (a.contributionPoints ?? 0));
  }, [members]);
  const top3 = useMemo(() => sortedMembers.slice(0, 3), [sortedMembers]);
  const rest = useMemo(() => sortedMembers.slice(3), [sortedMembers]);
  const myEntry = useMemo(() => sortedMembers.find((m) => m.authUserId === myAuthUserId) || null, [sortedMembers, myAuthUserId]);
  const rankOf = (m: GuildMemberDto, idx: number) => (typeof m.rankWithinGuild === "number" && m.rankWithinGuild > 0 ? m.rankWithinGuild : idx + 1);
  const [rankPage, setRankPage] = useState<number>(1);
  const rankPageSize = 10;
  const rankPageCount = useMemo(() => Math.max(1, Math.ceil((sortedMembers.length || 0) / rankPageSize)), [sortedMembers.length]);
  const safeRankPage = useMemo(() => Math.min(Math.max(1, rankPage), rankPageCount), [rankPage, rankPageCount]);
  const rankPagedMembers = useMemo(() => {
    const start = (safeRankPage - 1) * rankPageSize;
    const end = start + rankPageSize;
    return sortedMembers.slice(start, end);
  }, [sortedMembers, safeRankPage]);

  const handleApply = async () => {
    if (!guildId) return;
    setSubmitting(true);
    try {
      await guildsApi.applyToJoin(guildId as string, {
        message: joinMessage || null,
      });
      toast.info("Join request submitted.");
      setJoinMessage("");
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to submit join request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_GRADIENT} /> */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_TEXTURE} />
      
      <div className="relative z-20">
        <div className="flex flex-col gap-6 pb-16">
          {loading && (
            <Card className={SECTION_CARD_CLASS}>
              <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10">
                <Skeleton className="h-8 w-64 bg-white/10" />
              </CardHeader>
              <CardContent className="relative z-10">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-2/3 mt-2 bg-white/10" />
              </CardContent>
            </Card>
          )}
          
          {error && (
            <Card className={SECTION_CARD_CLASS}>
              <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
              <CardContent className="relative z-10 py-16 text-center">
                <p className="text-sm text-rose-400">{error}</p>
              </CardContent>
            </Card>
          )}
          
          {!loading && guild && (
            <>
              {/* Guild Header Card */}
              <Card className={HERO_CARD_CLASS}>
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.18),transparent_55%)]" />
                <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                
                <CardHeader className="relative z-10 border-b border-[#f5c16c]/20 pb-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d23187]/20 border border-[#d23187]/40">
                          <Shield className="h-8 w-8 text-[#f5c16c]" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]">Guild Hall</p>
                          <CardTitle className="text-3xl text-white">{guild.name}</CardTitle>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl">
                        {guild.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {guild.isPublic ? (
                        <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                          <Globe className="h-3.5 w-3.5" />
                          Open
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-400">
                          <Lock className="h-3.5 w-3.5" />
                          Private
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#f5c16c]">
                        <Users className="h-3.5 w-3.5" />
                        {memberCount ?? guild.memberCount} Heroes
                      </div>
                      {isLecturerGuild && (
                        <div className="flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-300">
                          <Scroll className="h-3.5 w-3.5" />
                          Lecturer Guild
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 pt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowInfoModal(true)}
                      className="flex items-center gap-2 rounded-full border border-[#f5c16c]/20 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white"
                      title="Guild overview"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      Info
                    </button>
                    {canManage && (
                      <button
                        onClick={() => setConfigOpen(true)}
                        className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-300 hover:border-amber-400/50 hover:bg-amber-400/20"
                        title="Configure Guild"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Configure
                      </button>
                    )}
                    {!isMember && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] px-6 text-xs uppercase tracking-[0.4em] text-[#2b130f] shadow-[0_12px_30px_rgba(210,49,135,0.35)]">
                            <Swords className="mr-2 h-4 w-4" />
                            Request to Join
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-[#f5c16c]/30 bg-[#1a0e0d]">
                          <DialogHeader>
                            <DialogTitle className="text-xl text-white">Join {guild.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold uppercase tracking-wide text-white/80">
                                Your Message (Optional)
                              </label>
                              <Textarea
                                value={joinMessage}
                                onChange={(e) => setJoinMessage(e.target.value)}
                                placeholder="Tell the guild masters why you wish to join their ranks..."
                                rows={4}
                                className="border-[#f5c16c]/25 bg-[#140707]/80 text-white placeholder:text-foreground/40"
                              />
                            </div>
                            <div className="flex gap-3">
                              <Button
                                onClick={handleApply}
                                disabled={submitting}
                                className="flex-1 rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] text-[#2b130f]"
                              >
                                {submitting ? "Submitting..." : "Submit Request"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {isMember && myRole === "GuildMaster" && (
                      <div className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
                        <Crown className="h-3.5 w-3.5" />
                        Guild Master
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configure Guild Modal */}
              <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                <DialogContent className="border-[#f5c16c]/30 bg-[#1a0e0d]">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white">Configure Guild Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-white/80">Name</label>
                      <Input value={cfgName} onChange={(e) => setCfgName(e.target.value)} className="mt-1 border-[#f5c16c]/25 bg-[#140707]/80 text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-white/80">Description</label>
                      <Textarea value={cfgDescription} onChange={(e) => setCfgDescription(e.target.value)} rows={4} className="mt-1 border-[#f5c16c]/25 bg-[#140707]/80 text-white" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-white/80">Privacy</label>
                        <Select value={cfgPrivacy} onValueChange={(v) => setCfgPrivacy(v as 'public' | 'private')}>
                          <SelectTrigger className="mt-1 border-[#f5c16c]/25 bg-[#140707]/80 text-white">
                            <SelectValue placeholder="Select privacy" />
                          </SelectTrigger>
                          <SelectContent className="border-[#f5c16c]/25 bg-[#1a0e0d] text-white">
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-white/80">Max Members</label>
                        <Input
                          type="number"
                          min={Math.max(1, (memberCount ?? guild?.memberCount ?? 0))}
                          max={isLecturerGuild ? 100 : undefined}
                          value={String(cfgMaxMembers)}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setCfgMaxMembers(val);
                            const cc = memberCount ?? guild?.memberCount ?? 0;
                            if (val < cc) setCfgError('Max members cannot be less than current members');
                            else if (isLecturerGuild && val > 100) setCfgError('Lecturer guild max is 100');
                            else if (val < 1) setCfgError('Max members must be positive');
                            else setCfgError(null);
                          }}
                          className="mt-1 border-[#f5c16c]/25 bg-[#140707]/80 text-white"
                        />
                        {cfgError && <div className="mt-1 text-xs text-rose-400">{cfgError}</div>}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={async () => {
                          if (!guildId) return;
                          setCfgSubmitting(true);
                          try {
                            const cc = memberCount ?? guild?.memberCount ?? 0;
                            if (cfgMaxMembers < cc) { setCfgError('Max members cannot be less than current members'); setCfgSubmitting(false); return; }
                            if (isLecturerGuild && cfgMaxMembers > 100) { setCfgError('Lecturer guild max is 100'); setCfgSubmitting(false); return; }
                            if (cfgMaxMembers < 1) { setCfgError('Max members must be positive'); setCfgSubmitting(false); return; }
                            await guildsApi.configureSettings(guildId as string, {
                              name: (cfgName || '').trim() || (guild?.name || ''),
                              description: cfgDescription || '',
                              privacy: cfgPrivacy,
                              maxMembers: cfgMaxMembers > 0 ? cfgMaxMembers : (guild?.maxMembers || 50),
                            });
                            const refreshed = await guildsApi.getById(guildId as string);
                            if (refreshed.isSuccess) setGuild(refreshed.data || guild);
                            setConfigOpen(false);
                            toast.success('Guild settings updated.');
                          } catch (err) {
                            // toast.error('Failed to update settings.');
                          } finally {
                            setCfgSubmitting(false);
                          }
                        }}
                        disabled={cfgSubmitting || !!cfgError}
                        className="flex-1 rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] text-[#2b130f]"
                      >
                        {cfgSubmitting ? 'Saving...' : 'Save Settings'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setConfigOpen(false)}
                        className="flex-1 rounded-full border-[#f5c16c]/30 bg-[#140707]/80 text-[#f5c16c]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v);
                  if (typeof window !== "undefined") window.location.hash = v;
                }}
                className="mt-2"
              >
                <TabsList className="mb-6 inline-flex rounded-full border border-[#f5c16c]/20 bg-[#120806]/90 p-1">
                  <TabsTrigger
                    value="home"
                    className="rounded-full data-[state=active]:bg-linear-to-r data-[state=active]:from-[#d23187] data-[state=active]:via-[#f5c16c] data-[state=active]:to-[#f5c16c] data-[state=active]:text-[#2b130f] data-[state=active]:shadow-lg"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Home
                  </TabsTrigger>
                  <TabsTrigger
                    value="posts"
                    className="rounded-full data-[state=active]:bg-linear-to-r data-[state=active]:from-[#d23187] data-[state=active]:via-[#f5c16c] data-[state=active]:to-[#f5c16c] data-[state=active]:text-[#2b130f] data-[state=active]:shadow-lg"
                  >
                    <Scroll className="mr-2 h-4 w-4" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="rankings"
                    className="rounded-full data-[state=active]:bg-linear-to-r data-[state=active]:from-[#d23187] data-[state=active]:via-[#f5c16c] data-[state=active]:to-[#f5c16c] data-[state=active]:text-[#2b130f] data-[state=active]:shadow-lg"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Rankings
                  </TabsTrigger>
                  {canSeeMeetings && (
                    <TabsTrigger
                      value="meetings"
                      className="rounded-full data-[state=active]:bg-linear-to-r data-[state=active]:from-[#d23187] data-[state=active]:via-[#f5c16c] data-[state=active]:to-[#f5c16c] data-[state=active]:text-[#2b130f] data-[state=active]:shadow-lg"
                    >
                      <Swords className="mr-2 h-4 w-4" />
                      Meetings
                    </TabsTrigger>
                  )}
                  {isMember && (
                    <TabsTrigger
                      value="manage"
                      className="rounded-full data-[state=active]:bg-linear-to-r data-[state=active]:from-[#d23187] data-[state=active]:via-[#f5c16c] data-[state=active]:to-[#f5c16c] data-[state=active]:text-[#2b130f] data-[state=active]:shadow-lg"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="home" className="space-y-6">
                  <Card className={SECTION_CARD_CLASS}>
                    <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                    <CardContent className="relative z-10 py-16 text-center">
                      <Shield className="mx-auto mb-4 h-12 w-12 text-[#f5c16c]" />
                      <h3 className="mb-2 text-xl font-semibold text-white">Welcome to {guild.name}</h3>
                      <p className="text-sm text-foreground/70">
                        Use the tabs above to explore posts, meetings, and more.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="posts" className="space-y-4">
                  <GuildPostsSection guildId={guild.id} />
                </TabsContent>

                <TabsContent value="rankings" className="space-y-8">
                  <div className="flex items-end justify-center gap-12 pt-4 w-full">
                    <div className="flex flex-col items-center">
                      {top3[1] && (
                        <div className="w-20 h-20 rounded-full border-4 border-gray-400 overflow-hidden mb-2 relative">
                          <Avatar className="w-full h-full">
                            <AvatarImage className="object-cover" src={top3[1].profileImageUrl ?? undefined} alt={displayName(top3[1]) ?? ""} />
                            <AvatarFallback>{(displayName(top3[1]) ?? "").slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 w-full bg-gray-400 text-black text-center text-xs font-bold">#2</div>
                        </div>
                      )}
                      <div className="text-white font-bold">{displayName(top3[1]) ?? "—"}</div>
                      <div className="text-gray-500 text-xs">{(top3[1]?.contributionPoints ?? 0).toLocaleString()} Points</div>
                      <div className="h-24 w-24 bg-linear-to-t from-gray-400/20 to-transparent rounded-t-lg mt-2"></div>
                    </div>

                    <div className="flex flex-col items-center relative -top-6">
                      <div className="absolute -top-8 text-4xl">👑</div>
                      {top3[0] && (
                        <div className="w-24 h-24 rounded-full border-4 border-[#d4a353] overflow-hidden mb-2 relative">
                          <Avatar className="w-full h-full">
                            <AvatarImage className="object-cover" src={top3[0].profileImageUrl ?? undefined} alt={displayName(top3[0]) ?? ""} />
                            <AvatarFallback>{(displayName(top3[0]) ?? "").slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 w-full bg-[#d4a353] text-black text-center text-xs font-bold">#1</div>
                        </div>
                      )}
                      <div className="text-[#d4a353] font-bold text-lg">{displayName(top3[0]) ?? "—"}</div>
                      <div className="text-[#d4a353]/80 text-sm">{(top3[0]?.contributionPoints ?? 0).toLocaleString()} Points</div>
                      <div className="h-32 w-32 bg-linear-to-t from-[#d4a353]/20 to-transparent rounded-t-lg mt-2 border-t border-[#d4a353]/30"></div>
                    </div>

                    <div className="flex flex-col items-center">
                      {top3[2] && (
                        <div className="w-20 h-20 rounded-full border-4 border-orange-700 overflow-hidden mb-2 relative">
                          <Avatar className="w-full h-full">
                            <AvatarImage className="object-cover" src={top3[2].profileImageUrl ?? undefined} alt={displayName(top3[2]) ?? ""} />
                            <AvatarFallback>{(displayName(top3[2]) ?? "").slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 w-full bg-orange-700 text-white text-center text-xs font-bold">#3</div>
                        </div>
                      )}
                      <div className="text-white font-bold">{displayName(top3[2]) ?? "—"}</div>
                      <div className="text-gray-500 text-xs">{(top3[2]?.contributionPoints ?? 0).toLocaleString()} Points</div>
                      <div className="h-20 w-24 bg-linear-to-t from-orange-700/20 to-transparent rounded-t-lg mt-2"></div>
                    </div>
                  </div>

                  <Card className={SECTION_CARD_CLASS}>
                    <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                    <CardHeader className="relative z-10 border-b border-[#f5c16c]/20 pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold text-sm uppercase tracking-widest flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-[#f5c16c]" /> Guild Rankings
                        </h3>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10 p-0">
                      <table className="w-full text-left text-sm text-foreground/70">
                        <thead className="bg-black/40 text-[11px] uppercase font-bold text-foreground/50 border-b border-[#f5c16c]/20">
                          <tr>
                            <th className="p-4 w-[15%]">Rank</th>
                            <th className="p-4 w-[45%]">Hero</th>
                            <th className="p-4 w-[20%]">Role</th>
                            <th className="p-4 w-[20%] text-right">Contribution Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5c16c]/15">
                          {rankPagedMembers.map((m, i) => (
                            <tr key={m.memberId} className="hover:bg-black/40 transition">
                              <td className="p-4 font-bold text-foreground/60">#{rankOf(m, (safeRankPage - 1) * rankPageSize + i)}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-3 text-white">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-black shrink-0">
                                    <Avatar className="w-full h-full">
                                      <AvatarImage className="object-cover" src={m.profileImageUrl ?? undefined} alt={displayName(m) ?? ''} />
                                      <AvatarFallback>{(displayName(m) ?? '').slice(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <span className="truncate">{displayName(m) ?? m.authUserId}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded border border-[#f5c16c]/25 text-white/80 text-[10px] uppercase">{m.role}</span>
                              </td>
                              <td className="p-4 text-right text-white/80">{(m.contributionPoints ?? 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {myEntry && (
                        <div className="sticky bottom-0 bg-black/40 border-t border-[#f5c16c]/20">
                          <div className="grid grid-cols-[80px_1fr_140px_140px] items-center text-sm">
                            <div className="p-3 font-bold text-white/80">#{rankOf(myEntry, sortedMembers.indexOf(myEntry))}</div>
                            <div className="p-3 flex items-center gap-3 text-white">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-black">
                                <Avatar className="w-full h-full">
                                  <AvatarImage src={myEntry.profileImageUrl ?? undefined} alt={displayName(myEntry) ?? ''} />
                                  <AvatarFallback>{(displayName(myEntry) ?? '').slice(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                              </div>
                              <span>{displayName(myEntry) ?? myEntry.authUserId}</span>
                            </div>
                            <div className="p-3 text-right">
                              <span className="px-2 py-0.5 rounded border border-[#f5c16c]/25 text-white/80 text-[10px] uppercase">{myEntry.role}</span>
                            </div>
                            <div className="p-3 text-right font-bold text-[#d4a353]">{(myEntry.contributionPoints ?? 0).toLocaleString()}</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <div className="px-4 pb-4 flex items-center justify-between">
                      <div className="text-xs text-white/70">
                        <span>Showing {(safeRankPage - 1) * rankPageSize + 1}–{Math.min(sortedMembers.length, safeRankPage * rankPageSize)} of {sortedMembers.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setRankPage(p => Math.max(1, p - 1))} disabled={safeRankPage === 1} className={`rounded border border-[#f5c16c]/30 px-3 py-1.5 text-xs ${safeRankPage===1?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Prev</button>
                        <span className="text-xs text-white/70">Page {safeRankPage} of {rankPageCount}</span>
                        <button onClick={() => setRankPage(p => Math.min(rankPageCount, p + 1))} disabled={safeRankPage === rankPageCount} className={`rounded border border-[#f5c16c]/30 px-3 py-1.5 text-xs ${safeRankPage===rankPageCount?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Next</button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {canSeeMeetings && (
                  <TabsContent value="meetings" className="space-y-4">
                    <GuildMeetingsSection guildId={guild.id} />
                  </TabsContent>
                )}

                {isMember && (
                  <TabsContent value="manage" className="space-y-4">
                    <GuildManagementSection guildId={guild.id} />
                  </TabsContent>
                )}
              </Tabs>
              {showInfoModal && (
                <GuildInfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} guildId={guild.id} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
import { GuildPostsSection } from "@/components/guild/posts/GuildPostsSection";
import { GuildManagementSection } from "@/components/guild/management/GuildManagementSection";
import GuildMeetingsSection from "@/components/guild/meetings/GuildMeetingsSection";
import GuildInfoModal from "@/components/guild/GuildInfoModal";
