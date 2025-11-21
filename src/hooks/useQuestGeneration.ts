// roguelearn-web/src/hooks/useQuestGeneration.ts
// NEW FILE: Custom hook for managing quest step generation with polling

import { useState, useCallback, useRef } from 'react';
import questApi from '@/api/questApi';

interface UseQuestGenerationReturn {
  isGenerating: boolean;
  status: 'idle' | 'generating' | 'completed' | 'failed';
  jobId: string | null;
  error: string | null;
  startGeneration: (questId: string) => Promise<string | null>;
  checkStatus: (jobId: string) => Promise<'Processing' | 'Succeeded' | 'Failed' | null>;
  resetState: () => void;
}

/**
 * Custom hook to manage quest step generation with polling.
 * Handles scheduling background job and polling for completion.
 * 
 * Usage:
 * const { isGenerating, status, jobId, error, startGeneration, checkStatus } = useQuestGeneration();
 * 
 * // Start generation
 * const newJobId = await startGeneration(questId);
 * 
 * // Poll for status
 * const jobStatus = await checkStatus(newJobId);
 */
export function useQuestGeneration(): UseQuestGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start quest step generation.
   * Returns jobId for polling, or null if failed.
   */
  const startGeneration = useCallback(async (questId: string): Promise<string | null> => {
    setIsGenerating(true);
    setStatus('generating');
    setError(null);

    try {
      const result = await questApi.generateQuestSteps(questId);

      if (!result.isSuccess) {
        const errorMessage = result.message || 'Failed to start generation';
        setError(errorMessage);
        setStatus('failed');
        setIsGenerating(false);
        console.error('❌ Generation failed:', errorMessage);
        return null;
      }

      // Extract jobId from response
      const newJobId = result.data?.jobId;
      if (!newJobId) {
        const errorMessage = 'No job ID returned from server';
        setError(errorMessage);
        setStatus('failed');
        setIsGenerating(false);
        console.error('❌ No jobId:', errorMessage);
        return null;
      }

      setJobId(newJobId);
      console.log('✅ Generation started with jobId:', newJobId);
      return newJobId;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      setStatus('failed');
      setIsGenerating(false);
      console.error('❌ Exception during generation start:', err);
      return null;
    }
  }, []);

  /**
   * Check job status (single check).
   * Returns status or null if error.
   */
  const checkStatus = useCallback(async (id: string): Promise<'Processing' | 'Succeeded' | 'Failed' | null> => {
    try {
      const result = await questApi.checkGenerationStatus(id);

      if (!result.isSuccess) {
        const errorMessage = result.message || 'Failed to check status';
        setError(errorMessage);
        console.error('❌ Status check failed:', errorMessage);
        return null;
      }

      const jobStatus = result.data?.status as 'Processing' | 'Succeeded' | 'Failed' | null;
      console.log(`📊 Job ${id} status:`, jobStatus);

      if (jobStatus === 'Succeeded') {
        setStatus('completed');
        setIsGenerating(false);
        setError(null);
      } else if (jobStatus === 'Failed') {
        setStatus('failed');
        setIsGenerating(false);
        setError(result.data?.error || 'Job failed');
      }

      return jobStatus;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to check status';
      setError(errorMessage);
      console.error('❌ Exception during status check:', err);
      return null;
    }
  }, []);

  /**
   * Reset state to initial values.
   */
  const resetState = useCallback(() => {
    setIsGenerating(false);
    setStatus('idle');
    setJobId(null);
    setError(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  return {
    isGenerating,
    status,
    jobId,
    error,
    startGeneration,
    checkStatus,
    resetState,
  };
}