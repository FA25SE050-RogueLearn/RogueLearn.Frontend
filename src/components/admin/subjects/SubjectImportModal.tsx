// roguelearn-web/src/components/admin/subjects/SubjectImportModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Loader2,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    FileText,
    Search,
    Database,
    BrainCircuit,
    X,
} from "lucide-react";
import subjectsApi from "@/api/subjectsApi";
import { SubjectImportJobStatusResponse } from "@/types/curriculum-import";

interface SubjectImportModalProps {
    isOpen: boolean;
    jobId: string | null;
    onClose: () => void;
    onComplete: () => void;
}

export function SubjectImportModal({
    isOpen,
    jobId,
    onClose,
    onComplete,
}: SubjectImportModalProps) {
    const [statusData, setStatusData] = useState<SubjectImportJobStatusResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingRef = useRef(false);
    const hasCompletedRef = useRef(false);
    const pollAttemptsRef = useRef(0);
    const firstSuccessfulPollRef = useRef(false);

    // Reset state on new job
    useEffect(() => {
        if (jobId !== currentJobId && jobId !== null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentJobId(jobId);
            setStatusData(null);
            setError(null);
            setIsCompleted(false);
            hasCompletedRef.current = false;
            pollAttemptsRef.current = 0;
            firstSuccessfulPollRef.current = false;
        }
    }, [jobId, currentJobId]);

    // Polling logic
    useEffect(() => {
        if (!isOpen || !jobId || hasCompletedRef.current) return;

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
                        // Timeout after 45s of straight 404s
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
            setIsCompleted(true);
            hasCompletedRef.current = true;
            setStatusData((prev) => prev ? { ...prev, percent: 100, message: "Import completed successfully!" } : null);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            isPollingRef.current = false;
            // Auto-complete after delay
            setTimeout(() => onComplete(), 1500);
        };

        const handleError = (msg: string) => {
            setError(msg);
            hasCompletedRef.current = true;
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            isPollingRef.current = false;
        };

        poll();
        pollingIntervalRef.current = setInterval(poll, 1000);

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            isPollingRef.current = false;
        };
    }, [isOpen, jobId, onComplete]);

    if (!isOpen) return null;

    const percent = statusData?.percent ?? 0;
    const message = statusData?.message ?? "Initializing import...";

    // Dynamic icon based on progress stage
    const getStageIcon = () => {
        if (percent < 20) return <FileText className="w-8 h-8 text-[#f5c16c] animate-pulse" />; // Cleaning/Parsing
        if (percent < 40) return <BrainCircuit className="w-8 h-8 text-[#f5c16c] animate-pulse" />; // Generating Questions
        if (percent < 80) return <Search className="w-8 h-8 text-[#f5c16c] animate-pulse" />; // Enriching/Search
        if (percent < 100) return <Database className="w-8 h-8 text-[#f5c16c] animate-pulse" />; // Saving
        return <CheckCircle2 className="w-12 h-12 text-emerald-400" />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-3xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] p-8 shadow-2xl">
                {/* Background Effects */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-25 mix-blend-overlay" style={{ backgroundImage: 'url(/images/asfalt-dark.png)' }} />
                <div className="absolute inset-0 rounded-3xl opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.2),_transparent_70%)]" />

                {/* Close Button (visible only if error or completed to prevent interrupting) */}
                {(error || isCompleted) && (
                    <button onClick={onClose} className="absolute top-4 right-4 z-20 text-white/40 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    {/* Icon Area */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5c16c]/20 to-[#d4a855]/10 shadow-lg border border-[#f5c16c]/30">
                        {error ? <AlertCircle className="w-10 h-10 text-rose-400" /> : getStageIcon()}
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">
                            {error ? "Import Failed" : isCompleted ? "Subject Imported!" : "Importing Subject"}
                        </h2>
                        <p className="text-sm text-white/60 min-h-[20px]">
                            {error || message}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    {!error && !isCompleted && (
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-xs uppercase tracking-wider text-white/40">
                                <span>Progress</span>
                                <span>{percent}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-[#f5c16c] to-[#d4a855] transition-all duration-500 ease-out"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-white/30 pt-1">
                                AI is processing your syllabus. This typically takes 30-60 seconds.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    {(error || isCompleted) && (
                        <button
                            onClick={error ? onClose : onComplete}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:shadow-lg hover:shadow-[#f5c16c]/20 transition-all"
                        >
                            {error ? "Close" : "Done"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}