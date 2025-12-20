// roguelearn-web/src/hooks/useSubjectImportProgress.ts
import { useState, useEffect, useRef, useCallback } from "react";
import subjectsApi from "@/api/subjectsApi";
import { SubjectImportJobStatusResponse } from "@/types/curriculum-import";

export interface UseSubjectImportProgressReturn {
  jobId: string | null;
  statusData: SubjectImportJobStatusResponse | null;
  error: string | null;
  isComplete: boolean;
  isRunning: boolean;
  startTracking: (id: string) => void;
  stopTracking: () => void;
  reset: () => void;
}

export function useSubjectImportProgress(): UseSubjectImportProgressReturn {
  const [jobId, setJobId] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<SubjectImportJobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
  // Refs for polling logic to prevent stale closures and manage intervals
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const pollAttemptsRef = useRef(0);
  const firstSuccessfulPollRef = useRef(false);

  const stopTracking = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  const reset = useCallback(() => {
    stopTracking();
    setJobId(null);
    setStatusData(null);
    setError(null);
    setIsComplete(false);
    hasCompletedRef.current = false;
    pollAttemptsRef.current = 0;
    firstSuccessfulPollRef.current = false;
  }, [stopTracking]);

  const startTracking = useCallback((id: string) => {
    // Reset previous state if new ID
    if (id !== jobId) {
      reset();
      setJobId(id);
    }
  }, [jobId, reset]);

  // Polling Effect
  useEffect(() => {
    if (!jobId || hasCompletedRef.current) return;

    const poll = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      pollAttemptsRef.current += 1;

      try {
        const res = await subjectsApi.getImportStatus(jobId);

        if (!res.isSuccess) {
          if (res.is404) {
            // If we've seen success before, 404 means job cleaned up -> success
            if (firstSuccessfulPollRef.current) {
              handleSuccess();
              return;
            }
            // Timeout after 45s of straight 404s (startup delay)
            if (pollAttemptsRef.current > 45) {
              handleError("Import job initialization timed out.");
              return;
            }
            // Job starting up, keep polling
          } else {
            // Other error
            handleError(res.message || "Failed to check import status.");
          }
          isPollingRef.current = false;
          return;
        }

        // Success response
        if (!firstSuccessfulPollRef.current) {
          firstSuccessfulPollRef.current = true;
          pollAttemptsRef.current = 0; // Reset timeout counter
        }

        const data = res.data;
        setStatusData(data);

        if (data.status === "Succeeded" || data.percent === 100) {
          handleSuccess();
          return;
        }

        if (data.status === "Failed") {
          handleError(data.message || "Import failed.");
          return;
        }

        // Check for stuck jobs (processing > 5 mins)
        if (data.status === "Processing" && pollAttemptsRef.current > 300) {
          handleError("Import is taking longer than expected. Please try again later.");
          return;
        }

        isPollingRef.current = false;
      } catch (err) {
        console.error("Polling error:", err);
        isPollingRef.current = false;
      }
    };

    const handleSuccess = () => {
      setIsComplete(true);
      hasCompletedRef.current = true;
      setStatusData((prev) => prev ? { ...prev, percent: 100, message: "Import completed successfully!", status: "Succeeded" } : null);
      stopTracking();
    };

    const handleError = (msg: string) => {
      setError(msg);
      hasCompletedRef.current = true;
      stopTracking();
    };

    // Start immediately
    poll();
    pollingIntervalRef.current = setInterval(poll, 1000);

    return () => stopTracking();
  }, [jobId, stopTracking]);

  return {
    jobId,
    statusData,
    error,
    isComplete,
    isRunning: !!jobId && !isComplete && !error,
    startTracking,
    stopTracking,
    reset
  };
}