// roguelearn-web/src/components/quests/ModuleLearningView.tsx
"use client";

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


// --- Sub-components for Activities ---

const ReadingActivityContent = ({ payload }: { payload: ReadingActivityPayload }) => {
    const [showEmbedded, setShowEmbedded] = useState(false);

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
                    <>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowEmbedded(!showEmbedded)}
                                className="flex-1 border-[#f5c16c]/40 bg-[#f5c16c]/10 text-[#f5c16c] hover:bg-[#f5c16c]/20"
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                {showEmbedded ? 'Hide Article' : 'Read Here'}
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1 border-[#f5c16c]/40 bg-[#f5c16c]/10 text-[#f5c16c] hover:bg-[#f5c16c]/20"
                            >
                                <a href={payload.url} target="_blank" rel="noopener noreferrer">
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Open in New Tab
                                </a>
                            </Button>
                        </div>

                        {showEmbedded && (
                            <div className="relative rounded-lg overflow-hidden border border-[#f5c16c]/30">
                                <div className="bg-black/60 px-4 py-2 flex items-center justify-between">
                                    <span className="text-xs text-white/60 truncate flex-1">
                                        {payload.url}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowEmbedded(false)}
                                        className="text-white/60 hover:text-white"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                                <iframe
                                    src={payload.url}
                                    className="w-full h-[600px] bg-white"
                                    title={payload.articleTitle}
                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                />
                            </div>
                        )}
                    </>
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

const KnowledgeCheckActivityContent = ({ payload }: { payload: KnowledgeCheckActivityPayload }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const questions: KnowledgeCheckQuestion[] = payload.questions ||
        (payload.question ? [{
            question: payload.question,
            options: payload.options || [],
            correctAnswer: payload.correctAnswer || '',
            explanation: payload.explanation || ''
        }] : []);

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

const QuizActivityContent = ({ payload }: { payload: QuizActivityPayload }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const handleSelect = (qIndex: number, option: string) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    const correctCount = payload.questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length;
    const percentage = Math.round((correctCount / payload.questions.length) * 100);

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
                    <Trophy className="w-5 h-5 text-[#f5c16c]" />
                    Comprehensive Quiz
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
                <div className="p-3 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/30">
                    <p className="text-sm text-[#f5c16c]">
                        📝 This quiz contains {payload.questions.length} questions covering this week&apos;s material.
                    </p>
                </div>

                {payload.questions.map((q, i) => (
                    <div key={i} className="p-4 rounded-lg border border-white/10 bg-black/20">
                        <p className="font-semibold mb-3 text-white">{i + 1}. {q.question}</p>
                        <div className="space-y-2">
                            {q.options.map(opt => {
                                const isSelected = selectedAnswers[i] === opt;
                                const isCorrect = q.correctAnswer === opt;

                                let buttonClass = "w-full justify-start text-left h-auto py-2 whitespace-normal border-white/20 hover:bg-white/10";
                                if (submitted) {
                                    if (isCorrect) {
                                        buttonClass = "w-full justify-start text-left h-auto py-2 whitespace-normal bg-green-500/20 border-green-500 text-white";
                                    } else if (isSelected) {
                                        buttonClass = "w-full justify-start text-left h-auto py-2 whitespace-normal bg-red-500/20 border-red-500 text-white";
                                    }
                                } else if (isSelected) {
                                    buttonClass = "w-full justify-start text-left h-auto py-2 whitespace-normal bg-[#f5c16c]/20 border-[#f5c16c]";
                                }

                                return (
                                    <Button
                                        key={opt}
                                        variant="outline"
                                        className={buttonClass}
                                        onClick={() => handleSelect(i, opt)}
                                        disabled={submitted}
                                    >
                                        {submitted && isCorrect && <CheckCircle className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />}
                                        {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 mr-2 text-red-400 flex-shrink-0" />}
                                        {opt}
                                    </Button>
                                );
                            })}
                        </div>
                        {submitted && <p className="text-xs mt-3 text-white/60 p-3 rounded bg-white/5">💡 {q.explanation}</p>}
                    </div>
                ))}

                {!submitted && (
                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                        disabled={Object.keys(selectedAnswers).length !== payload.questions.length}
                    >
                        Submit Quiz
                    </Button>
                )}

                {submitted && (
                    <div className="mt-4 p-6 rounded-lg bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 border border-emerald-700/50 text-center">
                        <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-white mb-2">
                            {percentage}%
                        </p>
                        <p className="text-sm text-white/80">
                            You scored {correctCount} out of {payload.questions.length}!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

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

// --- Main Component ---

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
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [completedActivities, setCompletedActivities] = useState<string[]>([]);
    const [isCompleting, setIsCompleting] = useState(false);
    const [activeCodingChallenge, setActiveCodingChallenge] = useState<CodingActivityPayload | null>(null);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const [stepProgress, setStepProgress] = useState<any>(null);

    const activities = weeklyStep.content?.activities || [];
    const currentActivity = activities[currentActivityIndex];
    const totalActivities = activities.length;
    const isFirstActivity = currentActivityIndex === 0;
    const isLastActivity = currentActivityIndex === totalActivities - 1;
    const isWeekComplete = completedActivities.length === totalActivities;

    // ⭐ Fetch progress when component mounts
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
                    alert("Failed to load your progress. Please refresh the page.");
                }
            } catch (error) {
                console.error("Failed to fetch progress:", error);
                alert("There was an error loading your progress. Please try again.");
            } finally {
                setIsLoadingProgress(false);
            }
        };

        fetchProgress();
    }, [questId, weeklyStep.id]);

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

        setIsCompleting(true);
        try {
            await questApi.updateActivityProgress(questId, weeklyStep.id, currentActivity.activityId, 'Completed');
            setCompletedActivities(prev => [...prev, currentActivity.activityId]);

            // Auto-advance to next activity if not last
            if (!isLastActivity) {
                setTimeout(() => {
                    handleNextActivity();
                }, 500);
            }
        } catch (error) {
            console.error("Failed to mark activity as complete:", error);
            alert("There was an error saving your progress. Please try again.");
        } finally {
            setIsCompleting(false);
        }
    };

    const renderActivityContent = (activity: Activity) => {
        switch (activity.type) {
            case 'Reading':
                return <ReadingActivityContent payload={activity.payload as ReadingActivityPayload} />;
            case 'KnowledgeCheck':
                return <KnowledgeCheckActivityContent payload={activity.payload as KnowledgeCheckActivityPayload} />;
            case 'Quiz':
                return <QuizActivityContent payload={activity.payload as QuizActivityPayload} />;
            case 'Coding':
                return <CodingActivityContent
                    payload={activity.payload as CodingActivityPayload}
                    onStartChallenge={setActiveCodingChallenge}
                />;
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

    const isActivityComplete = completedActivities.includes(currentActivity.activityId);

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

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
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
                                className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-bold hover:from-[#d4a855] hover:to-[#f5c16c]"
                                onClick={handleCompleteActivity}
                                disabled={isCompleting}
                            >
                                {isCompleting ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                )}
                                Mark as Complete
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