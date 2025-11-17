"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildDto } from "@/types/guilds";
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
import { Users } from "lucide-react";
import GuildRoleGate from "@/components/guild/RoleGate";
import { useGuildRoles } from "@/hooks/useGuildRoles";

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
  const { roles: myRoles } = useGuildRoles(guildId as string);

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
      const canManage = myRoles.includes("GuildMaster") || myRoles.includes("Officer");
      if (hash === "home" || hash === "posts" || hash === "meetings") {
        setActiveTab(hash);
      } else if (hash === "manage") {
        setActiveTab(canManage ? "manage" : "home");
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [myRoles]);

  const isMember = guild && myGuildId === guild.id;
  const canManage = isMember && (myRoles.includes("GuildMaster") || myRoles.includes("Officer"));

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
    <div className="relative min-h-screen w-full overflow-auto bg-[#08040a] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#0b0510]/95 via-[#1b0b19]/90 to-[#070b1c]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.35),transparent_60%)]" />
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.15]"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/dark-matter.png')",
          }}
        />
      </div>
      <DashboardFrame className="relative z-20">
        <div className="flex flex-col gap-6 pb-16">
          {loading && (
            <Card className="rounded-2xl border-white/12 bg-white/5">
              <CardHeader>
                <Skeleton className="h-6 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          )}
          {error && <div className="text-sm text-red-400">{error}</div>}
          {!loading && guild && (
            <Card className="rounded-[28px] border-white/12 bg-linear-to-br from-[#381c12]/86 via-[#200e11]/93 to-[#0d0508]/97">
              <CardHeader>
                <CardTitle className="text-3xl text-white">
                  {guild.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/70">
                  {guild.description}
                </p>
                <div className="flex items-center gap-6 text-xs uppercase tracking-[0.35em] text-foreground/50">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    {memberCount ?? guild.memberCount} members
                  </span>
                  {guild.isPublic ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Public
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Invite Only
                    </span>
                  )}
                </div>
                {!isMember && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="rounded-full">Request to Join</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request to Join {guild.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <label className="text-sm">Motivation (optional)</label>
                        <Textarea
                          value={joinMessage}
                          onChange={(e) => setJoinMessage(e.target.value)}
                          placeholder="Tell the guild why you want to join..."
                        />
                        <Button onClick={handleApply} disabled={submitting}>
                          {submitting ? "Submitting..." : "Submit Request"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}

          {!loading && guild && (
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v);
                if (typeof window !== "undefined") window.location.hash = v;
              }}
              className="mt-2"
            >
              <TabsList>
                <TabsTrigger value="home">Home</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                {isMember && (
                  <TabsTrigger value="meetings">Meetings</TabsTrigger>
                )}
                {canManage && <TabsTrigger value="manage">Manage</TabsTrigger>}
              </TabsList>
              <TabsContent value="home" className="space-y-4">
                <div className="text-sm text-foreground/70">
                  Welcome to {guild.name}. Use the tabs to navigate.
                </div>
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
                  <GuildRoleGate guildId={guild.id} requireAny={["GuildMaster", "Officer"]}>
                    <GuildManagementSection guildId={guild.id} />
                  </GuildRoleGate>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </DashboardFrame>
    </div>
  );
}
import { GuildPostsSection } from "@/components/guild/posts/GuildPostsSection";
import { GuildManagementSection } from "@/components/guild/management/GuildManagementSection";
import GuildMeetingsSection from "@/components/guild/meetings/GuildMeetingsSection";
