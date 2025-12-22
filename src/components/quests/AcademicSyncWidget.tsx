// roguelearn-web/src/components/quests/AcademicSyncWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, GraduationCap, TrendingUp, Zap, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface AcademicSyncWidgetProps {
    currentGpa?: number | null;
    lastSyncedAt?: string | null;
    hasAnyGrades: boolean;
}

export function AcademicSyncWidget({ currentGpa, lastSyncedAt, hasAnyGrades }: AcademicSyncWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Auto-expand on first visit if no grades
    useEffect(() => {
        if (!hasAnyGrades && typeof window !== 'undefined') {
            const hasSeenWidget = sessionStorage.getItem('has-seen-sync-widget');
            if (!hasSeenWidget) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsExpanded(true);
                sessionStorage.setItem('has-seen-sync-widget', 'true');
            }
        }
    }, [hasAnyGrades]);

    // If minimized, show compact floating circle button
    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => {
                        setIsMinimized(false);
                        setIsExpanded(false);
                    }}
                    size="lg"
                    className="rounded-full h-16 w-16 shadow-2xl bg-[#7289da] hover:bg-[#5b6eae] hover:shadow-[#7289da]/50 transition-all p-0"
                >
                    <GraduationCap className="w-7 h-7 text-white" />
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]">
            <Card className="relative overflow-hidden rounded-2xl border border-[#7289da]/30 bg-gradient-to-br from-[#1a1410]/95 via-[#2d1810]/95 to-black/95 shadow-2xl backdrop-blur-xl">
                {/* Background Pattern */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                        backgroundSize: "100px",
                    }}
                />

                {/* Glow effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(114,137,218,0.15),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,193,108,0.1),transparent_60%)]" />

                {/* Header - Always visible */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="relative z-10 w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7289da]/20 border border-[#7289da]/30">
                            <GraduationCap className="w-5 h-5 text-[#7289da]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Academic Sync</p>
                            {hasAnyGrades && (
                                <p className="text-xs text-emerald-400">Synced</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-white/60" />
                        ) : (
                            <ChevronUp className="w-5 h-5 text-white/60" />
                        )}
                    </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="relative z-10 border-t border-[#7289da]/20 p-4 space-y-4">
                        {!hasAnyGrades ? (
                            // First-time sync prompt
                            <>
                                <div className="space-y-2">
                                    <p className="text-xs text-white/70">
                                        Sync your FAP transcript to unlock:
                                    </p>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                                            <Zap className="w-3.5 h-3.5" />
                                            <span>Earn XP based on your grades</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[#f5c16c]">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            <span>Get personalized difficulty recommendations</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[#7289da]">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            <span>Track academic progress alongside quests</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    className="w-full bg-gradient-to-r from-[#7289da] to-[#5b6eae] hover:shadow-lg hover:shadow-[#7289da]/30 text-white font-medium"
                                >
                                    <Link href="/onboarding/connect-fap">
                                        Sync FAP Records
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            // Update sync for existing users
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <p className="text-xs text-emerald-400 font-medium">Records synced successfully</p>
                                    </div>
                                    {lastSyncedAt && (
                                        <p className="text-xs text-white/50">
                                            Last updated: {new Date(lastSyncedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-1.5">
                                    <p className="text-xs text-white/70">
                                        Got new grades? Update your records to:
                                    </p>
                                    <ul className="text-xs text-white/60 space-y-1 pl-3">
                                        <li>• Earn more XP from recent performance</li>
                                        <li>• Update your skill levels</li>
                                        <li>• Refresh personalized recommendations</li>
                                    </ul>
                                </div>

                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-[#7289da]/50 text-[#7289da] hover:bg-[#7289da]/10"
                                >
                                    <Link href="/onboarding/connect-fap">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Update Records
                                    </Link>
                                </Button>
                            </>
                        )}

                        {/* Minimize Button */}
                        <button
                            onClick={() => {
                                setIsMinimized(true);
                                setIsExpanded(false);
                            }}
                            className="w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors py-1"
                        >
                            Minimize
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
}