"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Sparkles, AlertCircle, CheckCircle2, Target } from "lucide-react";
import { AnalysisReport } from "@/types/student";

interface AnalysisReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: AnalysisReport;
}

export function AnalysisReportModal({ isOpen, onClose, report }: AnalysisReportModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-[#f5c16c]/30 bg-gradient-to-br from-[#1a0a08]/98 via-[#2d1810]/98 to-black/98 shadow-2xl">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,193,108,0.08),transparent_60%)]" />
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                        backgroundSize: "100px",
                    }}
                />

                <DialogHeader className="relative z-10 space-y-3 pb-4 border-b border-[#f5c16c]/20">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5c16c]/20 border border-[#f5c16c]/40">
                            <Sparkles className="h-6 w-6 text-[#f5c16c]" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-white">Your Academic Profile</DialogTitle>
                            <p className="text-sm text-white/60">Personalized analysis based on your performance</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="relative z-10 space-y-6 pt-6">
                    {/* Student Persona */}
                    <div className="rounded-2xl border border-[#7289da]/30 bg-[#7289da]/10 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7289da]/20 border border-[#7289da]/40 shrink-0">
                                <Target className="h-5 w-5 text-[#7289da]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-[#7289da] mb-1">Your Learning Persona</h3>
                                <p className="text-sm text-white/80 leading-relaxed">{report.studentPersona}</p>
                            </div>
                        </div>
                    </div>

                    {/* Strong Areas */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                            <h3 className="text-sm font-semibold text-emerald-400">Your Strengths</h3>
                        </div>
                        <div className="space-y-2">
                            {report.strongAreas.map((area, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-white/80">{area}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weak Areas */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-amber-400" />
                            <h3 className="text-sm font-semibold text-amber-400">Areas for Growth</h3>
                        </div>
                        <div className="space-y-2">
                            {report.weakAreas.map((area, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3"
                                >
                                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-white/80">{area}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-2xl border border-[#f5c16c]/30 bg-gradient-to-br from-[#f5c16c]/10 to-[#d23187]/10 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5c16c]/20 border border-[#f5c16c]/40 shrink-0">
                                <Sparkles className="h-5 w-5 text-[#f5c16c]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-[#f5c16c] mb-2">Personalized Recommendations</h3>
                                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                                    {report.recommendations}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-white/60 text-center">
                            This analysis helps us customize your learning experience, recommend appropriate challenge levels, and generate quests that match your skill development needs.
                        </p>
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={onClose}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-[#1a0b08] font-semibold hover:shadow-lg hover:shadow-[#d23187]/30"
                    >
                        Continue to Skills
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}