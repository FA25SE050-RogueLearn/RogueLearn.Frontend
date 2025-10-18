import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSkillTree } from "@/lib/mockData";
import { Compass, Map, Orbit, Sparkles } from "lucide-react";

export default function SkillsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 pb-24">
        <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-[#351c13]/85 via-[#22100d]/90 to-[#100608]/96 p-8 shadow-[0_30px_80px_rgba(32,8,12,0.65)]">
          <div className="absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.45),_transparent_68%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(240,177,90,0.22),_transparent_70%)]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Guild Archives</p>
              <h1 className="text-4xl font-semibold text-white">{mockSkillTree.title}</h1>
              <p className="max-w-xl text-sm leading-relaxed text-foreground/70">
                Trace the constellations of mastery and unlock arcane disciplines. Each star marks a new
                technique, each path a freshly forged link between knowledge and instinct.
              </p>
            </div>
            <Button className="h-12 rounded-full bg-accent px-8 text-xs uppercase tracking-[0.4em] text-accent-foreground shadow-[0_18px_40px_rgba(210,49,135,0.35)] hover:bg-accent/90">
              Open Astral Map
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{
              label: "Active Nodes",
              value: mockSkillTree.nodes.length,
              icon: Orbit,
            }, {
              label: "Unlocked Paths",
              value: mockSkillTree.edges.length,
              icon: Map,
            }, {
              label: "Mastered Schools",
              value: 3,
              icon: Sparkles,
            }, {
              label: "Next Unlock",
              value: "Transmutation Sigils",
              icon: Compass,
            }].map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_70%)]" />
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

        <section className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Card className="relative overflow-hidden rounded-[30px] border border-white/12 bg-gradient-to-br from-[#2d1414]/88 via-[#180b0c]/94 to-[#090406]/97 shadow-[0_24px_70px_rgba(28,6,10,0.6)]">
            <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_center,_rgba(240,177,90,0.32),_transparent_72%)]" />
            <CardContent className="relative z-10 flex h-full flex-col items-center justify-center p-10 text-center text-foreground/60">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.45em] text-foreground/50">
                Astral Projection
              </div>
              <h2 className="mt-6 text-3xl font-semibold text-white">Skill Tree Visualization</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed">
                A living star map of your disciplines will ignite here. Each node pulses with your mastery;
                rotate the chart, inspect constellations, and weave new runes as you progress.
              </p>
              <p className="mt-8 text-xs uppercase tracking-[0.35em] text-foreground/40">
                Coming online with the next guild update
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {mockSkillTree.nodes.map((node) => (
              <Card
                key={node.id}
                className="relative overflow-hidden rounded-[24px] border border-white/12 bg-white/5 p-6 text-left shadow-[0_18px_45px_rgba(32,10,12,0.45)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(240,177,90,0.28),_transparent_78%)] opacity-50" />
                <CardContent className="relative z-10 space-y-2 p-0">
                  <p className="text-xs uppercase tracking-[0.35em] text-foreground/50">Node #{node.id}</p>
                  <h3 className="text-xl font-semibold text-white">{node.label}</h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Coordinates [{node.x}, {node.y}] // Resonance stability nominal. Unlock linked runes to
                    channel advanced techniques.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}