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
                <section className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-8 shadow-2xl">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-25"
                        style={{
                            backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                            backgroundSize: "100px",
                            backgroundBlendMode: "overlay",
                        }}
                    />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="rounded-full bg-[#f5c16c]/10 p-4">
                            <Sparkles className="h-8 w-8 text-[#f5c16c]" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]/60">Character Progression</p>
                            <h1 className="text-4xl font-semibold text-[#f5c16c]">Astral Chart</h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-white/70">
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