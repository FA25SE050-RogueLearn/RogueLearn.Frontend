'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    // ⭐ FIX: Use jobId as key to auto-reset state (React-recommended pattern)
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [jobStatus, setJobStatus] = useState<'Processing' | 'Succeeded' | 'Failed' | null>(null);
    
    // ⭐ Track the current jobId to detect changes
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    
    // ⭐ NEW: Use refs to track polling state and prevent overlapping calls
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingRef = useRef(false);
    const hasCompletedRef = useRef(false);
    const pollAttemptsRef = useRef(0);
    const firstSuccessfulPollRef = useRef(false);

    // ⭐ FIX: Reset state when jobId changes using useEffect (refs can be updated here)
    useEffect(() => {
        if (jobId !== currentJobId && jobId !== null) {
            console.log('🔄 New job detected, resetting state for jobId:', jobId);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentJobId(jobId);
            setProgress(null);
            setError(null);
            setIsCompleted(false);
            setJobStatus(null);
            
            // ✅ Safe to update refs in useEffect
            hasCompletedRef.current = false;
            pollAttemptsRef.current = 0;
            firstSuccessfulPollRef.current = false;
        }
    }, [jobId, currentJobId]);

    // ⭐ UPDATED: Single unified polling function with exponential backoff
    useEffect(() => {
        if (!isOpen || !jobId || hasCompletedRef.current) {
            return;
        }

        console.log('🎯 Modal polling started for jobId:', jobId);
        pollAttemptsRef.current = 0;
        firstSuccessfulPollRef.current = false;

      const pollForUpdates = async () => {
  if (isPollingRef.current) {
    console.log('⏭️ Skipping poll - previous call still in progress');
    return;
  }

  isPollingRef.current = true;
  pollAttemptsRef.current += 1;

  try {
    // ========== STEP 1: Check job status ==========
    const statusResponse = await questApi.checkGenerationStatus(jobId);

    if (!statusResponse.isSuccess) {
      // ⭐ CRITICAL FIX: 404 is EXPECTED and NORMAL during polling
      // Treat it as "job not ready yet, keep polling"
      if (statusResponse.is404) {
        // If we've had a successful poll before, 404 likely means job completed & cleaned up
        if (firstSuccessfulPollRef.current) {
          console.log('✅ Job cleaned up after success - marking complete');
          setJobStatus('Succeeded');
          setIsCompleted(true);
          hasCompletedRef.current = true;
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          setTimeout(() => onComplete(), 500);
          isPollingRef.current = false;
          return;
        }

        // First 45 seconds: treat 404 as "job being created"
        // (job creation delay or backend startup)
        if (pollAttemptsRef.current <= 45) {
          console.log(`⏳ Job not ready yet (attempt ${pollAttemptsRef.current}/45)`);
          isPollingRef.current = false;
          return;
        }

        // After 45 seconds: if we've NEVER seen the job, creation likely failed
        console.error('❌ Job creation timeout - 404s for 45+ seconds');
        setError('Quest generation could not start. Please try again.');
        hasCompletedRef.current = true;
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        isPollingRef.current = false;
        return;
      }

      // ⭐ Other errors (network, 500, etc.) - back off and retry
      console.warn(`⚠️ Non-404 error (status unknown): ${statusResponse.message}`);
      isPollingRef.current = false;
      return;
    }

    // ⭐ Success: First time we've reached the job
    if (!firstSuccessfulPollRef.current) {
      console.log('✅ Job found successfully - beginning progress tracking');
      firstSuccessfulPollRef.current = true;
      pollAttemptsRef.current = 0; // Reset counter after first success
    }

    const status = statusResponse.data?.status as 'Processing' | 'Succeeded' | 'Failed';
    console.log(`📊 Status: ${status}`);
    setJobStatus(status);

    // ========== STEP 2: Handle completion states ==========
    if (status === 'Succeeded') {
      console.log('✅ Generation complete!');
      setIsCompleted(true);
      setError(null);
      hasCompletedRef.current = true;
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      setTimeout(() => onComplete(), 1000);
      isPollingRef.current = false;
      return;
    }

    if (status === 'Failed') {
      console.error('❌ Generation failed');
      setError(statusResponse.data?.error || 'Quest generation failed');
      hasCompletedRef.current = true;

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      isPollingRef.current = false;
      return;
    }

    // ========== STEP 3: Timeout check ==========
    if (status === 'Processing' && firstSuccessfulPollRef.current && pollAttemptsRef.current > 300) {
      console.error('⏱️ Timeout - processing >5 minutes');
      setError('Generation taking too long. Please try again later.');
      hasCompletedRef.current = true;

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      isPollingRef.current = false;
      return;
    }

    // ========== STEP 4: Get progress (non-critical) ==========
    if (status === 'Processing') {
      try {
        const progressResponse = await questApi.getGenerationProgress(jobId);
        
        if (progressResponse.isSuccess && progressResponse.data) {
          setProgress(progressResponse.data);
          setError(null);
        }
      } catch (progressErr) {
        console.warn('⚠️ Progress fetch failed (non-critical)');
        // Don't break the flow - progress is optional
      }
    }

    isPollingRef.current = false;
  } catch (err) {
    console.error('❌ Polling error:', err);
    isPollingRef.current = false;
  }
};

        // Start polling immediately
        pollForUpdates();

        // Then poll every 1 second
        pollingIntervalRef.current = setInterval(pollForUpdates, 1000);

        // ⭐ CLEANUP: Stop polling when modal closes or job completes
        return () => {
            console.log('🛑 Modal polling stopped');
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            isPollingRef.current = false;
            pollAttemptsRef.current = 0;
            firstSuccessfulPollRef.current = false;
        };
    }, [isOpen, jobId, onComplete]);

    // ⭐ REMOVED: No longer needed - state resets during render when jobId changes

    if (!isOpen) return null;

    const displayPercentage = progress?.progressPercentage ?? 0;
    const displayMessage = progress?.message ?? 'Initializing quest generation...';
    const displaySteps = `${progress?.currentStep ?? 0}/${progress?.totalSteps ?? 12}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="relative w-full max-w-lg rounded-3xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-8 shadow-lg">
                {/* Background Effects */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-25 mix-blend-overlay" style={{
                    backgroundImage: 'url(/images/asfalt-dark.png)',
                    backgroundSize: '350px 350px',
                    backgroundRepeat: 'repeat',
                }} />
                <div className="absolute inset-0 rounded-3xl opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.2),_transparent_70%)]" />

                {/* ⭐ NEW: Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/60 hover:bg-black/60 hover:text-white transition-all duration-200"
                    title="Close modal"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

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
                    {isCompleted && !error && (
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

                    {/* ⭐ NEW: Action Buttons (when not completed and no error) */}
                    {!isCompleted && !error && (
                        <div className="space-y-3">
                            {/* Start Anyway Button */}
                            <button
                                onClick={onComplete}
                                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold uppercase tracking-[0.3em] text-xs hover:shadow-lg hover:shadow-[#f5c16c]/50 transition-all duration-300"
                            >
                                Start Quest Anyway
                            </button>

                            {/* Cancel Button */}
                            <button
                                onClick={onClose}
                                className="w-full px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white/80 font-semibold uppercase tracking-[0.3em] text-xs hover:bg-white/10 transition-all duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* ⭐ NEW: Retry Button (on error) */}
                    {error && (
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 rounded-xl border border-red-500/50 bg-red-500/10 text-red-400 font-semibold uppercase tracking-[0.3em] text-xs hover:bg-red-500/20 transition-all duration-300"
                        >
                            Close
                        </button>
                    )}

                    {/* Tips Section */}
                    {!isCompleted && !error && (
                        <div className="text-xs text-white/60 space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                            <p className="font-semibold text-white/70">💡 Tip:</p>
                            <p>Our AI is crafting personalized learning modules tailored to your progress and skills. This typically takes 1-3 minutes.</p>
                            <p className="text-white/50 pt-2">
                                 Can&apos;t wait? Click &quot;Start Quest Anyway&quot; to begin immediately. Content will load as it&apos;s generated.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuestGenerationModal;