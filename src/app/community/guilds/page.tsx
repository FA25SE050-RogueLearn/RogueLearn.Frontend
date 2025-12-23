"use client";
import { useEffect, useMemo, useState, startTransition, type CSSProperties } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Users, Search, Plus, Crown, Swords, HelpCircle, Scroll } from "lucide-react";
import guildsApi from "@/api/guildsApi";
import GuildInfoModal from "@/components/guild/GuildInfoModal";
import type { GuildDto, GuildFullDto } from "@/types/guilds";
import { toast } from "sonner";

const HERO_CARD_CLASS = 'relative overflow-hidden rounded-[32px] border border-[#f5c16c]/25 bg-linear-to-br from-[#1c0906]/95 via-[#120605]/98 to-[#040101]';
const GUILD_CARD_CLASS = 'relative overflow-hidden rounded-[28px] border border-[#f5c16c]/25 bg-linear-to-br from-[#1a0e0d]/92 via-[#130807]/97 to-[#080303] transition-all duration-300 hover:-translate-y-1 hover:border-[#d23187]/50 hover:shadow-[0_15px_40px_rgba(210,49,135,0.25)]';
const STAT_CARD_CLASS = 'relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-[#120806]/70';
const TEXTURE_OVERLAY: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  mixBlendMode: 'lighten',
  opacity: 0.35,
};
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

