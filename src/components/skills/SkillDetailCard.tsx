// roguelearn-web/src/components/skills/SkillDetailCard.tsx
"use client";

import { SkillDetailDto } from "@/types/skill-details";
import { Crown, Zap, Circle, Lock, CheckCircle2, XCircle, Sparkles, BookOpen, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TIER_THEME = {
    Foundation: {
        gradient: "from-emerald-600/20 via-teal-700/20 to-emerald-800/20",
        border: "border-emerald-500/40",
        glow: "shadow-[0_0_30px_rgba(16,185,129,0.4)]",
        icon: Circle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
    },
    Intermediate: {
        gradient: "from-blue-600/20 via-cyan-700/20 to-blue-800/20",
        border: "border-blue-500/40",
        glow: "shadow-[0_0_30px_rgba(59,130,246,0.4)]",
        icon: Zap,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    Advanced: {
        gradient: "from-purple-600/20 via-pink-700/20 to-purple-800/20",
        border: "border-purple-500/40",
        glow: "shadow-[0_0_30px_rgba(168,85,247,0.4)]",
        icon: Crown,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
};

interface SkillDetailCardProps {
    skill: SkillDetailDto;
}

export function SkillDetailCard({ skill }: SkillDetailCardProps) {
    const theme = TIER_THEME[skill.tier as keyof typeof TIER_THEME] || TIER_THEME.Foundation;
    const TierIcon = theme.icon;
    const isMaxLevel = skill.currentLevel >= 5;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Link href="/skills">
                <Button variant="ghost" className="text-[#f5c16c] hover:text-[#f5c16c]/80 hover:bg-[#f5c16c]/10">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Skill Tree
                </Button>
            </Link>

            {/* Main skill header card */}
            <div
                className={cn(
                    "relative rounded-3xl border-2 p-8",
                    "bg-gradient-to-br from-[#1f0d09]/95 via-[#14080f]/90 to-[#08030a]/95",
                    "backdrop-blur-md",
                    theme.border,
                    theme.glow
                )}
            >
                {/* Tier badge */}
                <div className={cn("absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full border", theme.border, theme.bg)}>
                    <TierIcon className={cn("w-5 h-5", theme.color)} />
                    <span className={cn("text-sm font-bold uppercase tracking-wider", theme.color)}>{skill.tier}</span>
                </div>

                {/* Skill title and domain */}
                <div className="mb-6 pr-32">
                    <h1 className="text-4xl font-bold text-white mb-2">{skill.name}</h1>
                    {skill.domain && <p className="text-amber-700/70 uppercase tracking-wider text-sm">{skill.domain}</p>}
                </div>

                {/* Description */}
                {skill.description && <p className="text-white/70 text-lg mb-8 leading-relaxed">{skill.description}</p>}

                {/* Progress section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current level */}
                    <div className={cn("rounded-xl border p-4", theme.border, theme.bg)}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60 text-sm">Current Level</span>
                            {isMaxLevel && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={cn("text-4xl font-bold", theme.color)}>{skill.currentLevel}</span>
                            <span className="text-white/40 text-xl">/ 5</span>
                        </div>
                    </div>

                    {/* Current XP */}
                    <div className={cn("rounded-xl border p-4", theme.border, theme.bg)}>
                        <span className="text-white/60 text-sm block mb-2">Experience Points</span>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <span className="text-4xl font-bold text-amber-400">{skill.currentXp}</span>
                        </div>
                    </div>

                    {/* Progress to next level */}
                    {!isMaxLevel && (
                        <div className={cn("rounded-xl border p-4", theme.border, theme.bg)}>
                            <span className="text-white/60 text-sm block mb-2">Next Level Progress</span>
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{skill.progressPercentage.toFixed(0)}%</span>
                                    <span className="text-white/40 text-sm">
                                        ({skill.xpProgressInLevel} / {skill.xpForNextLevel} XP)
                                    </span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-500", `bg-gradient-to-r ${theme.gradient.replace('/20', '')}`)}
                                        style={{ width: `${skill.progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Prerequisites section */}
            {skill.prerequisites.length > 0 && (
                <div className="rounded-3xl border-2 border-[#f5c16c]/20 bg-black/40 backdrop-blur-md p-6">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Lock className="w-6 h-6 text-[#f5c16c]" />
                        Prerequisites
                    </h2>
                    <div className="space-y-3">
                        {skill.prerequisites.map((prereq) => (
                            <Link key={prereq.skillId} href={`/skills/${prereq.skillId}`}>
                                <div
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02]",
                                        prereq.isMet ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {prereq.isMet ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                        )}
                                        <div>
                                            <h3 className="text-white font-semibold">{prereq.name}</h3>
                                            <p className="text-sm text-white/60">{prereq.statusLabel}</p>
                                        </div>
                                    </div>
                                    <span className={cn("text-sm font-bold", prereq.isMet ? "text-emerald-400" : "text-red-400")}>
                                        Level {prereq.userLevel}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Unlocks section */}
            {skill.unlocks.length > 0 && (
                <div className="rounded-3xl border-2 border-[#f5c16c]/20 bg-black/40 backdrop-blur-md p-6">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-[#f5c16c]" />
                        Unlocks
                    </h2>
                    <p className="text-white/60 mb-4 text-sm">Master this skill to unlock these advanced abilities:</p>
                    <div className="space-y-3">
                        {skill.unlocks.map((unlock) => (
                            <Link key={unlock.skillId} href={`/skills/${unlock.skillId}`}>
                                <div className="flex items-center justify-between p-4 rounded-xl border border-purple-500/40 bg-purple-500/5 hover:scale-[1.02] transition-all">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-purple-400 shrink-0" />
                                        <div>
                                            <h3 className="text-white font-semibold">{unlock.name}</h3>
                                            <p className="text-sm text-white/60">{unlock.statusLabel}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Learning path section */}
            {skill.learningPath.length > 0 && (
                <div className="rounded-3xl border-2 border-[#f5c16c]/20 bg-black/40 backdrop-blur-md p-6">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#f5c16c]" />
                        Learning Path
                    </h2>
                    <p className="text-white/60 mb-4 text-sm">Complete these quests to develop this skill:</p>
                    <div className="space-y-3">
                        {skill.learningPath.map((item) => (
                            <div key={item.questId} className="flex items-center justify-between p-4 rounded-xl border border-blue-500/40 bg-blue-500/5">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />
                                    <div>
                                        <h3 className="text-white font-semibold">{item.title}</h3>
                                        <p className="text-xs text-white/60 uppercase tracking-wider">{item.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-amber-400">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="font-bold">{item.xpReward} XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}