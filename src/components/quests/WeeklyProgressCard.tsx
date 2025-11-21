// roguelearn-web/src/components/quests/WeeklyProgressCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestStep } from '@/types/quest';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyProgressCardProps {
    step: QuestStep;
    completedActivities: string[]; // Array of completed activityIds
    totalActivities: number;
}

/**
 * Displays progress for a weekly learning module.
 * Shows completion percentage and activity breakdown.
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
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-700/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-100">
                    {isComplete ? (
                        <Trophy className="w-5 h-5 text-amber-400" />
                    ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="text-sm">Week {step.stepNumber} Progress</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Activities Completed</span>
                        <span className="text-xs font-semibold text-amber-300">
                            {completedActivities.length}/{totalActivities}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full transition-all duration-500 rounded-full',
                                isComplete
                                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                                    : 'bg-gradient-to-r from-amber-500 to-amber-400'
                            )}
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Experience Points */}
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <span className="text-xs text-slate-300">Week XP</span>
                    <span className="text-sm font-bold text-amber-400">{step.experiencePoints} XP</span>
                </div>

                {/* Completion Status */}
                {isComplete && (
                    <div className="flex items-center gap-2 p-3 bg-green-950/30 border border-green-800/50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-300 font-medium">Week Completed!</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
