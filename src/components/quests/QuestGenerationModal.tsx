'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import questApi from '@/api/questApi';

interface QuestGenerationModalProps {
    isOpen: boolean;
    jobId: string | null;
    questTitle: string;
    onClose: () => void;
    onComplete: () => void;
}

interface ProgressData {
    currentStep: number;
    totalSteps: number;
    message: string;
    progressPercentage: number;
    updatedAt: string;
}

export function QuestGenerationModal({
    isOpen,
    jobId,
    questTitle,
    onClose,
    onComplete,
}: QuestGenerationModalProps) {
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    // Poll for progress updates
    useEffect(() => {
        if (!isOpen || !jobId) return;

        const pollProgress = async () => {
            try {
                // ⭐ FIXED: Use questApi.getGenerationProgress() instead of fetch
                const response = await questApi.getGenerationProgress(jobId);

                if (response.isSuccess && response.data) {
                    setProgress(response.data);
                    setError(null);

                    // Check if 100% complete
                    if (response.data.progressPercentage >= 100) {
                        setIsCompleted(true);
                        // Auto-complete after 1 second
                        setTimeout(() => {
                            onComplete();
                        }, 1000);
                    }
                } else {
                    // No progress yet or error, keep polling
                    if (response.message) {
                        console.warn('Progress fetch warning:', response.message);
                    }
                }
            } catch (err) {
                console.error('Error fetching progress:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch progress');
            }
        };

        // Poll every 500ms for smooth updates
        const interval = setInterval(pollProgress, 500);
        // Initial poll
        pollProgress();

        return () => clearInterval(interval);
    }, [isOpen, jobId, onComplete]);

    if (!isOpen) return null;

    const displayPercentage = progress?.progressPercentage ?? 0;
    const displayMessage = progress?.message ?? 'Initializing quest generation...';
    const displaySteps = `${progress?.currentStep ?? 0}/${progress?.totalSteps ?? 12}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="w-full max-w-lg rounded-3xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-8 shadow-lg">
                {/* Background Effects */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-25 mix-blend-overlay" style={{
                    backgroundImage: 'url(/images/asfalt-dark.png)',
                    backgroundSize: '350px 350px',
                    backgroundRepeat: 'repeat',
                }} />
                <div className="absolute inset-0 rounded-3xl opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.2),_transparent_70%)]" />

                {/* Content */}
                <div className="relative z-10 space-y-8">
                    {/* Header */}
                    <div className="space-y-2 text-center">
                        <div className="flex justify-center mb-4">
                            {isCompleted ? (
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                </div>
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5c16c] to-[#d4a855] shadow-lg animate-pulse">
                                    <Sparkles className="h-8 w-8 text-black" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-semibold text-white">
                            {isCompleted ? 'Quest Forged!' : 'Forging Quest...'}
                        </h2>
                        <p className="text-sm text-white/70">
                            {questTitle}
                        </p>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-[0.3em] text-white/60">Progress</span>
                                <span className="text-sm font-semibold text-[#f5c16c]">
                                    {displayPercentage}%
                                </span>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
                                <div
                                    className="h-full bg-gradient-to-r from-[#f5c16c] to-[#d4a855] transition-all duration-500 ease-out rounded-full shadow-lg"
                                    style={{ width: `${displayPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Step Counter */}
                        <div className="text-center">
                            <p className="text-xs text-white/60 uppercase tracking-[0.3em]">
                                Week {displaySteps}
                            </p>
                        </div>

                        {/* Current Message */}
                        <div className="rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-4">
                            <p className="text-sm text-white/90 font-medium text-center">
                                {displayMessage}
                            </p>
                        </div>

                        {/* Activity Animation */}
                        {!isCompleted && (
                            <div className="flex items-center justify-center gap-2 text-xs text-white/70">
                                <Loader2 className="h-3 w-3 animate-spin text-[#f5c16c]" />
                                <span>Generating learning modules...</span>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-[#f5c16c]/10 bg-[#f5c16c]/5 p-3 text-center">
                            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Weeks</p>
                            <p className="text-lg font-semibold text-[#f5c16c]">
                                {progress?.totalSteps ?? 12}
                            </p>
                        </div>
                        <div className="rounded-lg border border-[#f5c16c]/10 bg-[#f5c16c]/5 p-3 text-center">
                            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Progress</p>
                            <p className="text-lg font-semibold text-[#f5c16c]">
                                {progress?.currentStep ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg border border-[#f5c16c]/10 bg-[#f5c16c]/5 p-3 text-center">
                            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Complete</p>
                            <p className="text-lg font-semibold text-[#f5c16c]">
                                {displayPercentage}%
                            </p>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-400">Generation Error</p>
                                <p className="text-xs text-red-300/70">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Completion Message */}
                    {isCompleted && (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-emerald-400/50 bg-emerald-400/10 p-4 text-center">
                                <p className="text-sm font-semibold text-emerald-300">
                                    ✨ Your quest is ready to begin!
                                </p>
                            </div>

                            <button
                                onClick={onComplete}
                                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold uppercase tracking-[0.3em] text-xs hover:shadow-lg hover:shadow-[#f5c16c]/50 transition-all duration-300"
                            >
                                Start Quest
                            </button>
                        </div>
                    )}

                    {/* Tips Section */}
                    {!isCompleted && (
                        <div className="text-xs text-white/60 space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                            <p className="font-semibold text-white/70">💡 Tip:</p>
                            <p>Our AI is crafting personalized learning modules tailored to your progress and skills. This typically takes 1-3 minutes.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuestGenerationModal;