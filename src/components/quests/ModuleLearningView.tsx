// roguelearn-web/src/components/quests/ModuleLearningView.tsx
"use client";

import { QuizActivityContent as QuizActivityContentComponent } from "./activities/QuizActivityContent";
import CodingActivity from "./activities/CodingActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle,
    XCircle,
    Loader2,
    Link as LinkIcon,
    Sparkles,
    Trophy,
    Clock,
    Code
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    QuestStep,
    Activity,
    ReadingActivityPayload,
    KnowledgeCheckActivityPayload,
    QuizActivityPayload,
    QuestCodingActivityPayload,
} from "@/types/quest";
import questApi from "@/api/questApi";
import WeeklyProgressCard from "./WeeklyProgressCard";
import { toast } from "sonner";

// ... (Sub-components remain unchanged)
// ========== SUB-COMPONENTS FOR ACTIVITIES ==========

/**
 * ReadingActivityContent: Displays reading material with session engagement
 */
const ReadingActivityContent = ({
    payload,
    sessionStarted,
    onOpenMaterial
}: {
    payload: ReadingActivityPayload;
    sessionStarted: boolean;
    onOpenMaterial: () => void;
}) => {
    return (
        <Card className="relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
            <div
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                    backgroundImage: 'url(/images/asfalt-dark.png)',
                    backgroundSize: '350px 350px',
                    backgroundRepeat: 'repeat'
                }}
            />
            <CardHeader className="relative z-10">
                <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#f5c16c]" />
                    {payload.articleTitle || 'Reading Material'}
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
                <p className="whitespace-pre-wrap font-body text-white/80 leading-relaxed">
                    {payload.summary}
                </p>

                {payload.url ? (
                    <div className="flex flex-col gap-3">
                        <div className="rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-xs uppercase tracking-[0.3em] text-white/60">Reading</div>
                                {sessionStarted && (
                                    <span className="text-xs font-semibold text-emerald-300">In Progress</span>
                                )}
                            </div>
                            <div className="mt-3 flex gap-2">
                                <Button
                                    className="flex-1 bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                                    onClick={onOpenMaterial}
                                >
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Open in New Tab
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-700/50">
                        <p className="text-sm text-amber-300">
                            No reading material available for this topic yet.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

/**
 * KnowledgeCheckActivityContent: Single or multiple questions with immediate feedback
 */
const KnowledgeCheckActivityContent = ({ payload }: { payload: KnowledgeCheckActivityPayload }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const deriveDefault = (text: string) => {
        const t = (text || '').toLowerCase();
        if (t.startsWith('define')) {
            return { options: ['Definition', 'Property', 'Example', 'Application'], correct: 'Definition' };
        }
        if (t.includes('property')) {
            return { options: ['Definition', 'Property', 'Example', 'Application'], correct: 'Property' };
        }
        if (t.includes('example')) {
            return { options: ['Definition', 'Property', 'Example', 'Application'], correct: 'Example' };
        }
        return { options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 'Option A' };
    };

    const getAnswer = (q: any): string => q.answer || q.correctAnswer || '';

    const baseQuestions = payload.questions || [];

    const questions = baseQuestions.map(q => {
        const hasOptions = Array.isArray(q.options) && q.options.length > 0;
        const d = deriveDefault(q.question);
        const opts = hasOptions ? q.options : d.options;
        const correct = getAnswer(q) || d.correct;
        return {
            question: q.question,
            options: opts,
            answer: correct,
            explanation: q.explanation || ''
        };
    });

    const handleSelect = (qIndex: number, option: string) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    const correctCount = questions.filter((q, i) => selectedAnswers[i] === q.answer).length;

    return (
        <Card className="relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
            <div
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                    backgroundImage: 'url(/images/asfalt-dark.png)',
                    backgroundSize: '350px 350px',
                    backgroundRepeat: 'repeat'
                }}
            />
            <CardHeader className="relative z-10">
                <CardTitle className="text-white">Knowledge Check</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
                {payload.topic && (
                    <div className="px-3 py-1.5 rounded-full bg-[#f5c16c]/20 border border-[#f5c16c]/40 text-[#f5c16c] text-sm font-semibold inline-block">
                        {payload.topic}
                    </div>
                )}

                {questions.map((q, index) => {
                    const selectedAnswer = selectedAnswers[index];
                    return (
                        <div key={index} className="p-4 rounded-lg border border-white/10 bg-black/20">
                            <p className="font-semibold text-white/90 mb-3">
                                {questions.length > 1 ? `${index + 1}. ` : ''}{q.question}
                            </p>
                            <div className="flex flex-col gap-2">
                                {q.options.map(opt => {
                                    const isSelected = selectedAnswer === opt;
                                    const isCorrect = q.answer === opt;

                                    let buttonClass = "justify-start border-white/20 hover:bg-white/10 text-white";
                                    if (submitted) {
                                        if (isCorrect) {
                                            buttonClass = "justify-start bg-green-500/20 border-green-500 text-white hover:bg-green-500/30";
                                        } else if (isSelected && !isCorrect) {
                                            buttonClass = "justify-start bg-red-500/20 border-red-500 text-white hover:bg-red-500/30";
                                        }
                                    } else if (isSelected) {
                                        buttonClass = "justify-start bg-[#f5c16c]/20 border-[#f5c16c] text-white hover:bg-[#f5c16c]/30";
                                    }

                                    return (
                                        <Button
                                            key={opt}
                                            variant="outline"
                                            className={`w-full text-left h-auto py-2 whitespace-normal ${buttonClass}`}
                                            onClick={() => handleSelect(index, opt)}
                                            disabled={submitted}
                                        >
                                            {submitted && isCorrect && (
                                                <CheckCircle className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
                                            )}
                                            {submitted && isSelected && !isCorrect && (
                                                <XCircle className="w-4 h-4 mr-2 text-red-400 flex-shrink-0" />
                                            )}
                                            {opt}
                                        </Button>
                                    );
                                })}
                            </div>
                            {submitted && q.explanation && (
                                <p className="text-xs mt-3 text-white/60 p-3 rounded bg-white/5">
                                    💡 {q.explanation}
                                </p>
                            )}
                        </div>
                    );
                })}

                {!submitted && (
                    <Button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                        disabled={Object.keys(selectedAnswers).length !== questions.length}
                    >
                        Submit Answers
                    </Button>
                )}

                {submitted && (
                    <div className="mt-4 p-4 rounded-md bg-emerald-950/30 border border-emerald-700/50 text-center">
                        <p className="text-lg font-bold text-white">
                            You got {correctCount} out of {questions.length} correct!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// ========== MAIN COMPONENT ==========

interface ModuleLearningViewProps {
    weeklyStep: QuestStep;
    questId: string;
    questName?: string;
    learningPathName?: string;
    chapterName?: string;
    totalWeeks: number;
}

export function ModuleLearningView({
    weeklyStep,
    questId,
    questName,
    learningPathName,
    chapterName,
    totalWeeks
}: ModuleLearningViewProps) {
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [completedActivities, setCompletedActivities] = useState<string[]>([]);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    // ⭐ Cached progress state to avoid re-fetching
    const [stepProgressData, setStepProgressData] = useState<any>(null);
    const [quizPassedState, setQuizPassedState] = useState<boolean | null>(null);

    // Use memoized activities from props instead of parsing from API response every time
    const activities = useMemo(() => weeklyStep.content?.activities || [], [weeklyStep]);
    const currentActivity = activities[currentActivityIndex];
    const totalActivities = activities.length;
    const isFirstActivity = currentActivityIndex === 0;
    const isLastActivity = currentActivityIndex === totalActivities - 1;
    const isActivityComplete = completedActivities.includes(currentActivity?.activityId);

    const isWeekComplete = stepProgressData?.status === 'Completed' || (totalActivities > 0 && completedActivities.length === totalActivities);

    // ========== EFFECTS ==========

    const fetchProgress = useCallback(async () => {
        try {
            // Only show loading on initial load, not background refresh
            if (!stepProgressData) setIsLoadingProgress(true);

            const response = await questApi.getCompletedActivities(questId, weeklyStep.id);

            if (response.isSuccess && response.data) {
                const completed = response.data.activities
                    .filter((a: any) => a.isCompleted)
                    .map((a: any) => a.activityId);

                setCompletedActivities(completed);
                setStepProgressData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch progress:", error);
        } finally {
            setIsLoadingProgress(false);
        }
    }, [questId, weeklyStep.id]);

    useEffect(() => {
        fetchProgress();
    }, []);

    // Reset quiz pass state when activity changes
    useEffect(() => {
        setQuizPassedState(null);
    }, [currentActivityIndex]);

    const handleNextActivity = () => {
        if (!isLastActivity) {
            setCurrentActivityIndex(prev => prev + 1);
        }
    };

    const handlePrevActivity = () => {
        if (!isFirstActivity) {
            setCurrentActivityIndex(prev => prev - 1);
        }
    };

    const handleCompleteActivity = async () => {
        if (!currentActivity || completedActivities.includes(currentActivity.activityId)) {
            return;
        }

        if (currentActivity.type === 'Quiz') {
            if (quizPassedState !== true) {
                toast.error("You must pass the quiz first before completing this activity.");
                return;
            }
        }

        // Fix: Removed the early return for Coding type to allow manual skipping.
        // The "Skip & Complete" button in the UI will now work.

        setIsCompleting(true);

        try {
            await questApi.updateActivityProgress(questId, weeklyStep.id, currentActivity.activityId, 'Completed');

            // ⭐ Optimistically update local state immediately
            setCompletedActivities(prev => [...prev, currentActivity.activityId]);

            // Background refresh to sync server state (XP, etc) without blocking UI
            fetchProgress();

            setQuizPassedState(null);

            if (!isLastActivity) {
                setTimeout(() => {
                    handleNextActivity();
                }, 500);
            }
        } catch (error) {
            console.error("Failed to mark activity as complete:", error);
            toast.error("There was an error saving your progress. Please try again.");
        } finally {
            setIsCompleting(false);
        }
    };

    const handleCodingComplete = async () => {
        await fetchProgress();
        if (currentActivity && !completedActivities.includes(currentActivity.activityId)) {
            setCompletedActivities(prev => [...prev, currentActivity.activityId]);
        }
    }

    const [readingSessionStarted, setReadingSessionStarted] = useState(false);

    useEffect(() => {
        setReadingSessionStarted(false);
    }, [currentActivityIndex]);

    const renderActivityContent = (activity: Activity) => {
        switch (activity.type) {
            case 'Reading':
                return (
                    <ReadingActivityContent
                        key={activity.activityId}
                        payload={activity.payload as ReadingActivityPayload}
                        sessionStarted={readingSessionStarted}
                        onOpenMaterial={async () => {
                            try {
                                await questApi.updateActivityProgress(questId, weeklyStep.id, activity.activityId, 'InProgress');
                                setReadingSessionStarted(true);
                            } catch { }
                            const url = (activity.payload as ReadingActivityPayload).url;
                            if (url) {
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }
                        }}
                    />
                );
            case 'KnowledgeCheck':
                return <KnowledgeCheckActivityContent
                    key={activity.activityId}
                    payload={activity.payload as KnowledgeCheckActivityPayload}
                />;
            case 'Quiz':
                return (
                    <QuizActivityContentComponent
                        key={activity.activityId}
                        payload={activity.payload as QuizActivityPayload}
                        questId={questId}
                        stepId={weeklyStep.id}
                        activityId={activity.activityId}
                        isActivityComplete={isActivityComplete}
                        onQuizPassed={(result) => {
                            setQuizPassedState(true);
                        }}
                        onQuizFailed={(result) => {
                            setQuizPassedState(false);
                        }}
                    />
                );
            case 'Coding':
                return (
                    <CodingActivity
                        key={activity.activityId}
                        questId={questId}
                        stepId={weeklyStep.id}
                        activityId={activity.activityId}
                        payload={activity.payload as QuestCodingActivityPayload}
                        onComplete={handleCodingComplete}
                        isCompleted={isActivityComplete}
                    />
                );
            default:
                return <p className="text-white/60">Unknown activity type: {activity.type}</p>;
        }
    };

    if (!currentActivity) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <XCircle className="w-16 h-16 text-red-500" />
                <p className="text-xl text-white/70">No activities found for this week.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                        <Link href="/quests" className="hover:text-[#f5c16c]">
                            {learningPathName || 'Questline'}
                        </Link>
                        {chapterName && (
                            <>
                                <span>/</span>
                                <span className="text-white/40">{chapterName}</span>
                            </>
                        )}
                        <span>/</span>
                        <Link href={`/quests/${questId}`} className="hover:text-[#f5c16c]">
                            {questName || 'Quest'}
                        </Link>
                    </div>
                    <h1 className="text-4xl font-bold font-heading flex items-center gap-3 text-white">
                        <BookOpen className="w-10 h-10 text-[#f5c16c]" />
                        {weeklyStep.title}
                    </h1>
                    <p className="text-sm text-white/60 mt-2">
                        Activity {currentActivityIndex + 1} of {totalActivities} • Week {weeklyStep.stepNumber} of {totalWeeks}
                    </p>
                </div>

                <div className="w-80">
                    {isLoadingProgress ? (
                        <Card className="bg-black/40 border-[#f5c16c]/20">
                            <CardContent className="py-6 flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-[#f5c16c]" />
                                <span className="text-white/60">Loading progress...</span>
                            </CardContent>
                        </Card>
                    ) : (
                        <WeeklyProgressCard
                            step={weeklyStep}
                            completedActivities={completedActivities}
                            totalActivities={totalActivities}
                        />
                    )}
                </div>
            </div>

            {/* Main Activity Card */}
            <Card className="relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] min-h-[calc(100vh-280px)]">
                <div
                    className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                    style={{
                        backgroundImage: 'url(/images/asfalt-dark.png)',
                        backgroundSize: '350px 350px',
                        backgroundRepeat: 'repeat'
                    }}
                />
                <div className="relative z-10 flex items-center justify-between gap-4 px-6 py-2.5 border-b border-[#f5c16c]/20 bg-black/30">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevActivity}
                        disabled={isFirstActivity}
                        className="text-white/70 hover:text-white hover:bg-[#f5c16c]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-white/60">
                            Activity {currentActivityIndex + 1}/{totalActivities}: <span className="text-white font-medium">{currentActivity.type}</span>
                        </span>
                        {(currentActivity.payload as any).experiencePoints > 0 && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f5c16c] bg-[#f5c16c]/10 border border-[#f5c16c]/30 rounded-full px-2 py-0.5">
                                <Sparkles className="w-3 h-3" /> +{(currentActivity.payload as any).experiencePoints} XP
                            </span>
                        )}

                        {/* Mark Complete button enabled for ALL activities including Coding */}
                        {!isActivityComplete && (
                            <Button
                                size="sm"
                                className={`font-semibold ${currentActivity.type === 'Quiz' && quizPassedState !== true
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black hover:from-[#d4a855] hover:to-[#f5c16c]'
                                    }`}
                                onClick={handleCompleteActivity}
                                disabled={
                                    isCompleting ||
                                    (currentActivity.type === 'Quiz' && quizPassedState !== true)
                                }
                            >
                                {isCompleting ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : currentActivity.type === 'Coding' ? (
                                    <Code className="w-4 h-4 mr-1" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                )}
                                {currentActivity.type === 'Quiz' && quizPassedState !== true
                                    ? 'Pass Quiz First'
                                    : currentActivity.type === 'Coding'
                                        ? 'Skip & Complete'
                                        : 'Mark Complete'
                                }
                            </Button>
                        )}

                        {isActivityComplete && (
                            <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-semibold">
                                <CheckCircle className="w-4 h-4" /> Completed
                            </span>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextActivity}
                        disabled={isLastActivity}
                        className="text-white/70 hover:text-white hover:bg-[#f5c16c]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Next <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <CardContent className="relative z-10 p-6">
                    {renderActivityContent(currentActivity)}
                </CardContent>
            </Card>

            {isWeekComplete && (
                <Card className="relative overflow-hidden border-emerald-500/50 bg-gradient-to-br from-emerald-950/50 to-emerald-900/30">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                        style={{
                            backgroundImage: 'url(/images/asfalt-dark.png)',
                            backgroundSize: '350px 350px',
                            backgroundRepeat: 'repeat'
                        }}
                    />
                    <CardContent className="relative z-10 py-6">
                        <div className="flex items-center gap-4">
                            <Trophy className="w-12 h-12 text-emerald-400" />
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    Week {weeklyStep.stepNumber} Complete!
                                </h3>
                                <p className="text-sm text-emerald-300">
                                    You&apos;ve completed all {totalActivities} activities and earned {weeklyStep.experiencePoints} XP!
                                </p>
                            </div>
                            {weeklyStep.stepNumber < totalWeeks && (
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                                >
                                    <Link href={`/quests/${questId}/week/${weeklyStep.stepNumber + 1}`}>
                                        Next Week <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}