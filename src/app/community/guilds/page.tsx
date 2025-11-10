"use client";
import { useEffect, useMemo, useState, startTransition } from "react";
import Link from "next/link";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Globe2, ShieldCheck, Users } from "lucide-react";
import guildsApi from "@/api/guildsApi";
import type { GuildDto } from "@/types/guilds";

export default function GuildDirectoryPage() {
  const [guilds, setGuilds] = useState<GuildDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [myGuild, setMyGuild] = useState<GuildDto | null>(null);
  const [loadingMyGuild, setLoadingMyGuild] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => {
      setLoading(true);
    });
    guildsApi
      .listAllPublic({ search, page: 1, pageSize: 20 })
      .then((res) => {
        if (cancelled) return;
        setGuilds(res.data ?? []);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch guilds", err);
        if (cancelled) return;
        setError("Failed to load guilds. Please try again.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search]);

  // Fetch the current user's guild once
  useEffect(() => {
    let cancelled = false;
    startTransition(() => {
      setLoadingMyGuild(true);
    });
    guildsApi
      .getMyGuild()
      .then((res) => {
        if (cancelled) return;
        setMyGuild(res.data ?? null);
      })
      .catch((err) => {
        console.error("Failed to fetch my guild", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingMyGuild(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const totalMembers = guilds.reduce((sum, g) => sum + (g.memberCount ?? 0), 0);
    return {
      totalGuilds: guilds.length,
      totalMembers,
      verifiedGuilds: 0, // placeholder if verification exists
    };
  }, [guilds]);

  return (
    <div className="relative max-h-screen w-full overflow-hidden bg-[#08040a] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b0510]/95 via-[#1b0b19]/90 to-[#070b1c]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.35),_transparent_60%)]" />
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.15]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')" }} />
      </div>
      <DashboardFrame>
      <div className="flex flex-col gap-8 pb-24">
        {/* My Guild Card */}
        <section>
          {loadingMyGuild ? (
            <Card className="rounded-2xl border-white/12 bg-white/5">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ) : myGuild ? (
            <Card className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-[#1e0a12]/80 via-[#120610]/90 to-[#0a050c]/95 shadow-[0_24px_70px_rgba(30,8,12,0.55)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.25),_transparent_65%)]" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-white">
                  <span>My Guild: {myGuild.name}</span>
                  {myGuild.isPublic && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.4em] text-foreground/50">Public</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm text-foreground/70">{myGuild.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.35em] text-foreground/50 flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    {myGuild.memberCount} members
                  </span>
                  <Button asChild className="rounded-full bg-accent/20 border-accent/50 text-xs uppercase tracking-[0.4em] text-accent">
                    <Link href={`/community/guilds/${myGuild.id}`}>Go to Guild</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-white/12 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">You are not in a guild yet</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-foreground/70">Join a guild to collaborate and participate in community activities.</div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="rounded-full border-accent/50 text-xs uppercase tracking-[0.4em] text-accent">
                    <Link href="/community/guilds">Browse Guilds</Link>
                  </Button>
                  <Button asChild className="rounded-full bg-accent/20 border-accent/50 text-xs uppercase tracking-[0.4em] text-accent">
                    <Link href="/community/guilds/create">Create Guild</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
        <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-[#341a10]/88 via-[#200d11]/92 to-[#0d0609]/96 p-8 shadow-[0_28px_80px_rgba(28,8,12,0.65)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.38),_transparent_68%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(240,177,90,0.24),_transparent_72%)]" />
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/low-contrast-linen.png')]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">Guilds</p>
              <h1 className="text-4xl font-semibold text-white">Explore Communities</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">
                Browse and search guilds that match your goals. Create your own or request to join existing ones.
              </p>
            </div>
            <Button asChild className="h-12 rounded-full bg-gradient-to-r from-accent via-amber-300 to-orange-400 px-8 text-xs uppercase tracking-[0.4em] text-[#230d12] shadow-[0_20px_50px_rgba(210,49,135,0.4)]">
              <Link href="/community/guilds/create">Create Guild</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[{
              label: "Registered Guilds",
              value: stats.totalGuilds,
              icon: Globe2,
            }, {
              label: "Verified Circles",
              value: stats.verifiedGuilds,
              icon: ShieldCheck,
            }, {
              label: "Guildmates Aligned",
              value: stats.totalMembers,
              icon: Users,
            }].map((stat) => (
              <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(240,177,90,0.22),_transparent_75%)]" />
                <div className="relative z-10 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/40 text-accent">
                    <stat.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.4em] text-foreground/50">{stat.label}</p>
                    <p className="text-lg font-semibold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search guilds by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline" onClick={() => setSearch("")}>Clear</Button>
          </div>
          <Separator />
          {loading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="rounded-2xl border-white/12 bg-white/5">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}
          {!loading && !error && guilds.length === 0 && (
            <div className="text-sm text-foreground/60">No guilds found.</div>
          )}
          {!loading && !error && guilds.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guilds.map((guild) => (
                <Card key={guild.id} className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-[#381c12]/86 via-[#200e11]/93 to-[#0d0508]/97 shadow-[0_24px_70px_rgba(30,8,12,0.55)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <span>{guild.name}</span>
                      {guild.isPublic && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.4em] text-foreground/50">Public</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground/70">{guild.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.35em] text-foreground/50 flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent" />
                        {guild.memberCount} members
                      </span>
                      <Button asChild variant="outline" className="rounded-full border-accent/50 text-xs uppercase tracking-[0.4em] text-accent">
                        <Link href={`/community/guilds/${guild.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
      </DashboardFrame>
    </div>
  );
}