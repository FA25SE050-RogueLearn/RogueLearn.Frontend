// roguelearn-web/src/components/dashboard/UpdateGradeDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { updateSubjectGrade } from "@/api/usersApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define a minimal interface for the subject data needed by this dialog
interface EditableSubject {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    grade?: string | null;
    status?: string; // Add status to interface
}

interface UpdateGradeDialogProps {
    // Accept any object that satisfies the EditableSubject interface
    subject: EditableSubject | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function UpdateGradeDialog({ subject, isOpen, onClose, onSuccess }: UpdateGradeDialogProps) {
    const [grade, setGrade] = useState<string>("");
    const [status, setStatus] = useState<string>("Passed");
    const [saving, setSaving] = useState(false);

    // Update local state if the selected subject changes
    useEffect(() => {
        if (subject) {
            setGrade(subject.grade || "");
            // Default to existing status, or infer 'Passed' if grade >= 5, else 'NotPassed' if null
            const initialStatus = subject.status === "Passed" || subject.status === "NotPassed"
                ? subject.status
                : (subject.grade && parseFloat(subject.grade) >= 5.0 ? "Passed" : "NotPassed");
            setStatus(initialStatus);
        }
    }, [subject]);

    const handleSave = async () => {
        if (!subject) return;

        const gradeValue = parseFloat(grade);
        if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
            toast.error("Please enter a valid grade between 0 and 10.");
            return;
        }

        setSaving(true);
        try {
            // Pass both grade and explicit status
            const res = await updateSubjectGrade({
                subjectId: subject.subjectId,
                grade: gradeValue,
                status: status
            });

            if (res.isSuccess) {
                toast.success(`Grade for ${subject.subjectCode} updated successfully.`);
                onSuccess();
                onClose();
            } else {
                toast.error(res.message || "Failed to update grade.");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred.");
        } finally {
            setSaving(false);
        }
    };

    if (!subject) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        Update Grade: <span className="text-[#f5c16c] font-mono">{subject.subjectCode}</span>
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        Manually update your grade and status. This will recalculate XP and adjust quest difficulty.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="grade" className="text-right text-white/70">
                            Grade
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="grade"
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="bg-[#0a0506] border-[#f5c16c]/30 text-white"
                                placeholder="0.0 - 10.0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right text-white/70">
                            Status
                        </Label>
                        <div className="col-span-3">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="bg-[#0a0506] border-[#f5c16c]/30 text-white">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1410] border-[#f5c16c]/30 text-white">
                                    <SelectItem value="Passed">Passed</SelectItem>
                                    <SelectItem value="NotPassed">Not Passed (Failed)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-white/40 mt-1.5 ml-1">
                                Note: Selecting &apos;Not Passed&apos; will trigger supportive/retake difficulty even if the grade is high (e.g. attendance failure).
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-[#f5c16c]/30 text-white/70 hover:text-white hover:bg-[#f5c16c]/10">Cancel</Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}