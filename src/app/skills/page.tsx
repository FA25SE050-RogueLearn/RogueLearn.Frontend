// roguelearn-web/src/app/skills/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConstellationMap } from "@/components/skills/ConstellationMap"; // MODIFIED: Import the new component
import { BrainCircuit, Sparkles, Network } from "lucide-react";

export default async function SkillsPage() {
    // Note: The stats here are now calculated inside the client component.
    // This server component becomes a simple structural container.

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-10 pb-24">
                {/* Thematic Header Section */}
                <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-[#351c13]/85 via-[#22100d]/90 to-[#100608]/96 p-8 shadow-[0_30px_80px_rgba(32,8,12,0.65)]">
                    <div className="absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.45),_transparent_68%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(240,177,90,0.22),_transparent_70%)]" />
                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="space-y-3">
                            <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Character Progression</p>
                            <h1 className="text-4xl font-semibold font-heading text-white">Astral Chart</h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-foreground/70 font-body">
                                Your journey is etched in this constellation of skills. Each point of light represents mastery gained, each connection a path forged through knowledge and practice.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Skill Tree Rendering Section - Replaced with the new scalable component */}
                <section>
                   <ConstellationMap />
                </section>
            </div>
        </DashboardLayout>
    );
}