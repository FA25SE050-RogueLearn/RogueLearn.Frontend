// roguelearn-web/src/components/quests/WeeklyProgressCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestStep } from '@/types/quest';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyProgressCardProps {
    step: QuestStep;
    completedActivities: string[];
    totalActivities: number;
}

/**
 * Displays progress for a weekly learning module.
 * Styled like a Dark Souls 3 health bar - no wasted space.
 */
export default function WeeklyProgressCard({
    step,
    completedActivities,
    totalActivities,
}: WeeklyProgressCardProps) {
    const completionPercentage =
        totalActivities > 0 ? Math.round((completedActivities.length / totalActivities) * 100) : 0;
    const isComplete = completionPercentage === 100;

    return (
        <div className="w-full">
            {/* Dark Souls-style health bar container */}
            <div className="relative h-16 bg-gradient-to-r from-slate-950 to-slate-900 border-2 border-amber-700/50 rounded-none overflow-hidden group hover:border-amber-600/70 transition-colors">
                {/* Ornamental corners */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-amber-600"></div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-amber-600"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-amber-600"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-amber-600"></div>

                {/* Health bar fill */}
                <div
                    className={cn(
                        'h-full transition-all duration-500 relative',
                        isComplete
                            ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800'
                            : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400'
                    )}
                    style={{ width: `${completionPercentage}%` }}
                >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                    
                    {/* Inner glow */}
                    <div className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity',
                        isComplete
                            ? 'shadow-inner shadow-emerald-600/30'
                            : 'shadow-inner shadow-amber-300/50'
                    )}></div>
                </div>

                {/* Text overlay - centered in the bar */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                    {/* Left side: Week info */}
                    <div className="flex items-center gap-3 z-10">
                        {isComplete ? (
                            <Trophy className="w-5 h-5 text-amber-300 drop-shadow-lg" />
                        ) : (
                            <Circle className="w-5 h-5 text-slate-300 drop-shadow-lg" />
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-100 drop-shadow-md">
                                Week {step.stepNumber}
                            </span>
                            <span className="text-xs text-slate-200 drop-shadow-md">
                                {completedActivities.length}/{totalActivities}
                            </span>
                        </div>
                    </div>

                    {/* Center: Percentage */}
                    <div className="text-center z-10">
                        <span className="text-lg font-bold text-amber-100 drop-shadow-lg">
                            {completionPercentage}%
                        </span>
                    </div>

                    {/* Right side: Status and XP */}
                    <div className="flex items-center gap-3 z-10">
                        <div className="text-right flex flex-col">
                            {isComplete && (
                                <span className="text-xs font-bold text-emerald-300 drop-shadow-md">
                                    COMPLETE
                                </span>
                            )}
                            <span className="text-xs font-semibold text-amber-300 drop-shadow-md">
                                {step.experiencePoints} XP
                            </span>
                        </div>
                        {isComplete ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-lg" />
                        ) : (
                            <Circle className="w-5 h-5 text-slate-400 drop-shadow-lg" />
                        )}
                    </div>
                </div>
            </div>

            {/* Optional: Completion status banner below */}
            {isComplete && (
                <div className="mt-2 px-3 py-1 bg-emerald-950/50 border-l-2 border-emerald-700 text-xs text-emerald-300 font-medium">
                    ✓ Week Completed
                </div>
            )}
        </div>
    );
}