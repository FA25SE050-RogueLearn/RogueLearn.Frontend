"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildDto, GuildRole } from "@/types/guilds";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Users, Shield, Lock, Globe, Scroll, Swords, Crown, Settings } from "lucide-react";

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
  const [myGuildId, setMyGuildId] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<GuildRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!guildId) return;
    setLoading(true);
    Promise.all([
      guildsApi.getById(guildId as string),
      guildsApi.getMyGuild(),
      guildsApi.getMembers(guildId as string),
      profileApi.getMyProfile(),
    ])
      .then(([gRes, myRes, membersRes, pRes]) => {
        if (cancelled) return;
        setGuild(gRes.data ?? null);
        setMyGuildId(myRes.data?.id ?? null);
        const authId = pRes.data?.authUserId ?? null;
        setMyAuthUserId(authId);
        // Prefer a directly computed member count from the members endpoint.
        // Fallback to my guild count (if this is the user's guild), then to the guild dto field.
        const directCount = Array.isArray(membersRes.data)
          ? membersRes.data.length
          : null;
        const isMyGuild = (myRes.data?.id ?? null) === (gRes.data?.id ?? null);
        const fallbackMyCount = isMyGuild
          ? myRes.data?.memberCount ?? null
          : null;
        setMemberCount(
          directCount ?? fallbackMyCount ?? gRes.data?.memberCount ?? null
        );
        // Derive my role if I am a member
        if (authId && Array.isArray(membersRes.data)) {
          const me = (membersRes.data as any[]).find(
            (m) => m.authUserId === authId
          );
          setMyRole((me?.role as GuildRole) ?? null);
        } else {
          setMyRole(null);
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

  // Sync tabs with hash (#home, #posts, #meetings, #manage)
  useEffect(() => {
    const applyHash = () => {
      const hash =
        typeof window !== "undefined"
          ? window.location.hash.replace(/^#/, "")
          : "";
      const canManage = myRole === "GuildMaster"; // Only GuildMaster can manage
      if (hash === "home" || hash === "posts" || hash === "meetings") {
        setActiveTab(hash);
      } else if (hash === "manage") {
        setActiveTab(canManage ? "manage" : "home");
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [myRole]);

  const isMember = guild && myGuildId === guild.id;
  const canManage = isMember && myRole === "GuildMaster";

  const handleApply = async () => {
    if (!guildId) return;
    setSubmitting(true);
    try {
      await guildsApi.applyToJoin(guildId as string, {
        message: joinMessage || null,
      });
      alert("Join request submitted.");
      setJoinMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit join request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_GRADIENT} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_TEXTURE} />
      
      <DashboardFrame className="relative z-20">
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
                          Invite Only
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#f5c16c]">
                        <Users className="h-3.5 w-3.5" />
                        {memberCount ?? guild.memberCount} Heroes
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 pt-6">
                  <div className="flex flex-wrap items-center gap-3">
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
                  {isMember && (
                    <TabsTrigger
                      value="meetings"
                      className="rounded-full data-[state=active]:bg-linear-to-r data-[state=active]:from-[#d23187] data-[state=active]:via-[#f5c16c] data-[state=active]:to-[#f5c16c] data-[state=active]:text-[#2b130f] data-[state=active]:shadow-lg"
                    >
                      <Swords className="mr-2 h-4 w-4" />
                      Meetings
                    </TabsTrigger>
                  )}
                  {canManage && (
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

                {isMember && (
                  <TabsContent value="meetings" className="space-y-4">
                    <GuildMeetingsSection guildId={guild.id} />
                  </TabsContent>
                )}

                {canManage && (
                  <TabsContent value="manage" className="space-y-4">
                    <GuildManagementSection guildId={guild.id} />
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </div>
      </DashboardFrame>
    </div>
  );
}
import { GuildPostsSection } from "@/components/guild/posts/GuildPostsSection";
import { GuildManagementSection } from "@/components/guild/management/GuildManagementSection";
import GuildMeetingsSection from "@/components/guild/meetings/GuildMeetingsSection";
