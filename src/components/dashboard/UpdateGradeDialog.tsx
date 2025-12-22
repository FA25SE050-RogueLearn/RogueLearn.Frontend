// roguelearn-web/src/components/dashboard/UpdateGradeDialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateSubjectGrade } from "@/api/usersApi";

// Define a minimal interface for the subject data needed by this dialog
interface EditableSubject {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    grade?: string | null;
}

interface UpdateGradeDialogProps {
    // Accept any object that satisfies the EditableSubject interface
    subject: EditableSubject | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function UpdateGradeDialog({ subject, isOpen, onClose, onSuccess }: UpdateGradeDialogProps) {
    const [grade, setGrade] = useState<string>(subject?.grade || "");
    const [saving, setSaving] = useState(false);

    // Update local state if the selected subject changes
    useState(() => {
        if (subject) {
            setGrade(subject.grade || "");
        }
    });

    const handleSave = async () => {
        if (!subject) return;

        const gradeValue = parseFloat(grade);
        if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
            toast.error("Please enter a valid grade between 0 and 10.");
            return;
        }

        setSaving(true);
        try {
            const res = await updateSubjectGrade(subject.subjectId, { grade: gradeValue.toFixed(1) });
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
            <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30">
                <DialogHeader>
                    <DialogTitle className="text-white">{subject.subjectCode} - {subject.subjectName}</DialogTitle>
                    <DialogDescription className="text-white/60">Update your grade for this subject. This will recalculate XP and quest recommendations.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="grade" className="text-white/70">Grade (0-10)</Label>
                    <Input
                        id="grade"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="bg-[#0a0506] border-[#f5c16c]/30"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-[#f5c16c]/30 text-white/70 hover:text-white">Cancel</Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Grade
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}