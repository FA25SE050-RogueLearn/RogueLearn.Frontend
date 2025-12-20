// roguelearn-web/src/components/admin/subjects/SubjectImportModal.tsx
"use client";

import React from "react";
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    FileText,
    Search,
    Database,
    BrainCircuit,
    Minus,
    Check,
    X
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SubjectImportJobStatusResponse } from "@/types/curriculum-import";

interface SubjectImportModalProps {
    isOpen: boolean;
    jobId: string | null;
    statusData: SubjectImportJobStatusResponse | null;
    error: string | null;
    isComplete: boolean;
    onMinimize: () => void;
    onClose: () => void;
    onComplete: () => void;
}

const STEPS = [
    { label: "Analyzing Syllabus", min: 0, max: 20, icon: FileText },
    { label: "Generating Questions", min: 20, max: 45, icon: BrainCircuit },
    { label: "Enriching Content", min: 45, max: 80, icon: Search },
    { label: "Finalizing Data", min: 80, max: 99, icon: Database },
    { label: "Done", min: 100, max: 100, icon: CheckCircle2 },
];

export function SubjectImportModal({
    isOpen,
    statusData,
    error,
    isComplete,
    onMinimize,
    onClose,
    onComplete,
}: SubjectImportModalProps) {
    if (!isOpen) return null;

    const percent = statusData?.percent ?? 0;
    const message = statusData?.message ?? "Initializing import...";

    // Calculate active step index
    const currentStepIndex = STEPS.findIndex(s => percent >= s.min && percent < s.max);
    const activeIndex = currentStepIndex === -1 ? (percent >= 100 ? STEPS.length - 1 : 0) : currentStepIndex;

    // Determine stage icon
    const getStageIcon = () => {
        if (percent < 20) return <FileText className="w-8 h-8 text-[#f5c16c] animate-pulse" />;
        if (percent < 40) return <BrainCircuit className="w-8 h-8 text-[#f5c16c] animate-pulse" />;
        if (percent < 80) return <Search className="w-8 h-8 text-[#f5c16c] animate-pulse" />;
        if (percent < 100) return <Database className="w-8 h-8 text-[#f5c16c] animate-pulse" />;
        return <CheckCircle2 className="w-12 h-12 text-emerald-400" />;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onMinimize()}>
            <DialogContent className="max-w-xl bg-[#0a0506] border-[#f5c16c]/20 p-0 overflow-hidden shadow-2xl">
                {/* Header with Minimize Action */}
                <div className="flex items-center justify-between border-b border-[#f5c16c]/10 bg-[#1a0b08]/50 px-6 py-4">
                    <h2 className="text-lg font-bold text-white">Subject Import</h2>
                    {!isComplete && !error && (
                        <button
                            onClick={onMinimize}
                            className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-wider"
                        >
                            <Minus className="w-4 h-4" /> Minimize
                        </button>
                    )}
                </div>

                <div className="p-8">
                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">

                        {/* Status Icon */}
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-full blur-xl ${error ? "bg-red-500/20" : isComplete ? "bg-emerald-500/20" : "bg-[#f5c16c]/20"}`} />
                            <div className={`relative flex h-24 w-24 items-center justify-center rounded-2xl border shadow-lg ${error ? "border-red-500/30 bg-red-950/30" :
                                    isComplete ? "border-emerald-500/30 bg-emerald-950/30" :
                                        "border-[#f5c16c]/30 bg-[#1a0b08]"
                                }`}>
                                {error ? (
                                    <AlertCircle className="w-10 h-10 text-red-400" />
                                ) : isComplete ? (
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                                ) : (
                                    getStageIcon()
                                )}
                            </div>
                        </div>

                        {/* Message Area */}
                        <div className="space-y-2 max-w-sm">
                            <h3 className="text-xl font-bold text-white">
                                {error ? "Import Failed" : isComplete ? "Import Successful!" : "Processing Syllabus"}
                            </h3>
                            <p className="text-sm text-white/60 min-h-[40px]">
                                {error || message}
                            </p>
                        </div>

                        {/* Progress Stepper */}
                        {!error && (
                            <div className="w-full space-y-6 bg-white/5 rounded-xl p-6 border border-white/5">
                                <div className="relative flex justify-between">
                                    {/* Connector Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2" />

                                    {STEPS.map((step, idx) => {
                                        const isActive = idx === activeIndex;
                                        const isPassed = idx < activeIndex;
                                        const StepIcon = step.icon;

                                        return (
                                            <div key={step.label} className="flex flex-col items-center gap-3">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 z-10 ${isActive ? "border-[#f5c16c] bg-[#1a0b08] scale-110" :
                                                        isPassed ? "border-emerald-500 bg-emerald-500 text-black" :
                                                            "border-white/10 bg-[#0a0506] text-white/20"
                                                    }`}>
                                                    {isPassed ? <Check className="w-4 h-4" /> : <StepIcon className={`w-3.5 h-3.5 ${isActive ? "text-[#f5c16c]" : ""}`} />}
                                                </div>
                                                <span className={`text-[10px] font-medium uppercase tracking-wide transition-colors ${isActive ? "text-[#f5c16c]" :
                                                        isPassed ? "text-emerald-500" :
                                                            "text-white/20"
                                                    }`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Percentage Bar */}
                                {!isComplete && (
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#f5c16c] to-[#d4a855] transition-all duration-500 ease-out"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        {(error || isComplete) && (
                            <button
                                onClick={error ? onClose : onComplete}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:shadow-lg hover:shadow-[#f5c16c]/20 transition-all"
                            >
                                {error ? "Close" : "Done"}
                            </button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}