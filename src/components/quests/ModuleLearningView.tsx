"use client";

import { QuizActivityContent as QuizActivityContentComponent } from "./activities/QuizActivityContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle,
    XCircle,
    Loader2,
    Link as LinkIcon,
    Sparkles,
    Trophy
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    QuestStep,
    Activity,
    ReadingActivityPayload,
    KnowledgeCheckActivityPayload,
    QuizActivityPayload,
    CodingActivityPayload,
    KnowledgeCheckQuestion,
    QuizQuestion
} from "@/types/quest";
import questApi from "@/api/questApi";
import { CodingChallengeModal } from "./CodingChallengeModal";
import WeeklyProgressCard from "./WeeklyProgressCard";
import { toast } from "sonner";

// ========== SUB-COMPONENTS FOR ACTIVITIES ==========

/**
 * ReadingActivityContent: Displays reading material with session engagement
 * Features: Article summary, start session, open in new tab (no iframe)
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
                            📚 No reading material available for this topic yet.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

/**
 * KnowledgeCheckActivityContent: Single or multiple questions with immediate feedback
 * Features: Question display, answer selection, immediate correctness feedback, explanations
 * Note: This is for formative assessment (no grading required to complete)
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

    const baseQuestions: KnowledgeCheckQuestion[] = payload.questions ||
        (payload.question ? [{
            question: payload.question,
            options: payload.options || [],
            correctAnswer: payload.correctAnswer || '',
            explanation: payload.explanation || ''
        }] : []);

    const questions: KnowledgeCheckQuestion[] = baseQuestions.map(q => {
        const hasOptions = Array.isArray(q.options) && q.options.length > 0;
        const d = deriveDefault(q.question);
        const opts = hasOptions ? q.options : d.options;
        const correct = q.correctAnswer && q.correctAnswer.length > 0 ? q.correctAnswer : d.correct;
        return { ...q, options: opts, correctAnswer: correct, explanation: q.explanation || '' };
    });

    const handleSelect = (qIndex: number, option: string) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    const correctCount = questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length;

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
                                    const isCorrect = q.correctAnswer === opt;

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

/**
 * CodingActivityContent: Displays coding challenge setup
 * Features: Language badge, difficulty badge, topic description, start button
 * Note: Opens CodingChallengeModal when started
 */
const CodingActivityContent = ({
    payload,
    onStartChallenge
}: {
    payload: CodingActivityPayload;
    onStartChallenge: (content: CodingActivityPayload) => void;
}) => (
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
            <CardTitle className="text-white">💻 Coding Challenge</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-semibold">
                    {payload.language}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-semibold">
                    {payload.difficulty}
                </span>
            </div>
            <div>
                <h4 className="font-semibold text-white mb-2">Topic:</h4>
                <p className="text-white/80">{payload.topic}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/30">
                <p className="text-sm text-[#f5c16c]">
                    This coding challenge will be generated dynamically when you start working on it.
                    The challenge will be tailored to the <strong>{payload.topic}</strong> topic at a <strong>{payload.difficulty}</strong> level using <strong>{payload.language}</strong>.
                </p>
            </div>
            <Button
                className="w-full bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                onClick={() => onStartChallenge(payload)}
            >
                Start Coding Challenge
            </Button>
        </CardContent>
    </Card>
);

// ========== MAIN COMPONENT ==========

interface ModuleLearningViewProps {
    weeklyStep: QuestStep;
    questId: string;
    questName?: string;
    learningPathId: string;
    learningPathName?: string;
    chapterId: string;
    chapterName?: string;
    totalWeeks: number;
}

/**
 * ModuleLearningView: Main component for viewing and completing weekly learning modules
 * 
 * Features:
 * - Activity navigation (previous/next)
 * - Progress tracking (completed/total activities)
 * - Activity rendering based on type (Reading, KnowledgeCheck, Quiz, Coding)
 * - Quiz validation flow (must pass before marking complete)
 * - Week completion celebration
 * 
 * State Management:
 * - currentActivityIndex: Track which activity user is viewing
 * - completedActivities: List of completed activity IDs
 * - quizPassedState: Track if current quiz was passed (required for completion)
 * - isCompleting: Show loading state during completion
 * - activeCodingChallenge: Track active coding challenge modal
 * - isLoadingProgress: Show loading state while fetching progress
 * - stepProgress: Cached progress data
 */
