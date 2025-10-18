import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockArsenal } from "@/lib/mockData";
import { Library, Plus, Star, Wand2 } from "lucide-react";

export default function ArsenalPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 pb-24">
        <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-[#321810]/88 via-[#200c12]/92 to-[#0d0509]/96 p-8 shadow-[0_28px_80px_rgba(26,6,10,0.65)]">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.38),_transparent_68%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(240,177,90,0.22),_transparent_70%)]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">Guild Archive Vault</p>
              <h1 className="text-4xl font-semibold text-white">The Arsenal</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">
                Scribed chronicles, arcane diagrams, and field notes from every expedition reside here. Catalog
                your discoveries, tag rare insights, and keep the guild&apos;s lore within arm&apos;s reach.
              </p>
            </div>
            <Button className="h-12 rounded-full bg-gradient-to-r from-accent via-amber-400 to-orange-500 px-8 text-xs uppercase tracking-[0.4em] text-[#200b1a] shadow-[0_20px_50px_rgba(210,49,135,0.4)] hover:from-accent/90 hover:via-amber-300/90 hover:to-orange-400/90">
              <Plus className="mr-2 h-4 w-4" /> Add Relic
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[{
              label: "Curated Tomes",
              value: mockArsenal.length,
              icon: Library,
            }, {
              label: "Legendary Entries",
              value: "4",
              icon: Star,
            }, {
              label: "Scribing Focus",
              value: "Runic Algorithms",
              icon: Wand2,
            }].map((stat) => (
              <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-5">
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

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mockArsenal.map((note) => (
            <Card
              key={note.id}
              className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/12 bg-gradient-to-br from-[#361c15]/86 via-[#1f0d12]/92 to-[#0c0508]/97 shadow-[0_24px_60px_rgba(32,8,12,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(210,49,135,0.35)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(240,177,90,0.25),_transparent_72%)] opacity-45" />
              <CardHeader className="relative z-10 border-b border-white/10 pb-4">
                <CardTitle className="text-xl font-semibold text-white">{note.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-1 flex-col justify-between gap-6 p-6">
                <p className="text-sm leading-relaxed text-foreground/70">{note.description}</p>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs uppercase tracking-[0.35em] text-foreground/50">
                  Lore stability nominal // Archivist clearance verified
                </div>
              </CardContent>
              <CardFooter className="relative z-10 flex flex-wrap gap-2 border-t border-white/10 p-4">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </CardFooter>
            </Card>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}