// roguelearn-web/src/components/skills/SkillDetailCard.tsx
"use client";

import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    Lock,
    Sparkles,
    Target,
    BookOpen,
    Swords,
    Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkillDetailDto } from "@/types/skill-details";
import { Card, CardContent } from "@/components/ui/card";

interface SkillDetailCardProps {
    skill: SkillDetailDto;
}

export function SkillDetailCard({ skill }: SkillDetailCardProps) {

    // Helper to determine tier color
    const getTierColor = (tier: string) => {
        const t = tier.toLowerCase();
        if (t.includes("foundation") || t.includes("beginner")) return "text-emerald-400";
        if (t.includes("intermediate")) return "text-blue-400";
        if (t.includes("advanced") || t.includes("expert")) return "text-[#f5c16c]"; // Gold
        return "text-white";
    };

    const tierColor = getTierColor(skill.tier);

    return (
        <Card className="relative overflow-hidden rounded-[32px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] shadow-2xl">
            {/* Background Texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                style={{
                    backgroundImage: 'url(/images/asfalt-dark.png)',
                    backgroundSize: '350px 350px',
                    backgroundRepeat: 'repeat'
                }}
            />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_rgba(245,193,108,0.15),_transparent_60%)]" />

            <CardContent className="relative z-10 p-8 flex flex-col gap-8">

                {/* --- HEADER SECTION --- */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/50">
                            <span className="text-[#f5c16c]">RogueLearn</span>
                            <span>&gt;</span>
                            <span>Skill Tree</span>
                            <span>&gt;</span>
                            <span className="text-white/80">{skill.name}</span>
                        </div>
                        <Link href="/skills">
                            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white hover:bg-white/10">
                                Close [X]
                            </Button>
                        </Link>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${tierColor.replace("text-", "bg-")} shadow-[0_0_10px_currentColor]`} />
                            <h1 className="text-sm uppercase tracking-[0.2em] font-bold text-white/90">
                                {skill.tier} Tier • Level {skill.currentLevel} • {skill.domain}
                            </h1>
                        </div>
                    </div>

                    {/* --- PROGRESS SECTION --- */}
                    <div className="space-y-2 bg-black/40 rounded-xl p-5 border border-[#f5c16c]/10">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded bg-gradient-to-br from-[#f5c16c] to-[#d23187] flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-black" />
                                </div>
                                <span className="font-semibold text-white">
                                    PROGRESS: {skill.progressPercentage}% Complete ({skill.xpProgressInLevel} / {skill.xpForNextLevel} XP)
                                </span>
                            </div>
                        </div>
                        <Progress value={skill.progressPercentage} className="h-3 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-[#f5c16c] [&>div]:to-[#d4a855]" />
                    </div>
                </div>

                {/* --- DESCRIPTION --- */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#f5c16c] text-sm font-bold uppercase tracking-wider">
                        <BookOpen className="h-4 w-4" /> Description
                    </div>
                    <p className="text-white/70 leading-relaxed">
                        {skill.description}
                    </p>
                </div>

                {/* --- PREREQUISITES --- */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#f5c16c] text-sm font-bold uppercase tracking-wider">
                        <div className="rotate-45"><LinkIcon className="h-4 w-4" /></div>
                        Prerequisites ({skill.prerequisites.filter(p => p.isMet).length}/{skill.prerequisites.length} Complete):
                    </div>
                    <div className="grid gap-2 pl-2">
                        {skill.prerequisites.length === 0 ? (
                            <p className="text-white/40 italic text-sm">None - This is a foundation skill.</p>
                        ) : (
                            skill.prerequisites.map((pre) => (
                                <div key={pre.skillId} className="flex items-center gap-3 text-sm">
                                    {pre.isMet ? (
                                        <div className="bg-emerald-500/20 p-0.5 rounded">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        </div>
                                    ) : (
                                        <div className="bg-white/10 p-0.5 rounded">
                                            <Circle className="h-5 w-5 text-white/30" />
                                        </div>
                                    )}
                                    <span className={pre.isMet ? "text-white/90" : "text-white/50"}>
                                        {pre.name} - {pre.statusLabel}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- UNLOCKS --- */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#f5c16c] text-sm font-bold uppercase tracking-wider">
                        <Target className="h-4 w-4" /> Unlocks ({skill.unlocks.length} skills available after completion):
                    </div>
                    <div className="grid gap-2 pl-2">
                        {skill.unlocks.length === 0 ? (
                            <p className="text-white/40 italic text-sm">No specific unlocks discovered yet.</p>
                        ) : (
                            skill.unlocks.map((ul) => (
                                <div key={ul.skillId} className="flex items-center gap-3 text-sm">
                                    {ul.isMet ? (
                                        <div className="bg-blue-500/20 p-0.5 rounded">
                                            <Sparkles className="h-5 w-5 text-blue-400" />
                                        </div>
                                    ) : (
                                        <div className="bg-amber-900/20 p-0.5 rounded">
                                            <Lock className="h-5 w-5 text-amber-500/70" />
                                        </div>
                                    )}
                                    <span className={ul.isMet ? "text-white/90" : "text-white/50"}>
                                        {ul.name} - {ul.statusLabel}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- LEARNING PATH --- */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#f5c16c] text-sm font-bold uppercase tracking-wider">
                        <Map className="h-4 w-4" /> Learning Path:
                    </div>
                    <div className="grid gap-2 pl-2">
                        {skill.learningPath.length === 0 ? (
                            <p className="text-white/40 italic text-sm">No active quests targeted for this skill.</p>
                        ) : (
                            skill.learningPath.map((quest, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#f5c16c]" />
                                    <div>
                                        <span className="text-white/80 font-medium">{quest.type}:</span>
                                        <span className="text-white/60 ml-1">“{quest.title}”</span>
                                        {quest.xpReward > 0 && (
                                            <span className="text-[#f5c16c] text-xs ml-2">({quest.xpReward} XP)</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- ACTIONS --- */}
                <div className="pt-6 mt-4 border-t border-[#f5c16c]/10 flex flex-wrap gap-4 justify-center sm:justify-start">
                    <Button className="bg-white text-black hover:bg-white/90 rounded-xl px-8 h-12 font-semibold border-2 border-white">
                        Study Now
                    </Button>
                    <Button className="bg-transparent text-[#f5c16c] border-2 border-[#f5c16c] hover:bg-[#f5c16c]/10 rounded-xl px-8 h-12 font-semibold">
                        Take Quest
                    </Button>
                    <Button className="bg-transparent text-white border-2 border-white/20 hover:border-white/50 hover:bg-white/5 rounded-xl px-8 h-12 font-semibold">
                        Find Party
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}

// Helper component for the rotated link icon
const LinkIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);