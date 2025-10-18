import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockCommunity } from "@/lib/mockData";
import { Crown, Globe2, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

export default function CommunityPage() {
  const totalMembers = mockCommunity.guilds.reduce((sum, guild) => sum + guild.members, 0);
  const verifiedGuilds = mockCommunity.guilds.filter((guild) => guild.isVerified).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 pb-24">
        <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-[#341a10]/88 via-[#200d11]/92 to-[#0d0609]/96 p-8 shadow-[0_28px_80px_rgba(28,8,12,0.65)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.38),_transparent_68%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(240,177,90,0.24),_transparent_72%)]" />
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/low-contrast-linen.png')]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">Guild Nexus</p>
              <h1 className="text-4xl font-semibold text-white">Halls of Knowledge</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">
                Browse guild sanctums, pledge allegiance to a circle, or found your own. Allies gather here to
                share tactics, rituals, and the spoils of their latest delves.
              </p>
            </div>
            <Button className="h-12 rounded-full bg-gradient-to-r from-accent via-amber-300 to-orange-400 px-8 text-xs uppercase tracking-[0.4em] text-[#230d12] shadow-[0_20px_50px_rgba(210,49,135,0.4)] hover:from-accent/90 hover:via-amber-200/90 hover:to-orange-300/90">
              Found Guild
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[{
              label: "Registered Guilds",
              value: mockCommunity.guilds.length,
              icon: Globe2,
            }, {
              label: "Verified Circles",
              value: verifiedGuilds,
              icon: ShieldCheck,
            }, {
              label: "Guildmates Aligned",
              value: totalMembers,
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

        <section className="space-y-6">
          {mockCommunity.guilds.map((guild) => (
            <Card
              key={guild.id}
              className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-[#381c12]/86 via-[#200e11]/93 to-[#0d0508]/97 shadow-[0_24px_70px_rgba(30,8,12,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_28px_75px_rgba(210,49,135,0.32)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.32),_transparent_72%)] opacity-[0.4]" />
              <CardContent className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold text-white">{guild.name}</h3>
                    {guild.isVerified && (
                      <span className="flex items-center gap-1 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] uppercase tracking-[0.4em] text-accent">
                        <ShieldCheck className="h-4 w-4" />
                        Verified
                      </span>
                    )}
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.4em] text-foreground/50">
                      {guild.createdAt}
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">{guild.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.35em] text-foreground/50">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      {guild.members} members
                    </span>
                    <span className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-300" />
                      {guild.activeEvents} rituals active
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 min-w-[160px] rounded-full border-accent/50 bg-accent/15 text-xs uppercase tracking-[0.4em] text-accent hover:bg-accent/25"
                >
                  <Link href={`/community/guilds/${guild.id}`}>Enter Sanctum</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}