export default function GuildDirectoryPage() {
  const [guilds, setGuilds] = useState<GuildDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [myGuild, setMyGuild] = useState<GuildDto | null>(null);
  const [loadingMyGuild, setLoadingMyGuild] = useState<boolean>(true);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [fullGuilds, setFullGuilds] = useState<GuildFullDto[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(true);
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});
  const [showAllLadders, setShowAllLadders] = useState<boolean>(false);
  const [joiningGuildId, setJoiningGuildId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 6;

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

  // Load full guilds for global leaderboard
  useEffect(() => {
    let cancelled = false;
    startTransition(() => setLoadingLeaderboard(true));
    guildsApi
      .listAllFull()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        // Persist previous ranks to derive simple trend arrows
        const nextRanks: Record<string, number> = {};
        const sorted = [...list].sort((a, b) => (b.meritPoints ?? 0) - (a.meritPoints ?? 0));
        sorted.forEach((g, idx) => { nextRanks[g.id] = idx + 1; });
        setPrevRanks((prev) => Object.keys(prev).length ? prev : nextRanks);
        setFullGuilds(sorted);
      })
      .catch((err) => {
        console.error("Failed to fetch full guilds", err);
        if (cancelled) return;
        setFullGuilds([]);
      })
      .finally(() => { if (!cancelled) setLoadingLeaderboard(false); });
    return () => { cancelled = true; };
  }, []);

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

  const filteredGuilds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guilds;
    return guilds.filter((g) => {
      const name = (g.name ?? '').toLowerCase();
      const desc = (g.description ?? '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [guilds, search]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil((filteredGuilds.length || 0) / pageSize)), [filteredGuilds.length]);
  const safePage = useMemo(() => Math.min(Math.max(1, page), pageCount), [page, pageCount]);
  const pagedGuilds = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return filteredGuilds.slice(start, end);
  }, [filteredGuilds, safePage]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_GRADIENT} /> */}
      {/* <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_TEXTURE} /> */}
      
      <div className="relative z-10 flex flex-col gap-8 pb-24">
          
          {/* Hero Section */}
          <Card className={HERO_CARD_CLASS}>
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.18),transparent_55%)]" />
            <div aria-hidden="true" className="absolute inset-0" style={TEXTURE_OVERLAY} />
            <CardContent className="relative z-10 flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 text-white">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d23187]/50 bg-[#d23187]/10 px-5 py-1.5 text-xs uppercase tracking-[0.45em] text-[#f9d9eb]">
                  <Shield className="h-4 w-4" />
                  Guild Nexus
                </div>
                <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Forge Your Alliance</h1>
                <p className="mt-4 text-base text-foreground/75">
                  Unite with fellow adventurers, share knowledge, and conquer challenges together in your guild&apos;s quest for mastery.
                </p>
              </div>

              <div className="grid w-full max-w-xl gap-4 text-left text-white lg:max-w-sm">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Active Guilds', value: stats.totalGuilds, icon: Shield },
                    { label: 'Allied Heroes', value: stats.totalMembers, icon: Users },
                    { label: 'Elite Circles', value: stats.verifiedGuilds, icon: Crown },
                  ].map(({ label, value, icon: Icon }) => (
                    <Card key={label} className={`${STAT_CARD_CLASS} text-center`}>
                      <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                      <CardContent className="relative flex flex-col items-center gap-2 p-4">
                        <Icon className="h-5 w-5 text-[#f5c16c]" />
                        <span className="text-2xl font-bold">{value}</span>
                        <span className="text-xs uppercase tracking-wide text-foreground/60">{label}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>

            <div className="relative z-10 border-t border-[#f5c16c]/20 px-8 py-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f5c16c]/60" />
                    <Input
                      placeholder="Search guilds..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="pl-10 border-[#f5c16c]/25 bg-[#140707]/80 text-white placeholder:text-foreground/40"
                    />
                  </div>
                  {search && (
                    <Button
                      onClick={() => setSearch("")}
                      variant="outline"
                      size="sm"
                      className="border-[#f5c16c]/30 bg-[#140707]/80 text-[#f5c16c]"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* My Guild Section */}
          {loadingMyGuild ? (
            <Card className={GUILD_CARD_CLASS}>
              <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10">
                <Skeleton className="h-6 w-40 bg-white/10" />
              </CardHeader>
              <CardContent className="relative z-10 space-y-2">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-2/3 bg-white/10" />
              </CardContent>
            </Card>
          ) : myGuild ? (
            <Card className={GUILD_CARD_CLASS}>
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.15),transparent_65%)]" />
              <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10 border-b border-[#f5c16c]/20 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d23187]/20 border border-[#d23187]/40">
                      <Crown className="h-6 w-6 text-[#f5c16c]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]">Your Guild</p>
                      <CardTitle className="text-xl text-white">{myGuild.name}</CardTitle>
                    </div>
                  </div>
                <div className="flex items-center gap-2">
                  {myGuild.isPublic && (
                    <span className="rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-[#f5c16c]">
                      Public
                    </span>
                  )}
                  {myGuild.isLecturerGuild && (
                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-300 border-sky-400/40 bg-sky-400/15">
                      <Scroll className="h-3.5 w-3.5" /> Lecturer Guild
                    </span>
                  )}
                  <button
                    onClick={() => setShowInfoModal(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#f5c16c]"
                    title="Guild overview"
                  >
                      <HelpCircle className="h-3.5 w-3.5" />
                      Info
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4 pt-6">
                <p className="text-sm text-foreground/70">{myGuild.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-foreground/60">
                    <Users className="h-4 w-4 text-[#f5c16c]" />
                    <span>{myGuild.memberCount} Heroes</span>
                  </div>
                  <Button
                    asChild
                    className="rounded-full border-[#d23187]/40 bg-[#d23187]/20 text-[#f5c16c] hover:bg-[#d23187]/30"
                  >
                    <Link href={`/community/guilds/${myGuild.id}`}>Enter Guild Hall</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className={GUILD_CARD_CLASS}>
              <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Swords className="h-5 w-5 text-[#f5c16c]" />
                  Guildless Wanderer
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm text-foreground/70">
                  You journey alone. Join an existing guild or forge your own alliance to unlock collaborative quests and shared victories.
                </p>
                <div className="flex gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 rounded-full border-[#f5c16c]/30 bg-[#140707]/80 text-[#f5c16c]"
                  >
                    <Link href="#guilds">Browse Guilds</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guilds List + Hall of Legends */}
          <section id="guilds" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]">Available Guilds</p>
                <h2 className="text-2xl font-semibold text-white">Join the Alliance</h2>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Available Guilds (span 2) */}
              <div className="lg:col-span-2 space-y-6">
                {loading && (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className={`${GUILD_CARD_CLASS} h-56 animate-pulse`}>
                        <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <Card className={GUILD_CARD_CLASS}>
                    <CardContent className="py-16 text-center">
                      <p className="text-sm text-rose-400">{error}</p>
                    </CardContent>
                  </Card>
                )}

                {!loading && !error && filteredGuilds.length === 0 && (
                  <Card className={GUILD_CARD_CLASS}>
                    <CardContent className="py-16 text-center">
                      <Shield className="mx-auto mb-4 h-16 w-16 text-foreground/30" />
                      <h3 className="mb-2 text-xl font-semibold text-white">No Guilds Found</h3>
                      <p className="text-foreground/60">
                        {search ? 'Try adjusting your search terms.' : 'Be the first to create a guild!'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {!loading && !error && filteredGuilds.length > 0 && (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {pagedGuilds.map((guild) => (
                      <Card key={guild.id} className={GUILD_CARD_CLASS}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,193,108,0.1),transparent_65%)] opacity-0 transition-opacity group-hover:opacity-100" />
                        <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

                        <CardHeader className="relative z-10 border-b border-white/5 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base text-white">{guild.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              {guild.isPublic && (
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                                  Open
                                </span>
                              )}
                              {guild.isLecturerGuild && (
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300 border-sky-400/40 bg-sky-400/15">
                                  <Scroll className="h-3 w-3" /> Lecturer Guild
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-foreground/60 line-clamp-2">
                            {guild.description || 'A fellowship of dedicated adventurers.'}
                          </p>
                        </CardHeader>

                        <CardContent className="relative z-10 space-y-4 p-5">
                          <div className="flex items-center gap-2 text-[11px] text-foreground/60">
                            <Users className="h-3.5 w-3.5" />
                            <span>{guild.memberCount} Members</span>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              asChild
                              className="flex-1 rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#2b130f]"
                            >
                              <Link href={`/community/guilds/${guild.id}`}>
                                View Guild
                              </Link>
                            </Button>
                            {(!myGuild || myGuild.id !== guild.id) && (
                              guild.isPublic ? (
                                <Button
                                  onClick={async () => {
                                    setJoiningGuildId(guild.id);
                                    try {
                                      await guildsApi.applyToJoin(guild.id, { message: null });
                                      const res = await guildsApi.getMyGuild();
                                      setMyGuild(res.data ?? myGuild);
                                      if (res.data?.id === guild.id) {
                                        toast.success('Joined successfully.');
                                      } else {
                                        toast.info('Request to join submitted.');
                                      }
                                    } catch {
                                      // toast.error('Failed to apply to join.');
                                    } finally {
                                      setJoiningGuildId(null);
                                    }
                                  }}
                                  disabled={joiningGuildId === guild.id}
                                  className="flex-1 rounded-full border-[#f5c16c]/30 bg-[#f5c16c]/20 text-[#f5c16c] hover:bg-[#f5c16c]/30"
                                >
                                  {joiningGuildId === guild.id ? 'Joining…' : 'Join'}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={async () => {
                                    setJoiningGuildId(guild.id);
                                    try {
                                      await guildsApi.applyToJoin(guild.id, { message: null });
                                      toast.info('Request to join submitted.');
                                    } catch {
                                      // toast.error('Failed to submit request.');
                                    } finally {
                                      setJoiningGuildId(null);
                                    }
                                  }}
                                  disabled={joiningGuildId === guild.id}
                                  className="flex-1 rounded-full border-[#f5c16c]/30 bg-[#140707]/80 text-[#f5c16c]"
                                >
                                  {joiningGuildId === guild.id ? 'Submitting…' : 'Request to Join'}
                                </Button>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {!loading && !error && filteredGuilds.length > 0 && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-white/70">
                      <span>Showing {(safePage - 1) * pageSize + 1}–{Math.min(filteredGuilds.length, safePage * pageSize)} of {filteredGuilds.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className={`border-[#f5c16c]/30 ${safePage===1?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Prev</Button>
                      <span className="text-xs text-white/70">Page {safePage} of {pageCount}</span>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} className={`border-[#f5c16c]/30 ${safePage===pageCount?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Next</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Hall of Legends */}
              <aside className="w-full lg:col-span-1 flex flex-col gap-6">
                <Card className={GUILD_CARD_CLASS}>
                  <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                  <CardHeader className="relative z-10 border-b border-[#f5c16c]/20 pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                        <span className="text-[#d4a353]">🏆</span> Hall of Legends
                      </h3>
                      <span className="text-[10px] text-foreground/60">Global</span>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-4 pt-6">
                    {loadingLeaderboard && (
                      <div className="p-3 text-xs text-foreground/60">Loading leaderboard...</div>
                    )}

                    {!loadingLeaderboard && (
                      <>
                        {/* Podium: Top 3 Guilds */}
                        <div className="flex items-end justify-center gap-4">
                          {/* Silver (#2) */}
                          <div className="flex flex-col items-center">
                            {fullGuilds[1] && (
                              <div className="w-20 h-20 rounded-full border-4 border-gray-400 overflow-hidden mb-2 relative">
                                {fullGuilds[1].bannerImageUrl ? (
                                  <img src={fullGuilds[1].bannerImageUrl} alt={fullGuilds[1].name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-black" />
                                )}
                                <div className="absolute bottom-0 w-full bg-gray-400 text-black text-center text-xs font-bold">#2</div>
                              </div>
                            )}
                            <div className="text-white font-bold text-sm">{fullGuilds[1]?.name ?? '—'}</div>
                            <div className="text-foreground/60 text-[11px]">{(fullGuilds[1]?.meritPoints ?? 0).toLocaleString()} Points</div>
                            <div className="h-24 w-24 bg-linear-to-t from-gray-400/20 to-transparent rounded-t-lg mt-2"></div>
                          </div>

                          {/* Gold (#1) */}
                          <div className="flex flex-col items-center relative -top-6">
                            <div className="absolute -top-8 text-4xl">👑</div>
                            {fullGuilds[0] && (
                              <div className="w-24 h-24 rounded-full border-4 border-[#d4a353] overflow-hidden mb-2 relative">
                                {fullGuilds[0].bannerImageUrl ? (
                                  <img src={fullGuilds[0].bannerImageUrl} alt={fullGuilds[0].name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-black" />
                                )}
                                <div className="absolute bottom-0 w-full bg-[#d4a353] text-black text-center text-xs font-bold">#1</div>
                              </div>
                            )}
                            <div className="text-[#d4a353] font-bold text-base">{fullGuilds[0]?.name ?? '—'}</div>
                            <div className="text-[#d4a353]/80 text-sm">{(fullGuilds[0]?.meritPoints ?? 0).toLocaleString()} Points</div>
                            <div className="h-32 w-32 bg-linear-to-t from-[#d4a353]/20 to-transparent rounded-t-lg mt-2 border-t border-[#d4a353]/30"></div>
                          </div>

                          {/* Bronze (#3) */}
                          <div className="flex flex-col items-center">
                            {fullGuilds[2] && (
                              <div className="w-20 h-20 rounded-full border-4 border-orange-700 overflow-hidden mb-2 relative">
                                {fullGuilds[2].bannerImageUrl ? (
                                  <img src={fullGuilds[2].bannerImageUrl} alt={fullGuilds[2].name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-black" />
                                )}
                                <div className="absolute bottom-0 w-full bg-orange-700 text-white text-center text-xs font-bold">#3</div>
                              </div>
                            )}
                            <div className="text-white font-bold text-sm">{fullGuilds[2]?.name ?? '—'}</div>
                            <div className="text-foreground/60 text-[11px]">{(fullGuilds[2]?.meritPoints ?? 0).toLocaleString()} Points</div>
                            <div className="h-20 w-24 bg-linear-to-t from-orange-700/20 to-transparent rounded-t-lg mt-2"></div>
                          </div>
                        </div>

                        {/* Top 10 List */}
                        <div className="space-y-1">
                          {(showAllLadders ? fullGuilds : fullGuilds.slice(0, 10)).map((g, idx) => {
                            const rank = idx + 1;
                            const styleByRank = rank === 1
                              ? { row: 'bg-[#d4a353]/10 border border-[#d4a353]/50', num: 'text-[#d4a353]', badge: 'bg-[#d4a353] text-black' }
                              : rank === 2
                              ? { row: 'bg-gray-400/10 border border-gray-400/30', num: 'text-gray-300', badge: 'bg-gray-300 text-black' }
                              : rank === 3
                              ? { row: 'bg-orange-700/10 border border-orange-700/30', num: 'text-orange-400', badge: 'bg-orange-400 text-black' }
                              : { row: 'hover:bg-black/40', num: 'text-foreground/40', badge: '' };
                            const prev = prevRanks[g.id];
                            const trend = typeof prev === 'number' ? (prev > rank ? 'up' : prev < rank ? 'down' : 'flat') : 'flat';
                            return (
                              <div key={g.id} className={`flex items-center gap-3 ${rank<=3?'p-3':'p-2'} rounded-lg transition ${styleByRank.row}`}>
                                <div className={`${rank<=3?'text-xl font-black':'text-sm font-bold'} ${styleByRank.num} w-6 text-center`}>{rank}</div>
                                <div className={`${rank<=3?'w-10 h-10':'w-6 h-6'} rounded-lg bg-black overflow-hidden`}>
                                  {g.bannerImageUrl && (
                                    <img src={g.bannerImageUrl} alt={g.name} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className={`${rank<=3?'text-white font-bold text-sm':'text-white/80 font-semibold text-sm'}`}>{g.name}</div>
                                  <div className={`${rank===1?'text-[10px] text-[#d4a353] uppercase':'text-[10px] text-foreground/50'}`}>{g.meritPoints.toLocaleString()} Merit points</div>
                                </div>
                                {rank === 1 && (
                                  <div className={`${styleByRank.badge} text-[10px] font-bold px-2 py-1 rounded`}>DOMINATING</div>
                                )}
                                {trend !== 'flat' && (
                                  <div className={`${trend==='up'?'text-emerald-400':'text-rose-400'} text-xs`}>{trend==='up'?'▲':'▼'}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </CardContent>

                  <div className="relative z-10 p-3 border-t border-[#f5c16c]/20 text-center">
                    <button
                      onClick={() => setShowAllLadders(true)}
                      className="text-xs text-[#f5c16c] hover:text-white uppercase tracking-wider font-bold"
                    >
                      View Full Ladders
                    </button>
                    {showAllLadders && (
                      <div className="mt-2">
                        <button
                          onClick={() => setShowAllLadders(false)}
                          className="text-[10px] text-foreground/60 hover:text-white uppercase tracking-wider"
                        >
                          Collapse
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              </aside>
            </div>
          </section>
      </div>
      {showInfoModal && myGuild && (
        <GuildInfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} guildId={myGuild.id} />
      )}
    </div>
  );
}
