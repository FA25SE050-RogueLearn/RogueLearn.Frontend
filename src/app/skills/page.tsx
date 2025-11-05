// roguelearn-web/src/app/skills/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createServerApiClients } from "@/lib/api-server";
import { UserSkillDto, GetUserSkillsResponse } from "@/types/user-skills";
import { 
    BrainCircuit, 
    Code, 
    Database, 
    Network, 
    ShieldCheck, 
    Sparkles, 
    Swords, 
    Workflow 
} from "lucide-react";
import Link from "next/link";

// Helper function to map skill domains to icons
const getSkillIcon = (skillName: string) => {
    const lowerName = skillName.toLowerCase();
    if (lowerName.includes('sql') || lowerName.includes('database')) return <Database className="h-6 w-6" />;
    if (lowerName.includes('api') || lowerName.includes('network')) return <Network className="h-6 w-6" />;
    if (lowerName.includes('security') || lowerName.includes('auth')) return <ShieldCheck className="h-6 w-6" />;
    if (lowerName.includes('agile') || lowerName.includes('scrum')) return <Workflow className="h-6 w-6" />;
    if (lowerName.includes('pattern') || lowerName.includes('architect')) return <BrainCircuit className="h-6 w-6" />;
    if (lowerName.includes('algorithm') || lowerName.includes('data structure')) return <Swords className="h-6 w-6" />;
    return <Code className="h-6 w-6" />;
};

// Helper function to calculate XP progress for the current level
const calculateLevelProgress = (xp: number) => {
    const xpPerLevel = 1000;
    const currentLevelXp = xp % xpPerLevel;
    const progressPercentage = (currentLevelXp / xpPerLevel) * 100;
    const nextLevelXp = xpPerLevel;
    return { currentLevelXp, nextLevelXp, progressPercentage };
}

export default async function SkillsPage() {
    const { coreApiClient } = await createServerApiClients();
    let userSkills: UserSkillDto[] = [];
    
    try {
        const response = await coreApiClient.get<GetUserSkillsResponse>('/api/users/me/skills');
        userSkills = response.data.skills;
    } catch (error) {
        console.error("Failed to fetch user skills:", error);
        // Page will render with empty state
    }

    const totalSkills = userSkills.length;
    const totalXp = userSkills.reduce((sum, skill) => sum + skill.experiencePoints, 0);
    const highestLevel = userSkills.length > 0 ? Math.max(...userSkills.map(s => s.level)) : 0;

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
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            {[
                                { label: "Skills Unlocked", value: totalSkills, icon: Sparkles },
                                { label: "Highest Mastery", value: `Level ${highestLevel}`, icon: Network },
                                { label: "Total Essence", value: `${totalXp.toLocaleString()} XP`, icon: BrainCircuit },
                            ].map((stat) => (
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
                    </div>
                </section>

                {/* Skill Grid Section */}
                <section>
                    {userSkills.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {userSkills.map((skill) => {
                                const { currentLevelXp, nextLevelXp, progressPercentage } = calculateLevelProgress(skill.experiencePoints);
                                return (
                                <Card key={skill.skillName} className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/12 bg-gradient-to-br from-[#2a140f]/90 via-[#160b08]/92 to-[#0a0503]/95 p-6 shadow-[0_24px_60px_rgba(32,8,12,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(210,49,135,0.35)]">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(240,177,90,0.25),_transparent_72%)] opacity-45" />
                                    <CardContent className="relative z-10 flex flex-1 flex-col justify-between gap-6 p-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-2">
                                                <h3 className="text-xl font-semibold font-heading text-white">{skill.skillName}</h3>
                                                <p className="text-sm font-body text-foreground/60">Level {skill.level}</p>
                                            </div>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                                                {getSkillIcon(skill.skillName)}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-body text-foreground/50">
                                                <span>Progress</span>
                                                <span>{currentLevelXp} / {nextLevelXp} XP</span>
                                            </div>
                                            <Progress value={progressPercentage} className="h-2 bg-white/10" />
                                        </div>
                                    </CardContent>
                                </Card>
                            )})}
                        </div>
                    ) : (
                         <Card className="relative overflow-hidden rounded-[30px] border border-dashed border-white/20 bg-black/30 py-24">
                            <CardContent className="relative z-10 flex flex-col items-center justify-center text-center text-foreground/60">
                                <Sparkles className="h-12 w-12 text-accent/50" />
                                <h2 className="mt-6 text-2xl font-semibold font-heading text-white">Your Astral Chart is Unwritten</h2>
                                <p className="mt-2 max-w-lg text-sm font-body leading-relaxed">
                                    As you complete quests and challenges, your skills will appear here, forming a unique constellation of your mastery. Begin your journey to illuminate the chart.
                                </p>
                                <Button asChild className="mt-8 h-12 rounded-full bg-accent px-8 text-xs uppercase tracking-[0.4em] text-accent-foreground hover:bg-accent/90">
                                    <Link href="/quests">Find a Quest</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}