export function ModuleLearningView({
    weeklyStep,
    questId,
    questName,
    learningPathId,
    learningPathName,
    chapterId,
    chapterName,
    totalWeeks
}: ModuleLearningViewProps) {
    // ========== STATE MANAGEMENT ==========
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [completedActivities, setCompletedActivities] = useState<string[]>([]);
    const [isCompleting, setIsCompleting] = useState(false);
    const [activeCodingChallenge, setActiveCodingChallenge] = useState<CodingActivityPayload | null>(null);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const [stepProgress, setStepProgress] = useState<any>(null);

    // ⭐ NEW: Track if quiz was passed (for Quiz activities only)
    const [quizPassedState, setQuizPassedState] = useState<boolean | null>(null);

    // ========== DERIVED STATE ==========
    const activities = weeklyStep.content?.activities || [];
    const currentActivity = activities[currentActivityIndex];
    const totalActivities = activities.length;
    const isFirstActivity = currentActivityIndex === 0;
    const isLastActivity = currentActivityIndex === totalActivities - 1;
    const isWeekComplete = completedActivities.length === totalActivities;
    const isActivityComplete = completedActivities.includes(currentActivity?.activityId);

    // ========== EFFECTS ==========

    /**
     * Fetch progress when component mounts
     * Loads completed activities and step progress data
     */
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setIsLoadingProgress(true);
                const response = await questApi.getCompletedActivities(questId, weeklyStep.id);

                // ✅ Check if the request was successful
                if (response.isSuccess && response.data) {
                    // Extract completed activity IDs
                    const completed = response.data.activities
                        .filter((a: any) => a.isCompleted)
                        .map((a: any) => a.activityId);

                    setCompletedActivities(completed);
                    setStepProgress(response.data);

                    console.log(`✅ Loaded progress: ${completed.length}/${response.data.totalCount} activities completed`);
                } else {
                    // Handle error response
                    console.error("Failed to fetch progress:", response.message);
                    toast.error("Failed to load your progress. Please refresh the page.");
                }
            } catch (error) {
                console.error("Failed to fetch progress:", error);
                toast.error("There was an error loading your progress. Please try again.");
            } finally {
                setIsLoadingProgress(false);
            }
        };

        fetchProgress();
    }, [questId, weeklyStep.id]);

    /**
     * ⭐ NEW: Reset quiz pass state when activity changes
     * Ensures each Quiz activity starts fresh without pass/fail state
     */
    useEffect(() => {
        setQuizPassedState(null);
    }, [currentActivityIndex]);

    // ========== HANDLERS ==========

    /**
     * Navigate to next activity
     */
    const handleNextActivity = () => {
        if (!isLastActivity) {
            setCurrentActivityIndex(prev => prev + 1);
        }
    };

    /**
     * Navigate to previous activity
     */
    const handlePrevActivity = () => {
        if (!isFirstActivity) {
            setCurrentActivityIndex(prev => prev - 1);
        }
    };

    /**
     * ⭐ UPDATED: Mark activity as complete with Quiz validation
     * 
     * For Quiz activities: Only allows completion if quiz was passed
     * For other activities: Allows immediate completion
     * 
     * Flow:
     * 1. Check if activity already completed
     * 2. If Quiz: verify quizPassedState === true
     * 3. Call updateActivityProgress API
     * 4. Update local state
     * 5. Auto-advance to next activity (if not last)
     */
    const handleCompleteActivity = async () => {
        if (!currentActivity || completedActivities.includes(currentActivity.activityId)) {
            return;
        }

        // ⭐ NEW: If it's a Quiz, require that it was passed first
        if (currentActivity.type === 'Quiz') {
            if (quizPassedState !== true) {
                toast.error("You must pass the quiz first before completing this activity.");
                return;
            }
        }

        setIsCompleting(true);
        try {
            await questApi.updateActivityProgress(questId, weeklyStep.id, currentActivity.activityId, 'Completed');
            setCompletedActivities(prev => [...prev, currentActivity.activityId]);
            setQuizPassedState(null); // Reset for next activity

            // Auto-advance to next activity if not last
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

    /**
     * Render activity content based on activity type
     * 
     * ⭐ UPDATED: Quiz case now uses imported QuizActivityContentComponent
     * Passes callbacks for quiz pass/fail tracking
     */
    const [readingSessionStarted, setReadingSessionStarted] = useState(false);

    useEffect(() => {
        setReadingSessionStarted(false);
    }, [currentActivityIndex]);

    const renderActivityContent = (activity: Activity) => {
        switch (activity.type) {
            case 'Reading':
                return (
                    <ReadingActivityContent
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
                return <KnowledgeCheckActivityContent payload={activity.payload as KnowledgeCheckActivityPayload} />;
            case 'Quiz':
                return (
                    <QuizActivityContentComponent
                        payload={activity.payload as QuizActivityPayload}
                        questId={questId}
                        stepId={weeklyStep.id}
                        activityId={activity.activityId}
                        isActivityComplete={isActivityComplete}
                        onQuizPassed={(result) => {
                            // ✅ Quiz passed - enable completion
                            setQuizPassedState(true);
                            console.log("Quiz passed:", result);
                        }}
                        onQuizFailed={(result) => {
                            // ❌ Quiz failed - disable completion
                            setQuizPassedState(false);
                            console.log("Quiz failed:", result);
                        }}
                    />
                );
            case 'Coding':
                return <CodingActivityContent
                    payload={activity.payload as CodingActivityPayload}
                    onStartChallenge={setActiveCodingChallenge}
                />;
            default:
                return <p className="text-white/60">Unknown activity type: {activity.type}</p>;
        }
    };

    // ========== RENDER ==========

    if (!currentActivity) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <XCircle className="w-16 h-16 text-red-500" />
                <p className="text-xl text-white/70">No activities found for this week.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-40">
            {/* Coding Challenge Modal */}
            {activeCodingChallenge && (
                <CodingChallengeModal
                    challengeContent={activeCodingChallenge}
                    onClose={() => setActiveCodingChallenge(null)}
                    onComplete={() => {
                        handleCompleteActivity();
                        setActiveCodingChallenge(null);
                    }}
                />
            )}

            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
                {/* Breadcrumb and Title */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                        <Link href={`/quests/${learningPathId}`} className="hover:text-[#f5c16c]">
                            {learningPathName || 'Questline'}
                        </Link>
                        <span>/</span>
                        <Link href={`/quests/${learningPathId}/${chapterId}`} className="hover:text-[#f5c16c]">
                            {chapterName || 'Chapter'}
                        </Link>
                        <span>/</span>
                        <Link href={`/quests/${learningPathId}/${chapterId}/${questId}`} className="hover:text-[#f5c16c]">
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

                {/* Weekly Progress Card */}
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
            <Card className="relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506]">
                <div
                    className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                    style={{
                        backgroundImage: 'url(/images/asfalt-dark.png)',
                        backgroundSize: '350px 350px',
                        backgroundRepeat: 'repeat'
                    }}
                />
                <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center justify-between text-white">
                        <span className="flex-1">
                            Activity {currentActivityIndex + 1}: {currentActivity.type}
                        </span>
                        <div className="flex items-center gap-4">
                            {(currentActivity.payload as any).experiencePoints > 0 && (
                                <span className="flex items-center gap-2 text-sm font-semibold text-[#f5c16c] bg-[#f5c16c]/10 border border-[#f5c16c]/30 rounded-full px-3 py-1">
                                    <Sparkles className="w-4 h-4" /> +{(currentActivity.payload as any).experiencePoints} XP
                                </span>
                            )}
                            {isActivityComplete && (
                                <span className="flex items-center gap-2 text-sm text-emerald-400">
                                    <CheckCircle className="w-4 h-4" /> Completed
                                </span>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                    {renderActivityContent(currentActivity)}
                </CardContent>
            </Card>

            {/* Week Completion Banner */}
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
                                    Week {weeklyStep.stepNumber} Complete! 🎉
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
                                    <Link href={`/quests/${learningPathId}/${chapterId}/${questId}/week/${weeklyStep.stepNumber + 1}`}>
                                        Next Week <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Activity Navigation - Fixed Bottom Bar */}
            <div className="fixed bottom-36 left-0 right-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        {/* Previous Button */}
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handlePrevActivity}
                            disabled={isFirstActivity}
                            className="border-[#f5c16c]/20 bg-black/40 hover:bg-[#f5c16c]/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> Previous
                        </Button>

                        {/* Complete Button */}
                        {!isActivityComplete ? (
                            <Button
                                size="lg"
                                className={`bg-gradient-to-r text-black font-bold ${
                                    // ⭐ NEW: For Quiz, disable until passed
                                    currentActivity.type === 'Quiz' && quizPassedState !== true
                                        ? 'from-gray-500 to-gray-600 cursor-not-allowed opacity-50'
                                        : 'from-[#f5c16c] to-[#d4a855] hover:from-[#d4a855] hover:to-[#f5c16c]'
                                    }`}
                                onClick={handleCompleteActivity}
                                disabled={
                                    isCompleting ||
                                    (currentActivity.type === 'Quiz' && quizPassedState !== true)
                                }
                            >
                                {isCompleting ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                )}
                                {currentActivity.type === 'Quiz' && quizPassedState !== true
                                    ? 'Pass Quiz First'
                                    : 'Mark as Complete'
                                }
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 text-emerald-400 font-semibold px-4">
                                <CheckCircle className="w-5 h-5" /> Activity Completed
                            </div>
                        )}

                        {/* Next Button */}
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleNextActivity}
                            disabled={isLastActivity}
                            className="border-[#f5c16c]/20 bg-black/40 hover:bg-[#f5c16c]/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
