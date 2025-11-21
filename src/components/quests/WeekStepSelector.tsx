// roguelearn-web/src/components/quests/WeekStepSelector.tsx
'use client';

import { QuestStep } from '@/types/quest';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeekStepSelectorProps {
    steps: QuestStep[];
    currentStepNumber: number;
    onStepSelect: (stepNumber: number) => void;
    completedSteps?: number[]; // Array of completed step numbers
}

/**
 * Sidebar component for selecting weekly learning modules.
 * Shows progress and allows navigation between weeks.
 */
export default function WeekStepSelector({
    steps,
    currentStepNumber,
    onStepSelect,
    completedSteps = [],
}: WeekStepSelectorProps) {
    const getStepStatus = (stepNumber: number): 'completed' | 'current' | 'locked' | 'available' => {
        if (completedSteps.includes(stepNumber)) return 'completed';
        if (stepNumber === currentStepNumber) return 'current';
        if (stepNumber > currentStepNumber) return 'locked';
        return 'available';
    };

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold text-amber-100 mb-4">Weekly Modules</h3>

            {steps.map((step) => {
                const status = getStepStatus(step.stepNumber);
                const isLocked = status === 'locked';
                const isCompleted = status === 'completed';
                const isCurrent = status === 'current';

                return (
                    <button
                        key={step.id}
                        onClick={() => !isLocked && onStepSelect(step.stepNumber)}
                        disabled={isLocked}
                        className={cn(
                            'w-full text-left p-4 rounded-lg border transition-all duration-200',
                            'flex items-start gap-3 group',
                            {
                                // Completed state
                                'bg-green-950/30 border-green-800/50 hover:bg-green-950/40':
                                    isCompleted && !isCurrent,
                                'cursor-pointer': isCompleted && !isCurrent,

                                // Current state
                                'bg-amber-950/50 border-amber-600 shadow-lg shadow-amber-900/20':
                                    isCurrent,
                                'ring-2 ring-amber-600/50': isCurrent,

                                // Available state
                                'bg-slate-900/30 border-slate-700/50 hover:bg-slate-900/50 hover:border-slate-600':
                                    status === 'available' && !isCurrent,

                                // Locked state
                                'bg-slate-950/20 border-slate-800/30 cursor-not-allowed opacity-50':
                                    isLocked,
                            }
                        )}
                    >
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : isLocked ? (
                                <Lock className="w-5 h-5 text-slate-500" />
                            ) : (
                                <Circle
                                    className={cn('w-5 h-5', {
                                        'text-amber-400': isCurrent,
                                        'text-slate-400': !isCurrent,
                                    })}
                                />
                            )}
                        </div>

                        {/* Week Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className={cn('text-xs font-semibold', {
                                        'text-green-400': isCompleted,
                                        'text-amber-300': isCurrent,
                                        'text-slate-400': status === 'available',
                                        'text-slate-600': isLocked,
                                    })}
                                >
                                    Week {step.stepNumber}
                                </span>
                                {isCurrent && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-600/20 text-amber-300 rounded">
                                        Current
                                    </span>
                                )}
                            </div>

                            <h4
                                className={cn('text-sm font-medium line-clamp-2', {
                                    'text-green-100': isCompleted,
                                    'text-amber-100': isCurrent,
                                    'text-slate-300': status === 'available',
                                    'text-slate-600': isLocked,
                                })}
                            >
                                {step.title.replace(/^Week \d+:\s*/, '')}
                            </h4>

                            <div className="flex items-center gap-2 mt-2">
                                <span
                                    className={cn('text-xs', {
                                        'text-green-400': isCompleted,
                                        'text-amber-400': isCurrent,
                                        'text-slate-500': !isCurrent && !isCompleted,
                                    })}
                                >
                                    {step.experiencePoints} XP
                                </span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
