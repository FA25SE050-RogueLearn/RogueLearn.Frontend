// roguelearn-web/src/contexts/SubjectImportContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useSubjectImportProgress } from "@/hooks/useSubjectImportProgress";
import { SubjectImportModal } from "@/components/admin/subjects/SubjectImportModal";
import { ImportProgressWidget } from "@/components/admin/subjects/ImportProgressWidget";
import subjectsApi from "@/api/subjectsApi";
import { toast } from "sonner";

interface SubjectImportContextType {
    startImport: (rawText: string, semester: number) => Promise<boolean>;
    isImporting: boolean; // True if API call in progress
}

const SubjectImportContext = createContext<SubjectImportContextType | undefined>(undefined);

export function SubjectImportProvider({ children }: { children: ReactNode }) {
    // Local state for the initial API call
    const [isImporting, setIsImporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use the progress hook logic
    const {
        jobId,
        statusData,
        error: jobError,
        isComplete: isJobComplete,
        isRunning,
        startTracking,
        reset: resetJob
    } = useSubjectImportProgress();

    const startImport = useCallback(async (rawText: string, semester: number) => {
        setIsImporting(true);
        try {
            const res = await subjectsApi.importFromText(rawText, semester);

            if (res.isSuccess && res.data?.jobId) {
                startTracking(res.data.jobId);
                setIsModalOpen(true);
                return true;
            } else {
                throw new Error(res.message || "Failed to start import job");
            }
        } catch (error: any) {
            toast.error(`Import failed: ${error.message || 'Unknown error'}`);
            return false;
        } finally {
            setIsImporting(false);
        }
    }, [startTracking]);

    const handleCloseModal = () => {
        // If complete or error, we reset. If running, we minimize (handled by onMinimize).
        if (isJobComplete || jobError) {
            resetJob();
        }
        setIsModalOpen(false);
    };

    const handleMinimize = () => {
        setIsModalOpen(false);
    };

    const handleMaximize = () => {
        setIsModalOpen(true);
    };

    const handleComplete = () => {
        setIsModalOpen(false);
        resetJob();
        // Dispatch event to refresh grids
        window.dispatchEvent(new Event("subject-import-completed"));
        // ⭐ Added Toast
        toast.success("Subject imported successfully!");
    };

    return (
        <SubjectImportContext.Provider value={{ startImport, isImporting }}>
            {children}

            {/* Global Modal */}
            <SubjectImportModal
                isOpen={isModalOpen}
                jobId={jobId}
                statusData={statusData}
                error={jobError}
                isComplete={isJobComplete}
                onMinimize={handleMinimize}
                onClose={handleCloseModal}
                onComplete={handleComplete}
            />

            {/* Global Widget (Visible when running but modal closed) */}
            <ImportProgressWidget
                isVisible={isRunning && !isModalOpen}
                percent={statusData?.percent ?? 0}
                message={statusData?.message ?? "Processing..."}
                isComplete={isJobComplete}
                hasError={!!jobError}
                onMaximize={handleMaximize}
            />
        </SubjectImportContext.Provider>
    );
}

export function useSubjectImport() {
    const context = useContext(SubjectImportContext);
    if (!context) {
        throw new Error("useSubjectImport must be used within a SubjectImportProvider");
    }
    return context;
}