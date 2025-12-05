"use client";

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
    // Note: API uses 'answer' field, but we also support 'correctAnswer' for backward compatibility
    const getCorrectAnswer = (q: any): string => q.answer || q.correctAnswer || '';
    
    const calculateCorrectCount = (): number => {
        return questions.filter((q, i) => selectedAnswers[i] === getCorrectAnswer(q)).length;
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
        <div className="space-y-4">
            {/* Compact Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-[#f5c16c]" />
                    <h3 className="text-lg font-semibold text-white">Quiz</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#f5c16c]/20 text-[#f5c16c]">
                        {totalQuestions} questions • 70% to pass
                    </span>
                </div>
                {!submitted && (
                    <span className="text-sm text-white/50">
                        {Object.keys(selectedAnswers).length}/{totalQuestions} answered
                    </span>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {/* Questions Grid - 2 columns for less scrolling */}
            {!submitted ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {questions.map((q, i) => {
                            const selectedAnswer = selectedAnswers[i];
                            const isAnswered = i in selectedAnswers;

                            return (
                                <div key={i} className={`p-3 rounded-lg border bg-black/30 ${isAnswered ? 'border-[#f5c16c]/40' : 'border-white/10'}`}>
                                    <p className="font-medium text-sm text-white/90 mb-2">
                                        <span className="text-[#f5c16c] mr-1">{i + 1}.</span> {q.question}
                                    </p>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {q.options.map(opt => {
                                            const isSelected = selectedAnswer === opt;
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleSelect(i, opt)}
                                                    disabled={submitted || submitting}
                                                    className={`w-full text-left text-sm px-3 py-1.5 rounded border transition-colors ${
                                                        isSelected
                                                            ? 'bg-[#f5c16c]/20 border-[#f5c16c] text-white'
                                                            : 'bg-black/20 border-white/10 text-white/80 hover:bg-white/5 hover:border-white/20'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmitQuiz}
                        className="w-full bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                        disabled={
                            Object.keys(selectedAnswers).length !== totalQuestions ||
                            submitting ||
                            isActivityComplete
                        }
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Submit Quiz ({Object.keys(selectedAnswers).length}/{totalQuestions})
                            </>
                        )}
                    </Button>
                </>
            ) : (
                <>
                    {/* Result Summary - Show at top after submission */}
                    {quizResult && (
                        <div className={`p-4 rounded-lg border flex items-center justify-between ${
                            quizResult.isPassed
                                ? "bg-emerald-950/30 border-emerald-700/50"
                                : "bg-amber-950/30 border-amber-700/50"
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                                    quizResult.isPassed ? "bg-emerald-500/20" : "bg-amber-500/20"
                                }`}>
                                    {quizResult.isPassed ? (
                                        <Trophy className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-400" />
                                    )}
                                </div>
                                <div>
                                    <p className={`text-xl font-bold ${
                                        quizResult.isPassed ? "text-emerald-300" : "text-amber-300"
                                    }`}>
                                        {quizResult.scorePercentage.toFixed(0)}% - {correctCount}/{totalQuestions} correct
                                    </p>
                                    <p className="text-sm text-white/60">{quizResult.message}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!quizResult.isPassed && (
                                    <Button
                                        onClick={handleRetakeQuiz}
                                        size="sm"
                                        variant="outline"
                                        className="border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                    >
                                        Retake
                                    </Button>
                                )}
                                {quizResult.isPassed && (
                                    <span className="flex items-center gap-1 text-sm text-emerald-400 font-medium">
                                        <CheckCircle className="w-4 h-4" /> Passed
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Answers Review - Compact grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {questions.map((q, i) => {
                            const selectedAnswer = selectedAnswers[i];
                            const correctAnswer = getCorrectAnswer(q);
                            const isCorrect = selectedAnswer === correctAnswer;

                            return (
                                <div key={i} className={`p-3 rounded-lg border ${
                                    isCorrect ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-red-500/30 bg-red-950/20'
                                }`}>
                                    <div className="flex items-start gap-2 mb-2">
                                        {isCorrect ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <p className="text-sm font-medium text-white/90">
                                            <span className="text-white/50 mr-1">{i + 1}.</span> {q.question}
                                        </p>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                        {!isCorrect && (
                                            <p className="text-xs">
                                                <span className="text-red-400">Your answer:</span>{' '}
                                                <span className="text-white/70">{selectedAnswer}</span>
                                            </p>
                                        )}
                                        <p className="text-xs">
                                            <span className="text-emerald-400">Correct:</span>{' '}
                                            <span className="text-white/70">{correctAnswer}</span>
                                        </p>
                                        {q.explanation && (
                                            <p className="text-xs text-white/50 mt-1">
                                                💡 {q.explanation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
