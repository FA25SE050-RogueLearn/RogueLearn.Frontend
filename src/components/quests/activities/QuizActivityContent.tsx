"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle,
    XCircle,
    Trophy,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useState } from "react";
import { QuizActivityPayload } from "@/types/quest";
import questApi from "@/api/questApi";
import { toast } from "sonner";

interface QuizActivityContentProps {
    payload: QuizActivityPayload;
    questId: string;
    stepId: string;
    activityId: string;
    onQuizPassed?: (data: any) => void;
    onQuizFailed?: (data: any) => void;
    isActivityComplete?: boolean;
}

export const QuizActivityContent = ({
    payload,
    questId,
    stepId,
    activityId,
    onQuizPassed,
    onQuizFailed,
    isActivityComplete = false
}: QuizActivityContentProps) => {
    // ========== STATE MANAGEMENT ==========
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const questions = payload.questions || [];
    const totalQuestions = questions.length;

    // ========== CALCULATIONS ==========
    const calculateCorrectCount = (): number => {
        return questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length;
    };

    const correctCount = calculateCorrectCount();
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // ========== HANDLERS ==========
    const handleSelect = (qIndex: number, option: string) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmitQuiz = async () => {
        // ⭐ Validation: All questions must be answered
        if (Object.keys(selectedAnswers).length !== totalQuestions) {
            toast.error("Please answer all questions before submitting");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // ⭐ Step 1: Call submitQuizAnswer API
            const response = await questApi.submitQuizAnswer(
                questId,
                stepId,
                activityId,
                selectedAnswers,
                correctCount,
                totalQuestions
            );

            if (!response.isSuccess) {
                // ❌ API call failed
                const errorMsg = response.message || "Failed to submit quiz";
                setError(errorMsg);
                toast.error(errorMsg);
                onQuizFailed?.({ error: errorMsg });
                setSubmitting(false);
                return;
            }

            // ✅ API call succeeded
            const result = response.data;
            setQuizResult(result);

            // ⭐ Step 2: Show result to user
            if (result.isPassed) {
                // ✅ Quiz passed - show success message
                toast.success(result.message);
                onQuizPassed?.(result);
            } else {
                // ❌ Quiz failed - show failure message
                toast.error(result.message);
                onQuizFailed?.(result);
            }

            // ⭐ Step 3: Mark quiz as submitted
            setSubmitted(true);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
            setError(errorMsg);
            toast.error(errorMsg);
            onQuizFailed?.({ error: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetakeQuiz = () => {
        setSelectedAnswers({});
        setSubmitted(false);
        setQuizResult(null);
        setError(null);
    };

    // ========== RENDER ==========
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
                {/* Info Banner */}
                <div className="p-3 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/30">
                    <p className="text-sm text-[#f5c16c]">
                        📝 This quiz contains {totalQuestions} questions covering this week&apos;s material.
                        You need 70% to pass.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-300">Error submitting quiz</p>
                            <p className="text-sm text-red-200 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Questions */}
                {!submitted ? (
                    <>
                        {questions.map((q, i) => {
                            const selectedAnswer = selectedAnswers[i];
                            const isAnswered = i in selectedAnswers;

                            return (
                                <div key={i} className="p-4 rounded-lg border border-white/10 bg-black/20">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="font-semibold text-white/90 flex-1">
                                            {i + 1}. {q.question}
                                        </p>
                                        {isAnswered && (
                                            <span className="ml-2 text-xs px-2 py-1 rounded bg-[#f5c16c]/20 text-[#f5c16c]">
                                                Answered
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {q.options.map(opt => {
                                            const isSelected = selectedAnswer === opt;

                                            let buttonClass = "justify-start border-white/20 hover:bg-white/10 text-white";
                                            if (isSelected) {
                                                buttonClass = "justify-start bg-[#f5c16c]/20 border-[#f5c16c] text-white hover:bg-[#f5c16c]/30";
                                            }

                                            return (
                                                <Button
                                                    key={opt}
                                                    variant="outline"
                                                    className={`w-full text-left h-auto py-2 whitespace-normal ${buttonClass}`}
                                                    onClick={() => handleSelect(i, opt)}
                                                    disabled={submitted || submitting}
                                                >
                                                    {opt}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmitQuiz}
                            className="w-full bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                            disabled={
                                Object.keys(selectedAnswers).length !== totalQuestions ||
                                submitting ||
                                isActivityComplete
                            }
                            size="lg"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Submit Quiz
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Show Answers After Submission */}
                        {questions.map((q, i) => {
                            const selectedAnswer = selectedAnswers[i];
                            const isCorrect = selectedAnswer === q.correctAnswer;

                            return (
                                <div key={i} className="p-4 rounded-lg border border-white/10 bg-black/20">
                                    <p className="font-semibold mb-3 text-white/90">
                                        {i + 1}. {q.question}
                                    </p>

                                    <div className="space-y-2 mb-3">
                                        {q.options.map(opt => {
                                            const isSelectedOption = selectedAnswer === opt;
                                            const isCorrectOption = q.correctAnswer === opt;
                                            const isWrongSelection = isSelectedOption && !isCorrect;

                                            let buttonClass = "justify-start border-white/20 text-white";
                                            if (isCorrectOption) {
                                                buttonClass = "justify-start bg-green-500/20 border-green-500 text-white";
                                            } else if (isWrongSelection) {
                                                buttonClass = "justify-start bg-red-500/20 border-red-500 text-white";
                                            }

                                            return (
                                                <Button
                                                    key={opt}
                                                    variant="outline"
                                                    className={`w-full text-left h-auto py-2 whitespace-normal ${buttonClass}`}
                                                    disabled
                                                >
                                                    {isCorrectOption && (
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
                                                    )}
                                                    {isWrongSelection && (
                                                        <XCircle className="w-4 h-4 mr-2 text-red-400 flex-shrink-0" />
                                                    )}
                                                    {opt}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation */}
                                    {q.explanation && (
                                        <p className="text-xs text-white/60 p-3 rounded bg-white/5">
                                            💡 <span className="font-semibold">Explanation:</span> {q.explanation}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        {/* Result Summary */}
                        {quizResult && (
                            <div className={`mt-4 p-6 rounded-lg border text-center ${quizResult.isPassed
                                    ? "bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 border-emerald-700/50"
                                    : "bg-gradient-to-br from-amber-950/50 to-amber-900/30 border-amber-700/50"
                                }`}>
                                <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full ${quizResult.isPassed ? "bg-emerald-500/20" : "bg-amber-500/20"
                                    }`}>
                                    {quizResult.isPassed ? (
                                        <Trophy className="w-6 h-6 text-emerald-400" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-amber-400" />
                                    )}
                                </div>
                                <p className={`text-3xl font-bold mb-2 ${quizResult.isPassed ? "text-emerald-300" : "text-amber-300"
                                    }`}>
                                    {quizResult.scorePercentage.toFixed(1)}%
                                </p>
                                <p className="text-white mb-1">
                                    You scored {correctCount} out of {totalQuestions}
                                </p>
                                <p className={`text-sm font-semibold ${quizResult.isPassed ? "text-emerald-400" : "text-amber-400"
                                    }`}>
                                    {quizResult.isPassed ? "✅ Quiz Passed!" : "❌ Quiz Failed - Try Again"}
                                </p>
                                <p className="text-sm text-white/60 mt-2">
                                    {quizResult.message}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-4 justify-center">
                                    {!quizResult.isPassed && (
                                        <Button
                                            onClick={handleRetakeQuiz}
                                            variant="outline"
                                            className="border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                        >
                                            Retake Quiz
                                        </Button>
                                    )}
                                    {quizResult.isPassed && (
                                        <Button
                                            disabled
                                            className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                                            variant="outline"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Ready to Complete Activity
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
