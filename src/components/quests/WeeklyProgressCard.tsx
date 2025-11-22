// roguelearn-web/src/components/quests/WeeklyProgressCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestStep } from '@/types/quest';
import { CheckCircle2, Circle, Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import questApi from '@/api/questApi';

interface WeeklyProgressCardProps {
    step: QuestStep;
    questId: string; // ⭐ NEW: Need questId to fetch progress
    completedActivities?: string[]; // Optional fallback
    totalActivities?: number; // Optional fallback
}

/**
 * Displays progress for a weekly learning module.
 * Shows completion percentage and activity breakdown.
 * ⭐ UPDATED: Fetches actual progress from backend
 */
export default function WeeklyProgressCard({
    step,
    questId,
    completedActivities = [],
    totalActivities = 0,
}: WeeklyProgressCardProps) {
    const [progressData, setProgressData] = useState<{
        completed: number;
        total: number;
    }>({
        completed: completedActivities.length,
        total: totalActivities,
    });
    const [isLoading, setIsLoading] = useState(totalActivities === 0);

    // ⭐ NEW: Fetch actual step progress
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setIsLoading(true);
                const response = await questApi.getStepProgress(questId, step.id);

                if (response.isSuccess && response.data) {
                    setProgressData({
                        completed: response.data.completedActivitiesCount,
                        total: response.data.totalActivitiesCount,
                    });
                    console.log(`✅ Fetched progress for step ${step.stepNumber}:`, response.data);
                } else {
                    console.warn('Failed to fetch step progress:', response.message);
                    // Fallback to props
                    setProgressData({
                        completed: completedActivities.length,
                        total: totalActivities,
                    });
                }
            } catch (error) {
                console.error('Error fetching step progress:', error);
                // Fallback to props
                setProgressData({
                    completed: completedActivities.length,
                    total: totalActivities,
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (questId && step.id) {
            fetchProgress();
        }
    }, [questId, step.id, completedActivities.length, totalActivities]);

    const completionPercentage =
        progressData.total > 0 ? Math.round((progressData.completed / progressData.total) * 100) : 0;
    const isComplete = completionPercentage === 100;

    if (isLoading) {
        return (
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-100">
                        <Circle className="w-5 h-5 text-slate-400" />
                        <span className="text-sm">Week {step.stepNumber} Progress</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center gap-2 p-6">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span className="text-sm text-slate-400">Loading progress...</span>
                </CardContent>
            </Card>
        );
    }

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
                            {progressData.completed}/{progressData.total}
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

                {/* Completion Percentage */}
                <div className="text-center">
                    <span className="text-2xl font-bold text-amber-400">{completionPercentage}%</span>
                    <span className="text-xs text-slate-400 ml-2">Complete</span>
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