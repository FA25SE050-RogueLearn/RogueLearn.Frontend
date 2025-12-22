// roguelearn-web/src/components/profile/AcademicRecordModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, TrendingUp, Zap, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useUserFullInfo } from "@/hooks/queries/useUserData";
import { useRouter } from "next/navigation";

interface AcademicRecordModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AcademicRecordModal({ isOpen, onOpenChange }: AcademicRecordModalProps) {
    const { data: fullInfo, isLoading } = useUserFullInfo();
    const router = useRouter();

    const [hasGrades, setHasGrades] = useState(false);
    const [gpa, setGpa] = useState<number | null>(null);
    const [lastSynced, setLastSynced] = useState<string | null>(null);

    useEffect(() => {
        if (fullInfo) {
            const hasAnyGrades = fullInfo.relations?.studentTermSubjects?.some(s => s.grade) || false;
            const enrollment = fullInfo.relations?.studentEnrollments?.[0];

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasGrades(hasAnyGrades);

            // Note: GPA would typically come from a specific field if available.
            // For now we assume if they have grades, they are synced.
            if (enrollment) {
                // Placeholder for actual GPA if available in future API updates
                // setGpa(...) 
                // Using enrollment date as proxy for last sync if specific timestamp unavailable
                setLastSynced(enrollment.enrollmentDate);
            }
        }
    }, [fullInfo]);

    const handleSyncClick = () => {
        onOpenChange(false);
        router.push("/onboarding/connect-fap");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-[#f5c16c]" />
                        Academic Record
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        Manage your academic data synchronization and status.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!hasGrades ? (
                        // First-time sync prompt
                        <div className="space-y-4">
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-amber-300">Sync Required</h4>
                                        <p className="text-xs text-white/70 mt-1">
                                            Your academic record has not been synced yet. Connect your FAP account to unlock full features.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">Benefits of Syncing</p>
                                <div className="grid gap-2">
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <Zap className="w-4 h-4 text-emerald-400" />
                                        <span>Earn XP based on your grades</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <TrendingUp className="w-4 h-4 text-[#f5c16c]" />
                                        <span>Get personalized difficulty recommendations</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <GraduationCap className="w-4 h-4 text-[#7289da]" />
                                        <span>Track academic progress alongside quests</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Status for synced users
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Status</p>
                                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
                                        <CheckCircle2 className="w-4 h-4" /> Synced
                                    </div>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Last Updated</p>
                                    <p className="text-white font-medium">
                                        {lastSynced ? new Date(lastSynced).toLocaleDateString() : 'Unknown'}
                                    </p>
                                </div>
                            </div>

                            {gpa !== null && (
                                <div className="rounded-lg border border-[#f5c16c]/20 bg-[#f5c16c]/10 p-4 flex justify-between items-center">
                                    <span className="text-sm font-medium text-[#f5c16c]">Current GPA</span>
                                    <span className="text-2xl font-bold text-white">{gpa.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="text-xs text-white/60 bg-black/20 p-3 rounded-lg">
                                <p>Tip: Re-sync whenever your semester grades are updated to claim new XP rewards.</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:justify-between sm:flex-row gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/60 hover:text-white">
                        Close
                    </Button>
                    <Button onClick={handleSyncClick} className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:shadow-lg hover:shadow-[#f5c16c]/20">
                        {hasGrades ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" /> Update Records
                            </>
                        ) : (
                            <>
                                <GraduationCap className="mr-2 h-4 w-4" /> Connect FAP
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}